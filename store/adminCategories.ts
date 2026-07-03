"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { get as getHttp, patch as patchHttp, put as putHttp, upload as uploadHttp } from "@/service/http";

export interface CategoryPaginate {
  page: number;
  pageSize: number;
  total: number;
}

interface AdminCategoriesStore {
  categories: Record<string, unknown>[];
  paginate: CategoryPaginate;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  search: string;

  showAddModal: boolean;
  addLoading: boolean;
  addName: string;
  addDisplayName: string;
  addImage: File | null;
  addImagePreview: string | null;
  addError: string | null;

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (search: string) => void;
  fetchCategories: () => Promise<void>;
  resetFilters: () => void;

  setShowAddModal: (show: boolean) => void;
  setAddName: (name: string) => void;
  setAddDisplayName: (name: string) => void;
  setAddImage: (file: File | null) => void;
  resetAddForm: () => void;
  createCategory: () => Promise<void>;

  toggleStatusLoading: boolean;
  toggleStatusId: number | null;
  toggleCategoryStatus: (id: number) => Promise<void>;

  showEditModal: boolean;
  editLoading: boolean;
  editId: number | null;
  editName: string;
  editDisplayName: string;
  editImage: File | null;
  editImagePreview: string | null;
  editCurrentImage: string | null;
  editError: string | null;
  openEditModal: (category: Record<string, unknown>) => void;
  closeEditModal: () => void;
  setEditName: (name: string) => void;
  setEditDisplayName: (name: string) => void;
  setEditImage: (file: File | null) => void;
  updateCategory: () => Promise<void>;
}

