import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
  AxiosProgressEvent,
} from "axios";

export interface ApiError {
  status: number | null;
  message: string;
  errors: Record<string, string[]> | null;
  data: unknown;
  isNetworkError: boolean;
  isServerError: boolean;
  isClientError: boolean;
}

export interface RefreshTokenResponse {
  access_token: string;
  refresh_token?: string;
}

interface ExtendedAxiosRequestConfig extends InternalAxiosRequestConfig {
  metadata?: { startTime: number };
  __retryCount?: number;
  __isRetryAfterRefresh?: boolean;
}

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.example.com";
const TIMEOUT = 15_000;
const MAX_RETRY = 3;
const RETRY_DELAY = 1_000;
const RETRY_STATUS_CODES: number[] = [408, 429, 500, 502, 503, 504];

const ACCESS_TOKEN_COOKIE = "access_token";
const REFRESH_TOKEN_COOKIE = "refresh_token";

interface CookieOptions {
  days?: number;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
}

export const CookieService = {
  get(name: string): string | null {
    const match = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${name}=`));
    return match ? decodeURIComponent(match.split("=")[1]) : null;
  },

  set(name: string, value: string, options: CookieOptions = {}): void {
    const { days = 7, secure = true, sameSite = "Lax" } = options;
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = [
      `${name}=${encodeURIComponent(value)}`,
      `expires=${expires}`,
      "path=/",
      secure ? "Secure" : "",
      `SameSite=${sameSite}`,
    ]
      .filter(Boolean)
      .join("; ");
  },

  delete(name: string): void {
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`;
  },
};

export const TokenService = {
  getAccessToken: (): string | null =>
    CookieService.get(ACCESS_TOKEN_COOKIE),

  getRefreshToken: (): string | null =>
    CookieService.get(REFRESH_TOKEN_COOKIE),

  setTokens(access: string, refresh?: string): void {
    CookieService.set(ACCESS_TOKEN_COOKIE, access, { days: 1 });
    if (refresh) {
      CookieService.set(REFRESH_TOKEN_COOKIE, refresh, { days: 30 });
    }
  },

  clearTokens(): void {
    CookieService.delete(ACCESS_TOKEN_COOKIE);
    CookieService.delete(REFRESH_TOKEN_COOKIE);
  },
};

const http: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true,
});

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetry = (error: AxiosError): boolean => {
  const config = error.config as ExtendedAxiosRequestConfig | undefined;
  const status = error.response?.status;

  if (!config) return false;
  if ((config.__retryCount ?? 0) >= MAX_RETRY) return false;
  if (!error.response && error.code === "ECONNABORTED") return true;
  return status !== undefined && RETRY_STATUS_CODES.includes(status);
};

const retryRequest = async (error: AxiosError): Promise<AxiosResponse> => {
  const config = error.config as ExtendedAxiosRequestConfig;
  config.__retryCount = (config.__retryCount ?? 0) + 1;

  const delay = RETRY_DELAY * Math.pow(2, config.__retryCount - 1);
  await sleep(delay);

  return http(config);
};

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token as string)
  );
  failedQueue = [];
};

const refreshAccessToken = async (): Promise<string> => {
  const refreshToken = TokenService.getRefreshToken();

  const response = await axios.post<RefreshTokenResponse>(
    `${BASE_URL}/auth/refresh`,
    refreshToken ? { refresh_token: refreshToken } : {},
    { withCredentials: true }
  );

  const { access_token, refresh_token } = response.data;
  TokenService.setTokens(access_token, refresh_token);
  return access_token;
};

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const ext = config as ExtendedAxiosRequestConfig;
    const token = TokenService.getAccessToken();
    if (token) {
      ext.headers.Authorization = `Bearer ${token}`;
    }

    ext.metadata = { startTime: Date.now() };
    return ext;
  },
  (error: AxiosError) => Promise.reject(error)
);

http.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV == 'development') {
      const config = response.config as ExtendedAxiosRequestConfig;
      const ms = Date.now() - (config.metadata?.startTime ?? 0);
      console.debug(
        `[HTTP] ${response.config.method?.toUpperCase()} ${response.config.url} — ${ms}ms`
      );
    }

    return response.data;
  },

  async (error: AxiosError): Promise<unknown> => {
    const original = error.config as ExtendedAxiosRequestConfig;

    if (error.response?.status === 401 && !original.__isRetryAfterRefresh) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          original.headers.Authorization = `Bearer ${token}`;
          return http(original);
        });
      }

      original.__isRetryAfterRefresh = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return http(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        TokenService.clearTokens();
        window.dispatchEvent(new Event("auth:logout"));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    if (shouldRetry(error)) {
      return retryRequest(error);
    }

    return Promise.reject(normalizeError(error));
  }
);

const normalizeError = (error: AxiosError): ApiError => {
  if (error.response) {
    const { status, data } = error.response as {
      status: number;
      data: Record<string, unknown>;
    };
    return {
      status,
      message:
        (data?.message as string) ||
        (data?.error as string) ||
        "Something went wrong",
      errors: (data?.errors as Record<string, string[]>) ?? null,
      data: data ?? null,
      isNetworkError: false,
      isServerError: status >= 500,
      isClientError: status >= 400 && status < 500,
    };
  }

  if (error.request) {
    return {
      status: null,
      message:
        error.code === "ECONNABORTED"
          ? "Request timed out. Please try again."
          : "Network error. Please check your connection.",
      errors: null,
      data: null,
      isNetworkError: true,
      isServerError: false,
      isClientError: false,
    };
  }

  return {
    status: null,
    message: error.message || "An unexpected error occurred",
    errors: null,
    data: null,
    isNetworkError: false,
    isServerError: false,
    isClientError: false,
  };
};

export const get = <T = unknown>(
  url: string,
  params: Record<string, unknown> = {},
  config: AxiosRequestConfig = {}
): Promise<T> => http.get<T, T>(url, { params, ...config });

export const post = <T = unknown>(
  url: string,
  data: unknown = {},
  config: AxiosRequestConfig = {}
): Promise<T> => http.post<T, T>(url, data, config);

export const put = <T = unknown>(
  url: string,
  data: unknown = {},
  config: AxiosRequestConfig = {}
): Promise<T> => http.put<T, T>(url, data, config);

export const patch = <T = unknown>(
  url: string,
  data: unknown = {},
  config: AxiosRequestConfig = {}
): Promise<T> => http.patch<T, T>(url, data, config);

export const del = <T = unknown>(
  url: string,
  config: AxiosRequestConfig = {}
): Promise<T> => http.delete<T, T>(url, config);

export const upload = <T = unknown>(
  url: string,
  formData: FormData,
  onUploadProgress?: (event: AxiosProgressEvent) => void
): Promise<T> =>
  http.post<T, T>(url, formData, {
    headers: { "Content-Type": "multipart/form-data" },
    ...(onUploadProgress && { onUploadProgress }),
  });
export const createAbortController = (): {
  signal: AbortSignal;
  abort: (reason?: string) => void;
} => {
  const controller = new AbortController();
  return { signal: controller.signal, abort: (r) => controller.abort(r) };
};

export const isCancelled = (error: unknown): boolean =>
  axios.isCancel(error) ||
  (error instanceof Error && error.name === "CanceledError");

export default http;