"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { get as getHttp } from "@/service/http";

export interface DashboardData {
  totals: {
    total_users: number;
    total_transactions: number;
    total_revenue: number;
    revenue_today: number;
    orders_today: number;
  };
  status_counts: Record<string, number>;
  recent_transactions: Record<string, unknown>[];
  revenue_series: { date: string; revenue: number; orders: number }[];
}

interface AdminDashboardStore {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  fetchDashboard: () => Promise<void>;
}

export const useAdminDashboardStore = create<AdminDashboardStore>()(
  immer((set) => ({
    data: null,
    loading: false,
    error: null,

    fetchDashboard: async () => {
      set((state) => {
        state.loading = true;
        state.error = null;
      });

      try {
        const res: any = await getHttp("/admin/dashboard");
        if (res?.status === true && res?.data) {
          set((state) => {
            state.data = res.data;
          });
        }
      } catch (err: any) {
        set((state) => {
          state.error = err?.message || "Failed to load dashboard";
        });
      } finally {
        set((state) => {
          state.loading = false;
        });
      }
    },
  }))
);
