"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { get as getHttp } from "@/service/http";

interface Paginate {
  page: number;
  pageSize: number;
  total: number;
}

interface UserTransactionsStore {
  transactions: Record<string, unknown>[];
  paginate: Paginate;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  search: string;
  status: string;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (v: string) => void;
  setStatus: (v: string) => void;
  resetFilters: () => void;
  fetchTransactions: () => Promise<void>;
}

export const useUserTransactionsStore = create<UserTransactionsStore>()(
  immer((set, get) => ({
    transactions: [],
    paginate: { page: 1, pageSize: 10, total: 0 },
    loading: false,
    error: null,
    page: 1,
    pageSize: 10,
    search: "",
    status: "",

    setPage: (page) => set((s) => { s.page = page; }),
    setPageSize: (pageSize) => set((s) => { s.pageSize = pageSize; s.page = 1; }),
    setSearch: (v) => set((s) => { s.search = v; }),
    setStatus: (v) => set((s) => { s.status = v; s.page = 1; }),
    resetFilters: () => set((s) => { s.search = ""; s.status = ""; s.page = 1; }),

    fetchTransactions: async () => {
      set((s) => { s.loading = true; s.error = null; });
      try {
        const { page, pageSize, search, status } = get();
        const params: Record<string, unknown> = { page, pageSize };
        if (search) params.search = search;
        if (status) params.status = status;
        const res: any = await getHttp("/account/transactions", params);
        if (res?.status === true && res?.data) {
          set((s) => {
            s.transactions = res.data.data || [];
            s.paginate = res.data.paginate || { page: 1, pageSize: 10, total: 0 };
          });
        } else {
          set((s) => { s.transactions = []; s.paginate = { page: 1, pageSize: 10, total: 0 }; });
        }
      } catch (err: any) {
        set((s) => {
          s.error = err?.message || "Failed to fetch transactions";
          s.transactions = [];
          s.paginate = { page: 1, pageSize: 10, total: 0 };
        });
      } finally {
        set((s) => { s.loading = false; });
      }
    },
  }))
);
