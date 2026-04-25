import { FieldConfig } from "@/components/atom/Form";
import { post, get as get_http } from "@/service/http";
import { RequestRegisterUser, ResponseCreateUser } from "@/types/auth.types";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

type Product = {
    id: number,
    name: string,
    display_name: string,
    slug: string,
    image: string
}

type Paginate = {
    page: number,
    pageSize: number,
    total: number
}

export type ProductItem = {
    product_name: string,
    price: number,
    code: string,
    status: boolean,
    icon: string
}

interface ProductStore {
    loading: {

    };
    error: string | null;
    _abortController: AbortController | null;
    getProducts: (page: number) => void
    products: Array<Product>
    meta_products: Paginate
    current_step: number
    select_product: ProductItem | null,
    setCurrentStep: (step: number) => void
    setSelectedProduct: (item: ProductItem | null) => void
    all_form: any
    product_detail: {
        product: {
            display_name: string,
            image: string,
            account_config: any
        }
        product_items: Array<ProductItem>
    } | null
    getProductCategoryBySlug: (slug: string) => Promise<boolean>
}

export const useProductStore = create<ProductStore>()(
    immer((set, get) => ({
        loading: {
        },
        error: null,
        success: null,
        current_step: 0,
        _abortController: null,
        products: [],
        product_detail: null,
        meta_products: {
            page: 1,
            pageSize: 10,
            total: 0
        },
        select_product: null,
        setCurrentStep: (step: number) => {
            set((state) => {
                state.current_step = step;
            });
        },
        all_form:  null,
        getProducts: async (page: number = 1) => {
            set((state) => {
                state.error = null;
            });
            try {
                const res = await get_http<any>("/products", {
                    page: page,
                    pageSize: 10
                });

                set((s) => {
                    s.products = res.data.data,
                        s.meta_products = res.data.meta
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
        setSelectedProduct: (item: ProductItem | null) => {
            set((s) => {
                s.select_product = item
            })
        },
        getProductCategoryBySlug: async (slug: string) => {
            set((state) => {
                state.error = null;
            });
            try {
                const res = await get_http<any>(`/products/${slug}`);

                set((s) => {
                    s.product_detail = {
                        product: res.data.product,
                        product_items: res.data.product_items,
                    }
                })

                return true
            } catch (err: any) {
                set((state) => {
                    state.error = err.message;
                });

                return false
            } finally {
                set((state) => {
                });
            }
        }
    }))
)