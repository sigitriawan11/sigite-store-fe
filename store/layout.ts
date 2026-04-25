import { post, get as get_http } from "@/service/http";
import { RequestRegisterUser, ResponseCreateUser } from "@/types/auth.types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface LayoutStore {
    loading: {

    };
    error: string | null;
    _abortController: AbortController | null;
    menu: string | null;
    setMenu: (menu: string) => void
    banners: Array<{
        id: string,
        image: string
    }>,
    getBanners: () => void
}

export const useLayoutStore = create<LayoutStore>()(
    immer((set, get) => ({
        loading: {
        },
        error: null,
        success: null,
        _abortController: null,
        menu: 'topup',
        setMenu: (menu: string) => {
            set({
                menu: menu
            })
        },
        banners: [],
        getBanners: async () => {
            try {
                const res = await get_http<any>("/banners");

                set({
                    banners: res.data,
                })

                return res
            } catch (err: any) {
                set((state) => {
                    state.error = err.message;
                });

                return false
            } finally {
                set((state) => {
                });
            }
        },
    }))
)