"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { put as putHttp, post as postHttp, type ApiError } from "@/service/http";

function extractFieldErrors(err: unknown): Record<string, string> {
  const apiError = err as ApiError | undefined;
  if (!apiError?.data) return {};
  const responseData = apiError.data as Record<string, unknown> | undefined;
  if (!responseData?.data || !Array.isArray(responseData.data)) return {};
  const fieldErrors: Record<string, string> = {};
  for (const item of responseData.data) {
    const field = (item as { field?: string }).field;
    const message = (item as { message?: string }).message;
    if (field && message) fieldErrors[field] = message;
  }
  return fieldErrors;
}

interface AccountStore {
  savingProfile: boolean;
  profileError: string | null;
  profileSuccess: string | null;
  profileFieldErrors: Record<string, string>;

  savingPassword: boolean;
  passwordError: string | null;
  passwordSuccess: string | null;
  passwordFieldErrors: Record<string, string>;

  updateProfile: (payload: { display_name?: string; phone_number?: string }) => Promise<boolean>;
  changePassword: (payload: { current_password: string; new_password: string }) => Promise<boolean>;
  clearMessages: () => void;
}

export const useAccountStore = create<AccountStore>()(
  immer((set) => ({
    savingProfile: false,
    profileError: null,
    profileSuccess: null,
    profileFieldErrors: {},

    savingPassword: false,
    passwordError: null,
    passwordSuccess: null,
    passwordFieldErrors: {},

    updateProfile: async (payload) => {
      set((s) => {
        s.savingProfile = true;
        s.profileError = null;
        s.profileSuccess = null;
        s.profileFieldErrors = {};
      });
      try {
        const res: any = await putHttp("/account/profile", payload);
        if (res?.status === true) {
          set((s) => { s.profileSuccess = res.message || "Profile updated"; });
          return true;
        }
        set((s) => { s.profileError = res?.message || "Failed to update profile"; });
        return false;
      } catch (err: any) {
        set((s) => {
          const fe = extractFieldErrors(err);
          s.profileFieldErrors = fe;
          if (Object.keys(fe).length === 0) {
            s.profileError = err?.message || "Failed to update profile";
          }
        });
        return false;
      } finally {
        set((s) => { s.savingProfile = false; });
      }
    },

    changePassword: async (payload) => {
      set((s) => {
        s.savingPassword = true;
        s.passwordError = null;
        s.passwordSuccess = null;
        s.passwordFieldErrors = {};
      });
      try {
        const res: any = await postHttp("/account/change-password", payload);
        if (res?.status === true) {
          set((s) => { s.passwordSuccess = res.message || "Password changed"; });
          return true;
        }
        set((s) => { s.passwordError = res?.message || "Failed to change password"; });
        return false;
      } catch (err: any) {
        set((s) => {
          const fe = extractFieldErrors(err);
          s.passwordFieldErrors = fe;
          if (Object.keys(fe).length === 0) {
            s.passwordError = err?.message || "Failed to change password";
          }
        });
        return false;
      } finally {
        set((s) => { s.savingPassword = false; });
      }
    },

    clearMessages: () => set((s) => {
      s.profileError = null;
      s.profileSuccess = null;
      s.passwordError = null;
      s.passwordSuccess = null;
    }),
  }))
);
