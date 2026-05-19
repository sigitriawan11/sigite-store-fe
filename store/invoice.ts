import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { get } from "@/service/http";
import { InvoiceResult } from "@/types/payment-gateway.types";

interface InvoiceStore {
  loading: boolean;
  error: string | null;
  invoice: InvoiceResult | null;
  getInvoice: (ref_id: string) => Promise<void>;
  reset: () => void;
}

export const useInvoiceStore = create<InvoiceStore>()(
  immer((set) => ({
    loading: false,
    error: null,
    invoice: null,

    getInvoice: async (ref_id: string) => {
      set((s) => {
        s.loading = true;
        s.error = null;
      });
      try {
        const res = await get<{ status: boolean; message: string; data: InvoiceResult }>(
          `/payment/invoice/${ref_id}`
        );
        set((s) => {
          s.invoice = res.data;
        });
      } catch (error: any) {
        const msg: string = error?.message ?? "Failed to load invoice";
        set((s) => {
          s.error = msg;
        });
        throw error;
      } finally {
        set((s) => {
          s.loading = false;
        });
      }
    },

    reset: () => {
      set((s) => {
        s.loading = false;
        s.error = null;
        s.invoice = null;
      });
    },
  }))
);
