"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { get as getHttp, put as putHttp } from "@/service/http";

interface SettingEntry {
  id: number;
  key: string;
  value: unknown;
  description: string | null;
}

interface GroupedSettings {
  general: Record<string, SettingEntry>;
  system: Record<string, SettingEntry>;
}

interface AdminSettingsStore {
  settings: GroupedSettings;
  loading: boolean;
  saving: boolean;
  error: string | null;
  successMessage: string | null;

  dirtyFields: Record<string, unknown>;
  activeTab: "general" | "system";

  fetchSettings: () => Promise<void>;
  setDirtyField: (key: string, value: unknown) => void;
  resetDirtyFields: () => void;
  saveSettings: () => Promise<void>;
  setActiveTab: (tab: "general" | "system") => void;
  clearMessages: () => void;
}

export const useAdminSettingsStore = create<AdminSettingsStore>()(
  immer((set, get) => ({
    settings: { general: {}, system: {} },
    loading: false,
    saving: false,
    error: null,
    successMessage: null,
    dirtyFields: {},
    activeTab: "general",

    clearMessages: () => {
      set((state) => {
        state.error = null;
        state.successMessage = null;
      });
    },

    setActiveTab: (tab: "general" | "system") => {
      set((state) => {
        state.activeTab = tab;
        state.error = null;
        state.successMessage = null;
      });
    },

    setDirtyField: (key: string, value: unknown) => {
      set((state) => {
        state.dirtyFields[key] = value;
        state.error = null;
        state.successMessage = null;
      });
    },

    resetDirtyFields: () => {
      set((state) => {
        state.dirtyFields = {};
        state.error = null;
        state.successMessage = null;
      });
    },

    fetchSettings: async () => {
      set((state) => {
        state.loading = true;
        state.error = null;
      });

      try {
        const res: any = await getHttp("/admin/settings");

        if (res?.status === true && res?.data) {
          set((state) => {
            state.settings = res.data as GroupedSettings;
            state.dirtyFields = {};
          });
        } else {
          set((state) => {
            state.error = "Failed to load settings";
          });
        }
      } catch (err: any) {
        set((state) => {
          state.error = err?.message || "Failed to load settings";
        });
      } finally {
        set((state) => {
          state.loading = false;
        });
      }
    },

    saveSettings: async () => {
      const { dirtyFields } = get();

      if (Object.keys(dirtyFields).length === 0) {
        set((state) => {
          state.error = "No changes to save";
        });
        return;
      }

      set((state) => {
        state.saving = true;
        state.error = null;
        state.successMessage = null;
      });

      try {
        const res: any = await putHttp("/admin/settings", {
          settings: dirtyFields,
        });

        if (res?.status === true && res?.data) {
          set((state) => {
            state.settings = res.data.settings as GroupedSettings;
            state.dirtyFields = {};
            state.successMessage = res?.message || "Settings saved successfully";
          });
        } else {
          set((state) => {
            state.error = res?.message || "Failed to save settings";
          });
        }
      } catch (err: any) {
        set((state) => {
          state.error = err?.message || "Failed to save settings";
        });
      } finally {
        set((state) => {
          state.saving = false;
        });
      }
    },
  }))
);