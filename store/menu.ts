"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { get as getHttp } from "@/service/http";
import { useAuthStore } from "./auth";

export interface MenuItem {
  id: string;
  name: string;
  icon: string;
  path: string;
  sequence: number;
  parent_id: string | null;
  children?: MenuItem[];
}

interface MenuStore {
  menus: MenuItem[];
  loading: boolean;
  error: string | null;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  mobileOpen: boolean;
  toggleMobile: () => void;
  closeMobile: () => void;
  fetchMenus: () => Promise<void>;
}

export const useMenuStore = create<MenuStore>()(
  immer((set) => ({
    menus: [],
    loading: false,
    error: null,
    sidebarCollapsed: false,
    mobileOpen: false,

    toggleSidebar: () => {
      set((state) => {
        state.sidebarCollapsed = !state.sidebarCollapsed;
      });
    },

    setSidebarCollapsed: (collapsed: boolean) => {
      set((state) => {
        state.sidebarCollapsed = collapsed;
      });
    },

    toggleMobile: () => {
      set((state) => {
        state.mobileOpen = !state.mobileOpen;
      });
    },

    closeMobile: () => {
      set((state) => {
        state.mobileOpen = false;
      });
    },

    fetchMenus: async () => {
      const { isAuthenticated } = useAuthStore.getState();
      if (!isAuthenticated) return;

      set((state) => {
        state.loading = true;
        state.error = null;
      });

      try {
        const res: any = await getHttp("/menus");
        if (res?.status === true && Array.isArray(res.data)) {
          set((state) => {
            state.menus = res.data;
          });
        }
      } catch (err: any) {
        set((state) => {
          state.error = err?.message || "Failed to fetch menus";
        });
      } finally {
        set((state) => {
          state.loading = false;
        });
      }
    },
  }))
);