import { create } from "zustand";
import { get } from "@/service/http";

export interface PublicSettings {
  site_name?: string;
  site_description?: string;
  logo_url?: string;
  contact_email?: string;
  contact_phone?: string;
  maintenance_mode?: boolean;
}

interface PublicSettingsState {
  settings: PublicSettings | null;
  loading: boolean;
  error: string | null;
  fetched: boolean;
  fetchSettings: () => Promise<void>;
}

export const usePublicSettingsStore = create<PublicSettingsState>((set, storeGet) => ({
  settings: null,
  loading: false,
  error: null,
  fetched: false,

  fetchSettings: async () => {
    if (storeGet().fetched) return;

    set({ loading: true, error: null });

    try {
      const response = await get<{
        status: boolean;
        data: PublicSettings;
      }>("/settings/public");

      set({
        settings: response.data,
        loading: false,
        fetched: true,
      });
    } catch (error: unknown) {
      const err = error as { message?: string };
      set({
        loading: false,
        error: err?.message || "Failed to load settings",
        fetched: true,
      });
    }
  },
}));