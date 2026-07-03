import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { get as get_http } from "@/service/http";
import { useAuthStore } from "@/store/auth";

export const SALDO_CHANNEL_CODE = "SALDO";

export type ChannelItem = {
    "code": string,
    "channel_code": string,
    "name": string,
    "min": number,
    "max": number,
    "image": string,
    "is_active": boolean,
    "fee": number,
    "type_fee": '%' | '+'
}

type Channel = {
    "type": string,
    "name": string,
    "channels": Array<ChannelItem>
}

interface ChannelStore {
    getChannels: () => Promise<void>

    loading: {
    };
    channels: Array<Channel>;
    select_channel: ChannelItem | null;
    setSelectedChannel: (item: ChannelItem | null) => void
    saldoBalance: number;
    fetchSaldoBalance: () => Promise<void>;
    error: string | null;
    _abortController: AbortController | null;
}

export const useChannelStore = create<ChannelStore>()(
    immer((set, get) => ({
        loading: {
        },
        error: null,
        success: null,
        _abortController: null,
        select_channel: null,
        saldoBalance: 0,
        setSelectedChannel: (item: ChannelItem | null) => {
            set((s) => {
                s.select_channel = item
            })
        },
        fetchSaldoBalance: async () => {
            if (!useAuthStore.getState().isAuthenticated) return
            try {
                const res = await get_http<any>("/account/wallet", { page: 1, pageSize: 1 });
                const bal = Number(res?.data?.balance ?? 0);
                set((s) => {
                    s.saldoBalance = bal;
                });
            } catch {
            }
        },
        getChannels: async () => {
            try {
                const res = await get_http<any>("/payment/channels");

                const groups: Array<Channel> = Array.isArray(res.data) ? [...res.data] : [];

                const auth = useAuthStore.getState();
                if (auth.isAuthenticated) {
                    void get().fetchSaldoBalance();
                    const saldoGroup: Channel = {
                        type: "BALANCE",
                        name: "Wallet",
                        channels: [
                            {
                                code: SALDO_CHANNEL_CODE,
                                channel_code: SALDO_CHANNEL_CODE,
                                name: "Saldo / Wallet",
                                min: 0,
                                max: 999999999,
                                image: "",
                                is_active: true,
                                fee: 0,
                                type_fee: "+",
                            },
                        ],
                    };
                    groups.unshift(saldoGroup);
                }

                set((s) => {
                    s.channels = groups
                })
            } catch (error: any) {
                set((state) => {
                    state.error = error.message;
                });
            } finally {

            }
        },
        channels: []
    }))
)