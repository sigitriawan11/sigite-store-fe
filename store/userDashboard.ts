"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { get as getHttp } from "@/service/http";

export interface UserDashboardData {
  balance: number;
  total_transactions: number;
  paid_transactions: number;
  total_spent: number;
  pending_deposits: number;
  recent_transactions: Record<string, unknown>[];
}

interface UserDashboardStore {
  data: UserDashboardData | null;
  loading: boolean;
  error: string | null;
  fetchDashboard: () => Promise<void>;
}

export const useUserDashboardStore = create<UserDashboardStore>()(
  immer((set) => ({
    data: null,
    loading: false,
    error: null,
    fetchDashboard: async () => {
      set((s) => { s.loading = true; s.error = null; });
      try {
        const res: any = await getHttp("/account/dashboard");
        if (res?.status === true && res?.data) {
          set((s) => { s.data = res.data; });
        }
      } catch (err: any) {
        set((s) => { s.error = err?.message || "Failed to load dashboard"; });
      } finally {
        set((s) => { s.loading = false; });
      }
    },
  }))
);
