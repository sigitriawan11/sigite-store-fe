"use client";

import type {
  RequestRegisterUser,
  RequestLoginUser,
} from "@/types/auth.types";
import type { UserSession } from "@/types/dashboard.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

const API = process.env.NEXT_PUBLIC_API_URL;

interface AuthStore {
  user: UserSession | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  loading: {
    login: boolean;
    register: boolean;
    logout: boolean;
    session: boolean;
  };
  error: string | null;

  login: (payload: RequestLoginUser) => Promise<boolean>;
  register: (payload: RequestRegisterUser) => Promise<string | boolean>;
  logout: () => Promise<void>;
  loginProvider: (provider?: string) => void;
  fetchSession: () => Promise<void>;
  setUser: (user: UserSession) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, _get) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      loading: {
        login: false,
        register: false,
        logout: false,
        session: false,
      },
      error: null,

      hydrate: () => {
        set({ isHydrated: true });
      },

      login: async (payload: RequestLoginUser): Promise<boolean> => {
        set((state) => ({
          loading: { ...state.loading, login: true },
          error: null,
        }));

        try {
          const res = await fetch(`${API}/auth/login`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }).then((r) => r.json());

          if (res.status === true) {
            // Backend sudah set httpOnly cookies, fetch user data
            const sessionRes = await fetch(`${API}/auth/session`, {
              credentials: "include",
              headers: { "Content-Type": "application/json" },
            }).then((r) => r.json());

            if (sessionRes.status && sessionRes.data) {
              set({
                user: sessionRes.data,
                isAuthenticated: true,
                error: null,
              });
              return true;
            }
          }

          set({ error: res.message || "Login failed" });
          return false;
        } catch (err: any) {
          set({
            error: err?.message || "Login failed",
          });
          return false;
        } finally {
          set((state) => ({
            loading: { ...state.loading, login: false },
          }));
        }
      },

      register: async (payload: RequestRegisterUser): Promise<boolean> => {
        set((state) => ({
          loading: { ...state.loading, register: true },
          error: null,
        }));

        try {
          const res = await fetch(`${API}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }).then((r) => r.json());

          if (res.id || res.status === true) {
            set({ error: null });
            return true;
          }

          set({ error: res.message || "Registration failed" });
          return false;
        } catch (err: any) {
          set({ error: err?.message || "Registration failed" });
          return false;
        } finally {
          set((state) => ({
            loading: { ...state.loading, register: false },
          }));
        }
      },

      logout: async () => {
        set((state) => ({
          loading: { ...state.loading, logout: true },
        }));

        try {
          await fetch(`${API}/auth/logout`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
          });
        } catch {
          // ignore
        } finally {
          set({
            user: null,
            isAuthenticated: false,
            error: null,
            loading: {
              login: false,
              register: false,
              logout: false,
              session: false,
            },
          });
        }
      },

      fetchSession: async () => {
        set((state) => ({
          loading: { ...state.loading, session: true },
        }));

        try {
          const res = await fetch(`${API}/auth/session`, {
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }).then((r) => r.json());

          if (res.status === true && res.data) {
            set({
              user: res.data,
              isAuthenticated: true,
              error: null,
            });
          } else {
            set({ user: null, isAuthenticated: false });
          }
        } catch {
          set({ user: null, isAuthenticated: false });
        } finally {
          set((state) => ({
            loading: { ...state.loading, session: false },
            isHydrated: true,
          }));
        }
      },

      loginProvider: (provider?: string) => {
        window.location.href = `${API}/auth/${provider || "google"}`;
      },

      setUser: (user: UserSession) => {
        set({ user, isAuthenticated: true });
      },
    }),
    {
      name: "sigite-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => {
        return (state, _error) => {
          if (state) {
            state.hydrate();
          }
        };
      },
    }
  )
);