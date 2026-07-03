"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { get as getHttp, post as postHttp } from "@/service/http";

interface Paginate {
  page: number;
  pageSize: number;
  total: number;
}

export interface UserTicketDetail extends Record<string, unknown> {
  id: number;
  ticket_no: string;
  subject: string;
  status: string;
  messages: {
    id: number;
    sender_role: string;
    sender_name: string | null;
    message: string;
    created_at: string;
  }[];
}

interface UserSupportStore {
  tickets: Record<string, unknown>[];
  paginate: Paginate;
  loading: boolean;
  error: string | null;

  page: number;
  pageSize: number;
  status: string;

  selected: UserTicketDetail | null;
  detailLoading: boolean;
  replying: boolean;

  showCreate: boolean;
  creating: boolean;
  createError: string | null;

  setPage: (page: number) => void;
  setStatus: (v: string) => void;
  setShowCreate: (v: boolean) => void;
  fetchTickets: () => Promise<void>;
  openTicket: (id: number) => Promise<void>;
  closeTicket: () => void;
  createTicket: (payload: { subject: string; category: string; message: string }) => Promise<boolean>;
  sendReply: (id: number, message: string) => Promise<boolean>;
}

export const useUserSupportStore = create<UserSupportStore>()(
  immer((set, get) => ({
    tickets: [],
    paginate: { page: 1, pageSize: 10, total: 0 },
    loading: false,
    error: null,

    page: 1,
    pageSize: 10,
    status: "",

    selected: null,
    detailLoading: false,
    replying: false,

    showCreate: false,
    creating: false,
    createError: null,

    setPage: (page) => set((s) => { s.page = page; }),
    setStatus: (v) => set((s) => { s.status = v; s.page = 1; }),
    setShowCreate: (v) => set((s) => { s.showCreate = v; s.createError = null; }),

    fetchTickets: async () => {
      set((s) => { s.loading = true; s.error = null; });
      try {
        const { page, pageSize, status } = get();
        const params: Record<string, unknown> = { page, pageSize };
        if (status) params.status = status;
        const res: any = await getHttp("/account/support", params);
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
        });
      } finally {
        set((s) => { s.loading = false; });
      }
    },

    openTicket: async (id) => {
      set((s) => { s.detailLoading = true; s.selected = null; });
      try {
        const res: any = await getHttp(`/account/support/${id}`);
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

    createTicket: async (payload) => {
      set((s) => { s.creating = true; s.createError = null; });
      try {
        const res: any = await postHttp("/account/support", payload);
        if (res?.status === true) {
          set((s) => { s.showCreate = false; });
          await get().fetchTickets();
          return true;
        }
        set((s) => { s.createError = res?.message || "Failed to create ticket"; });
        return false;
      } catch (err: any) {
        set((s) => { s.createError = err?.message || "Failed to create ticket"; });
        return false;
      } finally {
        set((s) => { s.creating = false; });
      }
    },

    sendReply: async (id, message) => {
      set((s) => { s.replying = true; });
      try {
        const res: any = await postHttp(`/account/support/${id}/reply`, { message });
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
  }))
);
