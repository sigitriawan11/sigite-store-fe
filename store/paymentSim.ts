"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { get as getHttp, post as postHttp } from "@/service/http";

export interface PaymentSimPaginate {
  page: number;
  pageSize: number;
  total: number;
}

interface PaymentSimStore {
  pending: Record<string, unknown>[];
  paginate: PaymentSimPaginate;
  loading: boolean;
  error: string | null;
  success: string | null;
  forbidden: boolean;
  payingRefId: string | null;

  page: number;
  pageSize: number;
  search: string;

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (v: string) => void;
  fetchPending: () => Promise<void>;
  pay: (refId: string) => Promise<boolean>;
  clearMessages: () => void;
}

export const usePaymentSimStore = create<PaymentSimStore>()(
  immer((set, get) => ({
    pending: [],
    paginate: { page: 1, pageSize: 10, total: 0 },
    loading: false,
    error: null,
    success: null,
    forbidden: false,
    payingRefId: null,

    page: 1,
    pageSize: 10,
    search: "",

    setPage: (page) => set((s) => { s.page = page; }),
    setPageSize: (pageSize) => set((s) => { s.pageSize = pageSize; s.page = 1; }),
    setSearch: (v) => set((s) => { s.search = v; }),

    fetchPending: async () => {
      set((s) => { s.loading = true; s.error = null; });
      try {
        const { page, pageSize, search } = get();
        const params: Record<string, unknown> = { page, pageSize };
        if (search) params.search = search;

        const res: any = await getHttp("/admin/payment-sim", params);
        if (res?.status === true && res?.data) {
          set((s) => {
            s.pending = res.data.data || [];
            s.paginate = res.data.paginate || { page: 1, pageSize: 10, total: 0 };
            s.forbidden = false;
          });
        }
      } catch (err: any) {
        set((s) => {
          if (err?.status === 403) {
            s.forbidden = true;
          } else {
            s.error = err?.message || "Failed to fetch pending transactions";
          }
          s.pending = [];
          s.paginate = { page: 1, pageSize: 10, total: 0 };
        });
      } finally {
        set((s) => { s.loading = false; });
      }
    },

    pay: async (refId) => {
      set((s) => { s.payingRefId = refId; s.error = null; s.success = null; });
      try {
        const res: any = await postHttp(`/admin/payment-sim/${refId}/pay`, {});
        if (res?.status === true) {
          set((s) => { s.success = `Payment simulated for ${refId}`; });
          await get().fetchPending();
          return true;
        }
        set((s) => { s.error = res?.message || "Failed to simulate payment"; });
        return false;
      } catch (err: any) {
        set((s) => { s.error = err?.message || "Failed to simulate payment"; });
        return false;
      } finally {
        set((s) => { s.payingRefId = null; });
      }
    },

    clearMessages: () => set((s) => { s.error = null; s.success = null; }),
  }))
);
