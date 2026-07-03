"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { get as getHttp, upload as uploadHttp, type ApiError } from "@/service/http";

interface Paginate {
  page: number;
  pageSize: number;
  total: number;
}

function extractFieldErrors(err: unknown): Record<string, string> {
  const apiError = err as ApiError | undefined;
  const responseData = apiError?.data as Record<string, unknown> | undefined;
  if (!responseData?.data || !Array.isArray(responseData.data)) return {};
  const fe: Record<string, string> = {};
  for (const item of responseData.data) {
    const f = (item as { field?: string }).field;
    const m = (item as { message?: string }).message;
    if (f && m) fe[f] = m;
  }
  return fe;
}

interface UserDepositsStore {
  deposits: Record<string, unknown>[];
  paginate: Paginate;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;

  submitting: boolean;
  formError: string | null;
  formSuccess: string | null;
  fieldErrors: Record<string, string>;

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  fetchDeposits: () => Promise<void>;
  createDeposit: (payload: { amount: string; method: string; sender_name: string; proof: File | null }) => Promise<boolean>;
  clearMessages: () => void;
}

export const useUserDepositsStore = create<UserDepositsStore>()(
  immer((set, get) => ({
    deposits: [],
    paginate: { page: 1, pageSize: 10, total: 0 },
    loading: false,
    error: null,
    page: 1,
    pageSize: 10,

    submitting: false,
    formError: null,
    formSuccess: null,
    fieldErrors: {},

    setPage: (page) => set((s) => { s.page = page; }),
    setPageSize: (pageSize) => set((s) => { s.pageSize = pageSize; s.page = 1; }),

    fetchDeposits: async () => {
      set((s) => { s.loading = true; s.error = null; });
      try {
        const { page, pageSize } = get();
        const res: any = await getHttp("/account/deposits", { page, pageSize });
        if (res?.status === true && res?.data) {
          set((s) => {
            s.deposits = res.data.data || [];
            s.paginate = res.data.paginate || { page: 1, pageSize: 10, total: 0 };
          });
        }
      } catch (err: any) {
        set((s) => { s.error = err?.message || "Failed to load deposits"; });
      } finally {
        set((s) => { s.loading = false; });
      }
    },

    createDeposit: async (payload) => {
      set((s) => {
        s.submitting = true;
        s.formError = null;
        s.formSuccess = null;
        s.fieldErrors = {};
      });
      try {
        if (!payload.proof) {
          set((s) => { s.formError = "Transfer proof is required"; s.submitting = false; });
          return false;
        }
        const fd = new FormData();
        fd.append("amount", payload.amount);
        fd.append("method", payload.method);
        fd.append("sender_name", payload.sender_name);
        fd.append("proof", payload.proof);

        const res: any = await uploadHttp("/account/deposits", fd);
        if (res?.status === true) {
          set((s) => { s.formSuccess = res.message || "Deposit submitted"; });
          await get().fetchDeposits();
          return true;
        }
        set((s) => { s.formError = res?.message || "Failed to submit deposit"; });
        return false;
      } catch (err: any) {
        set((s) => {
          const fe = extractFieldErrors(err);
          s.fieldErrors = fe;
          if (Object.keys(fe).length === 0) s.formError = err?.message || "Failed to submit deposit";
        });
        return false;
      } finally {
        set((s) => { s.submitting = false; });
      }
    },

    clearMessages: () => set((s) => { s.formError = null; s.formSuccess = null; s.fieldErrors = {}; }),
  }))
);
