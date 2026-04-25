import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { get as get_http } from "@/service/http";

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
        setSelectedChannel: (item: ChannelItem | null) => {
            set((s) => {
                s.select_channel = item
            })
        },
        getChannels: async () => {
            try {
                const res = await get_http<any>("/payment/channels");

                set((s) => {
                    s.channels = res.data
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