import { post } from "@/service/http";
import { RequestRegisterUser, ResponseCreateUser } from "@/types/auth.types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface AuthStore {
    loginProvider: () => void
    register: (payload: RequestRegisterUser) => Promise<string | boolean>
    loading: {
        login: boolean,
        register: boolean,
        logout: boolean
    };
    error: string | null;
    _abortController: AbortController | null;
}

export const useAuthStore = create<AuthStore>()(
    immer((set, get) => ({
        loading: {
            login: false,
            register: false,
            logout: false
        },
        error: null,
        success: null,
        _abortController: null,
        loginProvider: () => {
            window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
        },
        register: async (payload: RequestRegisterUser) : Promise<boolean> => {
            set((state) => {
                state.loading.register = true;
                state.error = null;
            });

            try {
                const res = await post<any>("/auth/register", payload);

                return res.message

            } catch (err: any) {
                set((state) => {
                    state.error = err.message;
                });

                return false
            } finally {
                set((state) => {
                    state.loading.register = false;
                });
            }
        },
    }))
)