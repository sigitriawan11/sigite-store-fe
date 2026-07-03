import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { post } from "@/service/http";
import { CreateOrderRequest, OrderResult } from "@/types/payment-gateway.types";

interface BalanceOrderRequest {
  product_code: string;
  phone: string;
  email: string;
  account_data: Record<string, string>;
}

interface PaymentStore {
  loading: boolean;
  error: string | null;
  order_result: OrderResult | null;
  createOrder: (payload: CreateOrderRequest) => Promise<OrderResult>;
  payWithBalance: (payload: BalanceOrderRequest) => Promise<{ ref_id: string }>;
  reset: () => void;
}

export const usePaymentStore = create<PaymentStore>()(
  immer((set) => ({
    loading: false,
    error: null,
    order_result: null,

    createOrder: async (payload: CreateOrderRequest): Promise<OrderResult> => {
      set((s) => {
        s.loading = true;
        s.error = null;
        s.order_result = null;
      });
      try {
        const res = await post<{ status: boolean; message: string; data: OrderResult }>(
          "/payment/orders",
          payload
        );
        set((s) => {
          s.order_result = res.data;
        });
        return res.data;
      } catch (error: any) {
        const msg: string = error?.message ?? "Failed to create order";
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

    payWithBalance: async (payload: BalanceOrderRequest): Promise<{ ref_id: string }> => {
      set((s) => {
        s.loading = true;
        s.error = null;
      });
      try {
        const res = await post<{ status: boolean; message: string; data: { ref_id: string } }>(
          "/account/orders/balance",
          payload
        );
        return res.data;
      } catch (error: any) {
        const msg: string = error?.message ?? "Failed to pay with balance";
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
        s.order_result = null;
      });
    },
  }))
);
