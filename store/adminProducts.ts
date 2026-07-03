"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { get as getHttp } from "@/service/http";

export interface ProductPaginate {
  page: number;
  pageSize: number;
  total: number;
}

interface ProductCategory {
  id: number;
  name: string;
}

interface AdminProductsStore {
  products: Record<string, unknown>[];
  categories: ProductCategory[];
  paginate: ProductPaginate;
  loading: boolean;
  loadingCategories: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  search: string;
  categoryId: number | null;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (search: string) => void;
  setCategoryId: (categoryId: number | null) => void;
  fetchProducts: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  resetFilters: () => void;
}

export const useAdminProductsStore = create<AdminProductsStore>()(
  immer((set, get) => ({
    products: [],
    categories: [],
    paginate: { page: 1, pageSize: 10, total: 0 },
    loading: false,
    loadingCategories: false,
    error: null,
    page: 1,
    pageSize: 10,
    search: "",
    categoryId: null,

    setPage: (page: number) => {
      set((state) => {
        state.page = page;
      });
    },

    setPageSize: (pageSize: number) => {
      set((state) => {
        state.pageSize = pageSize;
        state.page = 1;
      });
    },

    setSearch: (search: string) => {
      set((state) => {
        state.search = search;
      });
    },

    setCategoryId: (categoryId: number | null) => {
      set((state) => {
        state.categoryId = categoryId;
      });
    },

    fetchProducts: async () => {
      set((state) => {
        state.loading = true;
        state.error = null;
      });

      try {
        const { page, pageSize, search, categoryId } = get();
        const params: Record<string, unknown> = {
          page,
          pageSize,
        };
        if (search) params.search = search;
        if (categoryId !== null) params.categoryId = categoryId;

        const res: any = await getHttp("/admin/products", params);

        if (res?.status === true && res?.data) {
          set((state) => {
            state.products = res.data.data || [];
            state.paginate = res.data.paginate || {
              page: 1,
              pageSize: 10,
              total: 0,
            };
          });
        } else {
          set((state) => {
            state.products = [];
            state.paginate = { page: 1, pageSize: 10, total: 0 };
          });
        }
      } catch (err: any) {
        set((state) => {
          state.error = err?.message || "Failed to fetch products";
          state.products = [];
          state.paginate = { page: 1, pageSize: 10, total: 0 };
        });
      } finally {
        set((state) => {
          state.loading = false;
        });
      }
    },

    fetchCategories: async () => {
      set((state) => {
        state.loadingCategories = true;
      });

      try {
        const res: any = await getHttp("/admin/categories", {
          page: 1,
          pageSize: 999,
        });

        if (res?.status === true && res?.data?.data) {
          set((state) => {
            state.categories = res.data.data.map((cat: any) => ({
              id: cat.id,
              name: cat.display_name || cat.name,
            }));
          });
        }
      } catch {
        
      } finally {
        set((state) => {
          state.loadingCategories = false;
        });
      }
    },

    resetFilters: () => {
      set((state) => {
        state.search = "";
        state.categoryId = null;
        state.page = 1;
      });
    },
  }))
);