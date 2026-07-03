"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { get as getHttp, put as putHttp } from "@/service/http";

interface AdminPricingStore {
  marginPercent: number;
  marginId: number | null;
  loading: boolean;
  saving: boolean;
  error: string | null;
  success: string | null;
  fetchMargin: () => Promise<void>;
  updateMargin: (marginPercent: number) => Promise<boolean>;
  clearMessages: () => void;
}

export const useAdminPricingStore = create<AdminPricingStore>()(
  immer((set, get) => ({
    marginPercent: 1.0,
    marginId: null,
    loading: false,
    saving: false,
    error: null,
    success: null,

    fetchMargin: async () => {
      set((state) => {
        state.loading = true;
        state.error = null;
      });

      try {
        const res: any = await getHttp("/admin/pricing");

        if (res?.status === true && res?.data) {
          set((state) => {
            state.marginPercent = Number(res.data.margin_percent) || 1.0;
            state.marginId = res.data.id;
          });
        } else {
          set((state) => {
            state.error = "Failed to load margin setting";
          });
        }
      } catch (err: any) {
        set((state) => {
          state.error =
            err?.message || "Failed to load margin setting";
        });
      } finally {
        set((state) => {
          state.loading = false;
        });
      }
    },

    updateMargin: async (marginPercent: number) => {
      set((state) => {
        state.saving = true;
        state.error = null;
        state.success = null;
      });

      try {
        const res: any = await putHttp("/admin/pricing", {
          margin_percent: marginPercent,
        });

        if (res?.status === true && res?.data) {
          set((state) => {
            state.marginPercent = Number(res.data.margin_percent);
            state.marginId = res.data.id;
            state.success = "Margin updated successfully";
          });
          return true;
        } else {
          set((state) => {
            state.error = res?.message || "Failed to update margin";
          });
          return false;
        }
      } catch (err: any) {
        set((state) => {
          state.error =
            err?.message || "Failed to update margin";
        });
        return false;
      } finally {
        set((state) => {
          state.saving = false;
        });
      }
    },

    clearMessages: () => {
      set((state) => {
        state.error = null;
        state.success = null;
      });
    },
  }))
);