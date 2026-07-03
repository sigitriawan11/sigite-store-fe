"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { get as getHttp, patch as patchHttp, post as postHttp } from "@/service/http";

export interface TicketMessage {
  id: number;
  sender_role: string;
  sender_name: string | null;
  message: string;
  created_at: string;
}

export interface TicketDetail extends Record<string, unknown> {
  id: number;
  ticket_no: string;
  subject: string;
  status: string;
  messages: TicketMessage[];
}

export interface SupportPaginate {
  page: number;
  pageSize: number;
  total: number;
}

interface AdminSupportStore {
  tickets: Record<string, unknown>[];
  paginate: SupportPaginate;
  loading: boolean;
  error: string | null;

  page: number;
  pageSize: number;
  search: string;
  status: string;

  selected: TicketDetail | null;
  detailLoading: boolean;
  replying: boolean;
  updating: boolean;

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (v: string) => void;
  setStatus: (v: string) => void;
  resetFilters: () => void;

  fetchTickets: () => Promise<void>;
  openTicket: (id: number) => Promise<void>;
  closeTicket: () => void;
  sendReply: (id: number, message: string) => Promise<boolean>;
  changeStatus: (id: number, status: string) => Promise<boolean>;
}

export const useAdminSupportStore = create<AdminSupportStore>()(
  immer((set, get) => ({
    tickets: [],
    paginate: { page: 1, pageSize: 10, total: 0 },
    loading: false,
    error: null,

    page: 1,
    pageSize: 10,
    search: "",
    status: "",

    selected: null,
    detailLoading: false,
    replying: false,
    updating: false,

    setPage: (page) => set((s) => { s.page = page; }),
    setPageSize: (pageSize) => set((s) => { s.pageSize = pageSize; s.page = 1; }),
    setSearch: (v) => set((s) => { s.search = v; }),
    setStatus: (v) => set((s) => { s.status = v; s.page = 1; }),
    resetFilters: () => set((s) => { s.search = ""; s.status = ""; s.page = 1; }),

    fetchTickets: async () => {
      set((s) => { s.loading = true; s.error = null; });
      try {
        const { page, pageSize, search, status } = get();
        const params: Record<string, unknown> = { page, pageSize };
        if (search) params.search = search;
        if (status) params.status = status;

        const res: any = await getHttp("/admin/support", params);
        if (res?.status === true && res?.data) {
          set((s) => {
            s.tickets = res.data.data || [];
            s.paginate = res.data.paginate || { page: 1, pageSize: 10, total: 0 };
          });
        } else {
          set((s) => { s.tickets = []; s.paginate = { page: 1, pageSize: 10, total: 0 }; });
        }
      } catch (err: any) {
        set((s) => {
          s.error = err?.message || "Failed to fetch tickets";
          s.tickets = [];
          s.paginate = { page: 1, pageSize: 10, total: 0 };
        });
      } finally {
        set((s) => { s.loading = false; });
      }
    },

    openTicket: async (id) => {
      set((s) => { s.detailLoading = true; s.selected = null; });
      try {
        const res: any = await getHttp(`/admin/support/${id}`);
        if (res?.status === true && res?.data) {
          set((s) => { s.selected = res.data; });
        }
      } catch (err: any) {
        set((s) => { s.error = err?.message || "Failed to load ticket"; });
      } finally {
        set((s) => { s.detailLoading = false; });
      }
    },

    closeTicket: () => set((s) => { s.selected = null; }),

    sendReply: async (id, message) => {
      set((s) => { s.replying = true; });
      try {
        const res: any = await postHttp(`/admin/support/${id}/reply`, { message });
        if (res?.status === true && res?.data) {
          set((s) => { s.selected = res.data; });
          await get().fetchTickets();
          return true;
        }
        return false;
      } catch (err: any) {
        set((s) => { s.error = err?.message || "Failed to send reply"; });
        return false;
      } finally {
        set((s) => { s.replying = false; });
      }
    },

    changeStatus: async (id, status) => {
      set((s) => { s.updating = true; });
      try {
        const res: any = await patchHttp(`/admin/support/${id}/status`, { status });
        if (res?.status === true && res?.data) {
          set((s) => { s.selected = res.data; });
          await get().fetchTickets();
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