export const useAdminCategoriesStore = create<AdminCategoriesStore>()(
  immer((set, get) => ({
    categories: [],
    paginate: { page: 1, pageSize: 10, total: 0 },
    loading: false,
    error: null,
    page: 1,
    pageSize: 10,
    search: "",

    showAddModal: false,
    addLoading: false,
    addName: "",
    addDisplayName: "",
    addImage: null,
    addImagePreview: null,
    addError: null,

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

    fetchCategories: async () => {
      set((state) => {
        state.loading = true;
        state.error = null;
      });

      try {
        const { page, pageSize, search } = get();
        const params: Record<string, unknown> = {
          page,
          pageSize,
        };
        if (search) params.search = search;

        const res: any = await getHttp("/admin/categories", params);

        if (res?.status === true && res?.data) {
          set((state) => {
            state.categories = res.data.data || [];
            state.paginate = res.data.paginate || {
              page: 1,
              pageSize: 10,
              total: 0,
            };
          });
        } else {
          set((state) => {
            state.categories = [];
            state.paginate = { page: 1, pageSize: 10, total: 0 };
          });
        }
      } catch (err: any) {
        set((state) => {
          state.error = err?.message || "Failed to fetch categories";
          state.categories = [];
          state.paginate = { page: 1, pageSize: 10, total: 0 };
        });
      } finally {
        set((state) => {
          state.loading = false;
        });
      }
    },

    resetFilters: () => {
      set((state) => {
        state.search = "";
        state.page = 1;
      });
    },

    setShowAddModal: (show: boolean) => {
      set((state) => {
        state.showAddModal = show;
        if (!show) {
          state.addName = "";
          state.addDisplayName = "";
          state.addImage = null;
          state.addImagePreview = null;
          state.addError = null;
          state.addLoading = false;
        }
      });
    },

    setAddName: (name: string) => {
      set((state) => {
        state.addName = name;
      });
    },

    setAddDisplayName: (name: string) => {
      set((state) => {
        state.addDisplayName = name;
      });
    },

    setAddImage: (file: File | null) => {
      set((state) => {
        state.addImage = file;
        if (file) {
          state.addImagePreview = URL.createObjectURL(file);
        } else {
          state.addImagePreview = null;
        }
      });
    },

    resetAddForm: () => {
      set((state) => {
        state.addName = "";
        state.addDisplayName = "";
        state.addImage = null;
        state.addImagePreview = null;
        state.addError = null;
        state.addLoading = false;
      });
    },

    createCategory: async () => {
      set((state) => {
        state.addLoading = true;
        state.addError = null;
      });

      try {
        const { addName, addDisplayName, addImage } = get();

        if (!addName.trim()) {
          set((state) => {
            state.addError = "Name is required";
            state.addLoading = false;
          });
          return;
        }

        const formData = new FormData();
        formData.append("name", addName.trim());
        formData.append("display_name", addDisplayName.trim() || addName.trim());
        if (addImage) {
          formData.append("image", addImage);
        }

        const res: any = await uploadHttp("/admin/categories", formData);

        if (res?.status === true) {
          set((state) => {
            state.showAddModal = false;
            state.addName = "";
            state.addDisplayName = "";
            state.addImage = null;
            state.addImagePreview = null;
            state.addLoading = false;
          });
          get().fetchCategories();
        } else {
          set((state) => {
            state.addError = res?.message || "Failed to create category";
            state.addLoading = false;
          });
        }
      } catch (err: any) {
        set((state) => {
          state.addError = err?.message || "Failed to create category";
          state.addLoading = false;
        });
      }
    },

    toggleStatusLoading: false,
    toggleStatusId: null as number | null,
    toggleCategoryStatus: async (id: number) => {
      set((state) => {
        state.toggleStatusLoading = true;
        state.toggleStatusId = id;
      });
      try {
        const res: any = await patchHttp(`/admin/categories/${id}/toggle-status`);
        if (res?.status === true) {
          get().fetchCategories();
        }
      } catch (err: any) {
      } finally {
        set((state) => {
          state.toggleStatusLoading = false;
          state.toggleStatusId = null;
        });
      }
    },

    showEditModal: false,
    editLoading: false,
    editId: null as number | null,
    editName: "",
    editDisplayName: "",
    editImage: null as File | null,
    editImagePreview: null as string | null,
    editCurrentImage: null as string | null,
    editError: null as string | null,

    openEditModal: (category: Record<string, unknown>) => {
      set((state) => {
        state.showEditModal = true;
        state.editId = Number(category.Id);
        state.editName = String(category["DigiFlazz Name"] ?? category.Name ?? "");
        state.editDisplayName = String(category.Name ?? "");
        state.editImage = null;
        state.editImagePreview = null;
        state.editCurrentImage = category.Image ? String(category.Image) : null;
        state.editError = null;
        state.editLoading = false;
      });
    },

    closeEditModal: () => {
      set((state) => {
        state.showEditModal = false;
        state.editId = null;
        state.editName = "";
        state.editDisplayName = "";
        state.editImage = null;
        state.editImagePreview = null;
        state.editCurrentImage = null;
        state.editError = null;
        state.editLoading = false;
      });
    },

    setEditName: (name: string) => {
      set((state) => {
        state.editName = name;
      });
    },

    setEditDisplayName: (name: string) => {
      set((state) => {
        state.editDisplayName = name;
      });
    },

    setEditImage: (file: File | null) => {
      set((state) => {
        state.editImage = file;
        state.editImagePreview = file ? URL.createObjectURL(file) : null;
      });
    },

    updateCategory: async () => {
      set((state) => {
        state.editLoading = true;
        state.editError = null;
      });

      try {
        const { editId, editName, editDisplayName, editImage } = get();

        if (editId === null) {
          set((state) => {
            state.editLoading = false;
          });
          return;
        }

        if (!editName.trim()) {
          set((state) => {
            state.editError = "Name is required";
            state.editLoading = false;
          });
          return;
        }

        const formData = new FormData();
        formData.append("name", editName.trim());
        formData.append("display_name", editDisplayName.trim() || editName.trim());
        if (editImage) {
          formData.append("image", editImage);
        }

        const res: any = await putHttp(`/admin/categories/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (res?.status === true) {
          set((state) => {
            state.showEditModal = false;
            state.editId = null;
            state.editName = "";
            state.editDisplayName = "";
            state.editImage = null;
            state.editImagePreview = null;
            state.editCurrentImage = null;
            state.editLoading = false;
          });
          get().fetchCategories();
        } else {
          set((state) => {
            state.editError = res?.message || "Failed to update category";
            state.editLoading = false;
          });
        }
      } catch (err: any) {
        set((state) => {
          state.editError = err?.message || "Failed to update category";
          state.editLoading = false;
        });
      }
    },
  }))
);
