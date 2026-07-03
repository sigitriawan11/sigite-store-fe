"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { get as getHttp } from "@/service/http";

export interface AuditPaginate {
  page: number;
  pageSize: number;
  total: number;
}

interface AdminAuditStore {
  logs: Record<string, unknown>[];
  paginate: AuditPaginate;
  loading: boolean;
  error: string | null;

  page: number;
  pageSize: number;
  search: string;
  action: string;
  resource: string;

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (v: string) => void;
  setAction: (v: string) => void;
  setResource: (v: string) => void;
  resetFilters: () => void;
  fetchLogs: () => Promise<void>;
}

export const useAdminAuditStore = create<AdminAuditStore>()(
  immer((set, get) => ({
    logs: [],
    paginate: { page: 1, pageSize: 10, total: 0 },
    loading: false,
    error: null,

    page: 1,
    pageSize: 10,
    search: "",
    action: "",
    resource: "",

    setPage: (page) => set((s) => { s.page = page; }),
    setPageSize: (pageSize) => set((s) => { s.pageSize = pageSize; s.page = 1; }),
    setSearch: (v) => set((s) => { s.search = v; }),
    setAction: (v) => set((s) => { s.action = v; s.page = 1; }),
    setResource: (v) => set((s) => { s.resource = v; s.page = 1; }),
    resetFilters: () => set((s) => {
      s.search = ""; s.action = ""; s.resource = ""; s.page = 1;
    }),

    fetchLogs: async () => {
      set((s) => { s.loading = true; s.error = null; });
      try {
        const { page, pageSize, search, action, resource } = get();
        const params: Record<string, unknown> = { page, pageSize };
        if (search) params.search = search;
        if (action) params.action = action;
        if (resource) params.resource = resource;

        const res: any = await getHttp("/admin/audit", params);
        if (res?.status === true && res?.data) {
          set((s) => {
            s.logs = res.data.data || [];
            s.paginate = res.data.paginate || { page: 1, pageSize: 10, total: 0 };
          });
        } else {
          set((s) => { s.logs = []; s.paginate = { page: 1, pageSize: 10, total: 0 }; });
        }
      } catch (err: any) {
        set((s) => {
          s.error = err?.message || "Failed to fetch audit logs";
          s.logs = [];
          s.paginate = { page: 1, pageSize: 10, total: 0 };
        });
      } finally {
        set((s) => { s.loading = false; });
      }
    },
  }))
);
