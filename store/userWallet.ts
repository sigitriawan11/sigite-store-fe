"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { get as getHttp } from "@/service/http";

interface Paginate {
  page: number;
  pageSize: number;
  total: number;
}

interface UserWalletStore {
  balance: number;
  logs: Record<string, unknown>[];
  paginate: Paginate;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  fetchWallet: () => Promise<void>;
}

export const useUserWalletStore = create<UserWalletStore>()(
  immer((set, get) => ({
    balance: 0,
    logs: [],
    paginate: { page: 1, pageSize: 10, total: 0 },
    loading: false,
    error: null,
    page: 1,
    pageSize: 10,

    setPage: (page) => set((s) => { s.page = page; }),
    setPageSize: (pageSize) => set((s) => { s.pageSize = pageSize; s.page = 1; }),

    fetchWallet: async () => {
      set((s) => { s.loading = true; s.error = null; });
      try {
        const { page, pageSize } = get();
        const res: any = await getHttp("/account/wallet", { page, pageSize });
        if (res?.status === true && res?.data) {
          set((s) => {
            s.balance = res.data.balance ?? 0;
            s.logs = res.data.logs || [];
            s.paginate = res.data.paginate || { page: 1, pageSize: 10, total: 0 };
          });
        }
      } catch (err: any) {
        set((s) => { s.error = err?.message || "Failed to load wallet"; });
      } finally {
        set((s) => { s.loading = false; });
      }
    },
  }))
);
