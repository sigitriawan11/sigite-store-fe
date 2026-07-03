"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { get as getHttp } from "@/service/http";

export interface ReportData {
  range: { date_from: string; date_to: string };
  summary: {
    total_orders: number;
    paid_orders: number;
    total_revenue: number;
    success_rate: number;
  };
  status_breakdown: { status: string; count: number; revenue: number }[];
  top_products: { product_code: string; count: number; revenue: number }[];
  daily_series: { date: string; orders: number; revenue: number }[];
}

interface AdminReportsStore {
  data: ReportData | null;
  loading: boolean;
  error: string | null;
  dateFrom: string;
  dateTo: string;
  setDateFrom: (v: string) => void;
  setDateTo: (v: string) => void;
  fetchReport: () => Promise<void>;
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}
function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const today = new Date();
const monthAgo = new Date();
monthAgo.setDate(today.getDate() - 29);

export const useAdminReportsStore = create<AdminReportsStore>()(
  immer((set, get) => ({
    data: null,
    loading: false,
    error: null,
    dateFrom: toDateStr(monthAgo),
    dateTo: toDateStr(today),

    setDateFrom: (v) => set((s) => { s.dateFrom = v; }),
    setDateTo: (v) => set((s) => { s.dateTo = v; }),

    fetchReport: async () => {
      set((s) => { s.loading = true; s.error = null; });
      try {
        const { dateFrom, dateTo } = get();
        const res: any = await getHttp("/admin/reports", {
          date_from: dateFrom,
          date_to: dateTo,
        });
        if (res?.status === true && res?.data) {
          set((s) => { s.data = res.data; });
        }
      } catch (err: any) {
        set((s) => { s.error = err?.message || "Failed to load report"; });
      } finally {
        set((s) => { s.loading = false; });
      }
    },
  }))
);
