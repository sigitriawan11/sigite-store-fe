"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { get as getHttp, patch as patchHttp } from "@/service/http";

export interface OrderPaginate {
  page: number;
  pageSize: number;
  total: number;
}

interface AdminOrdersStore {
  orders: Record<string, unknown>[];
  paginate: OrderPaginate;
  loading: boolean;
  error: string | null;

  page: number;
  pageSize: number;
  search: string;
  status: string;
  dateFrom: string;
  dateTo: string;

  selected: Record<string, unknown> | null;
  detailLoading: boolean;
  updating: boolean;

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (search: string) => void;
  setStatus: (status: string) => void;
  setDateFrom: (v: string) => void;
  setDateTo: (v: string) => void;
  resetFilters: () => void;

  fetchOrders: () => Promise<void>;
  openDetail: (refId: string) => Promise<void>;
  closeDetail: () => void;
  updateStatus: (refId: string, status: string) => Promise<boolean>;
}

export const useAdminOrdersStore = create<AdminOrdersStore>()(
  immer((set, get) => ({
    orders: [],
    paginate: { page: 1, pageSize: 10, total: 0 },
    loading: false,
    error: null,

    page: 1,
    pageSize: 10,
    search: "",
    status: "",
    dateFrom: "",
    dateTo: "",

    selected: null,
    detailLoading: false,
    updating: false,

    setPage: (page) => set((s) => { s.page = page; }),
    setPageSize: (pageSize) => set((s) => { s.pageSize = pageSize; s.page = 1; }),
    setSearch: (search) => set((s) => { s.search = search; }),
    setStatus: (status) => set((s) => { s.status = status; s.page = 1; }),
    setDateFrom: (v) => set((s) => { s.dateFrom = v; }),
    setDateTo: (v) => set((s) => { s.dateTo = v; }),
    resetFilters: () => set((s) => {
      s.search = ""; s.status = ""; s.dateFrom = ""; s.dateTo = ""; s.page = 1;
    }),

    fetchOrders: async () => {
      set((s) => { s.loading = true; s.error = null; });
      try {
        const { page, pageSize, search, status, dateFrom, dateTo } = get();
        const params: Record<string, unknown> = { page, pageSize };
        if (search) params.search = search;
        if (status) params.status = status;
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;

        const res: any = await getHttp("/admin/orders", params);
        if (res?.status === true && res?.data) {
          set((s) => {
            s.orders = res.data.data || [];
            s.paginate = res.data.paginate || { page: 1, pageSize: 10, total: 0 };
          });
        } else {
          set((s) => { s.orders = []; s.paginate = { page: 1, pageSize: 10, total: 0 }; });
        }
      } catch (err: any) {
        set((s) => {
          s.error = err?.message || "Failed to fetch orders";
          s.orders = [];
          s.paginate = { page: 1, pageSize: 10, total: 0 };
        });
      } finally {
        set((s) => { s.loading = false; });
      }
    },

    openDetail: async (refId) => {
      set((s) => { s.detailLoading = true; s.selected = null; });
      try {
        const res: any = await getHttp(`/admin/orders/${refId}`);
        if (res?.status === true && res?.data) {
          set((s) => { s.selected = res.data; });
        }
      } catch (err: any) {
        set((s) => { s.error = err?.message || "Failed to load order detail"; });
      } finally {
        set((s) => { s.detailLoading = false; });
      }
    },

    closeDetail: () => set((s) => { s.selected = null; }),

    updateStatus: async (refId, status) => {
      set((s) => { s.updating = true; });
      try {
        const res: any = await patchHttp(`/admin/orders/${refId}/status`, { status });
        if (res?.status === true) {
          set((s) => {
            if (s.selected) s.selected = res.data;
          });
          await get().fetchOrders();
          return true;
        }
        return false;
      } catch (err: any) {
        set((s) => { s.error = err?.message || "Failed to update status"; });
        return false;
      } finally {
        set((s) => { s.updating = false; });
      }
    },
  }))
);
