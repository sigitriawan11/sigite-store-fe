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
  status: boolean;
  message: string;
  data?: {
    access_token: string;
    refresh_token?: string;
    user_id?: string;
    email?: string;
    role_id?: string;
    role_name?: string;
    [key: string]: unknown;
  };
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
  
  const response = await axios.post<RefreshTokenResponse>(
    `${BASE_URL}/auth/refresh`,
    {},
    { withCredentials: true }
  );

  const { status, data } = response.data;
  if (status && data?.access_token) {
    return data.access_token;
  }

  throw new Error("Refresh failed: no access token returned");
};

http.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    const ext = config as ExtendedAxiosRequestConfig;
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
          return http(original);
        });
      }

      original.__isRetryAfterRefresh = true;
      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        processQueue(null, newToken);
        return http(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
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