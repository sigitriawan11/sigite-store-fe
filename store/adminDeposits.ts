"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { get as getHttp, patch as patchHttp } from "@/service/http";

interface Paginate {
  page: number;
  pageSize: number;
  total: number;
}

interface AdminDepositsStore {
  deposits: Record<string, unknown>[];
  paginate: Paginate;
  loading: boolean;
  error: string | null;
  success: string | null;

  page: number;
  pageSize: number;
  search: string;
  status: string;

  selected: Record<string, unknown> | null;
  processing: boolean;

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (v: string) => void;
  setStatus: (v: string) => void;
  fetchDeposits: () => Promise<void>;
  openDetail: (row: Record<string, unknown>) => void;
  closeDetail: () => void;
  confirm: (id: number) => Promise<boolean>;
  reject: (id: number, note: string) => Promise<boolean>;
  clearMessages: () => void;
}

export const useAdminDepositsStore = create<AdminDepositsStore>()(
  immer((set, get) => ({
    deposits: [],
    paginate: { page: 1, pageSize: 10, total: 0 },
    loading: false,
    error: null,
    success: null,

    page: 1,
    pageSize: 10,
    search: "",
    status: "",

    selected: null,
    processing: false,

    setPage: (page) => set((s) => { s.page = page; }),
    setPageSize: (pageSize) => set((s) => { s.pageSize = pageSize; s.page = 1; }),
    setSearch: (v) => set((s) => { s.search = v; }),
    setStatus: (v) => set((s) => { s.status = v; s.page = 1; }),

    fetchDeposits: async () => {
      set((s) => { s.loading = true; s.error = null; });
      try {
        const { page, pageSize, search, status } = get();
        const params: Record<string, unknown> = { page, pageSize };
        if (search) params.search = search;
        if (status) params.status = status;
        const res: any = await getHttp("/admin/deposits", params);
        if (res?.status === true && res?.data) {
          set((s) => {
            s.deposits = res.data.data || [];
            s.paginate = res.data.paginate || { page: 1, pageSize: 10, total: 0 };
          });
        } else {
          set((s) => { s.deposits = []; s.paginate = { page: 1, pageSize: 10, total: 0 }; });
        }
      } catch (err: any) {
        set((s) => {
          s.error = err?.message || "Failed to fetch deposits";
          s.deposits = [];
          s.paginate = { page: 1, pageSize: 10, total: 0 };
        });
      } finally {
        set((s) => { s.loading = false; });
      }
    },

    openDetail: (row) => set((s) => { s.selected = row; }),
    closeDetail: () => set((s) => { s.selected = null; }),

    confirm: async (id) => {
      set((s) => { s.processing = true; s.error = null; s.success = null; });
      try {
        const res: any = await patchHttp(`/admin/deposits/${id}/confirm`);
        if (res?.status === true) {
          set((s) => { s.success = res.message || "Deposit approved"; s.selected = null; });
          await get().fetchDeposits();
          return true;
        }
        set((s) => { s.error = res?.message || "Failed to approve"; });
        return false;
      } catch (err: any) {
        set((s) => { s.error = err?.message || "Failed to approve"; });
        return false;
      } finally {
        set((s) => { s.processing = false; });
      }
    },

    reject: async (id, note) => {
      set((s) => { s.processing = true; s.error = null; s.success = null; });
      try {
        const res: any = await patchHttp(`/admin/deposits/${id}/reject`, { admin_note: note });
        if (res?.status === true) {
          set((s) => { s.success = res.message || "Deposit rejected"; s.selected = null; });
          await get().fetchDeposits();
          return true;
        }
        set((s) => { s.error = res?.message || "Failed to reject"; });
        return false;
      } catch (err: any) {
        set((s) => { s.error = err?.message || "Failed to reject"; });
        return false;
      } finally {
        set((s) => { s.processing = false; });
      }
    },

    clearMessages: () => set((s) => { s.error = null; s.success = null; }),
  }))
);
