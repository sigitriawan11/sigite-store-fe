"use client";

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { get as getHttp, put as putHttp, del as delHttp, post as postHttp } from "@/service/http";

export interface UserPaginate {
  page: number;
  pageSize: number;
  total: number;
}

interface AdminUsersStore {
  users: Record<string, unknown>[];
  paginate: UserPaginate;
  loading: boolean;
  error: string | null;
  page: number;
  pageSize: number;
  search: string;

  showCreateModal: boolean;
  createLoading: boolean;
  createEmail: string;
  createPassword: string;
  createDisplayName: string;
  createPhoneNumber: string;
  createRoleId: string;
  createIsActive: boolean;
  createIsVerified: boolean;
  createError: string | null;
  createFieldErrors: Record<string, string>;

  showEditModal: boolean;
  editLoading: boolean;
  editDisplayName: string;
  editPhoneNumber: string;
  editRoleId: string;
  editIsActive: boolean;
  editIsVerified: boolean;
  editError: string | null;
  editFieldErrors: Record<string, string>;
  editUserId: string | null;

  showDetailModal: boolean;
  detailUser: Record<string, unknown> | null;
  detailLoading: boolean;
  setShowDetailModal: (show: boolean) => void;
  fetchUserDetail: (id: string) => Promise<void>;

  showDeleteModal: boolean;
  deleteLoading: boolean;
  deleteUserId: string | null;
  deleteUserDisplayName: string;

  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (search: string) => void;
  fetchUsers: () => Promise<void>;
  resetFilters: () => void;

  setShowCreateModal: (show: boolean) => void;
  setCreateEmail: (email: string) => void;
  setCreatePassword: (password: string) => void;
  setCreateDisplayName: (name: string) => void;
  setCreatePhoneNumber: (phone: string) => void;
  setCreateRoleId: (roleId: string) => void;
  setCreateIsActive: (active: boolean) => void;
  setCreateIsVerified: (verified: boolean) => void;
  createUser: () => Promise<void>;

  setShowEditModal: (show: boolean) => void;
  setEditDisplayName: (name: string) => void;
  setEditPhoneNumber: (phone: string) => void;
  setEditRoleId: (roleId: string) => void;
  setEditIsActive: (active: boolean) => void;
  setEditIsVerified: (verified: boolean) => void;
  openEditModal: (user: Record<string, unknown>) => void;
  updateUser: () => Promise<void>;

  setShowDeleteModal: (show: boolean) => void;
  openDeleteModal: (user: Record<string, unknown>) => void;
  deleteUser: () => Promise<void>;
}

const DEFAULT_ROLE_ID = "c788c670-2d0d-42f2-9c56-a60fcb78d859";

export const useAdminUsersStore = create<AdminUsersStore>()(
  immer((set, get) => ({
    users: [],
    paginate: { page: 1, pageSize: 10, total: 0 },
    loading: false,
    error: null,
    page: 1,
    pageSize: 10,
    search: "",

    showCreateModal: false,
    createLoading: false,
    createEmail: "",
    createPassword: "",
    createDisplayName: "",
    createPhoneNumber: "",
    createRoleId: DEFAULT_ROLE_ID,
    createIsActive: true,
    createIsVerified: false,
    createError: null,
    createFieldErrors: {},

    showEditModal: false,
    editLoading: false,
    editDisplayName: "",
    editPhoneNumber: "",
    editRoleId: DEFAULT_ROLE_ID,
    editIsActive: true,
    editIsVerified: false,
    editError: null,
    editFieldErrors: {},
    editUserId: null,

    showDetailModal: false,
    detailUser: null,
    detailLoading: false,

    showDeleteModal: false,
    deleteLoading: false,
    deleteUserId: null,
    deleteUserDisplayName: "",

    setShowDetailModal: (show: boolean) => {
      set((state) => {
        state.showDetailModal = show;
        if (!show) {
          state.detailUser = null;
          state.detailLoading = false;
        }
      });
    },

    fetchUserDetail: async (id: string) => {
      set((state) => {
        state.detailLoading = true;
        state.detailUser = null;
      });

      try {
        const res: any = await getHttp(`/admin/users/${id}`);

        if (res?.status === true && res?.data) {
          set((state) => {
            state.detailUser = res.data as Record<string, unknown>;
          });
        } else {
          set((state) => {
            state.detailUser = null;
          });
        }
      } catch (err: any) {
        set((state) => {
          state.detailUser = null;
        });
      } finally {
        set((state) => {
          state.detailLoading = false;
        });
      }
    },

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

    fetchUsers: async () => {
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

        const res: any = await getHttp("/admin/users", params);

        if (res?.status === true && res?.data) {
          set((state) => {
            state.users = res.data.data || [];
            state.paginate = res.data.paginate || {
              page: 1,
              pageSize: 10,
              total: 0,
            };
          });
        } else {
          set((state) => {
            state.users = [];
            state.paginate = { page: 1, pageSize: 10, total: 0 };
          });
        }
      } catch (err: any) {
        set((state) => {
          state.error = err?.message || "Failed to fetch users";
          state.users = [];
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

    setShowCreateModal: (show: boolean) => {
      set((state) => {
        state.showCreateModal = show;
        if (!show) {
          state.createEmail = "";
          state.createPassword = "";
          state.createDisplayName = "";
          state.createPhoneNumber = "";
          state.createRoleId = DEFAULT_ROLE_ID;
          state.createIsActive = true;
          state.createIsVerified = false;
          state.createError = null;
          state.createLoading = false;
        }
      });
    },

    setCreateEmail: (email: string) => {
      set((state) => { state.createEmail = email; });
    },

    setCreatePassword: (password: string) => {
      set((state) => { state.createPassword = password; });
    },

    setCreateDisplayName: (name: string) => {
      set((state) => { state.createDisplayName = name; });
    },

    setCreatePhoneNumber: (phone: string) => {
      set((state) => { state.createPhoneNumber = phone; });
    },

    setCreateRoleId: (roleId: string) => {
      set((state) => { state.createRoleId = roleId; });
    },

    setCreateIsActive: (active: boolean) => {
      set((state) => { state.createIsActive = active; });
    },

    setCreateIsVerified: (verified: boolean) => {
      set((state) => { state.createIsVerified = verified; });
    },

    createUser: async () => {
      set((state) => {
        state.createLoading = true;
        state.createError = null;
        state.createFieldErrors = {};
      });

      try {
        const {
          createEmail,
          createPassword,
          createDisplayName,
          createPhoneNumber,
          createRoleId,
          createIsActive,
          createIsVerified,
        } = get();

        const payload = {
          email: createEmail,
          password: createPassword,
          display_name: createDisplayName,
          phone_number: createPhoneNumber,
          role_id: createRoleId,
          is_active: createIsActive,
          is_verified: createIsVerified,
        };

        const res: any = await postHttp("/admin/users", payload);

        if (res?.status === true) {
          set((state) => {
            state.showCreateModal = false;
            state.createLoading = false;
          });
          get().fetchUsers();
        } else {
          set((state) => {
            state.createError = res?.message || "Failed to create user";
            state.createLoading = false;
          });
        }
      } catch (err: any) {
        set((state) => {
          const fieldErrors: Record<string, string> = {};
          if (err?.data?.data && Array.isArray(err.data.data)) {
            for (const item of err.data.data) {
              if (item?.field && item?.message) {
                fieldErrors[item.field] = item.message;
              }
            }
          }
          
          state.createFieldErrors = fieldErrors;
          if (Object.keys(fieldErrors).length === 0) {
            state.createError = err?.message || "Failed to create user";
          }
          state.createLoading = false;
        });
      }
    },

    setShowEditModal: (show: boolean) => {
      set((state) => {
        state.showEditModal = show;
        if (!show) {
          state.editError = null;
          state.editLoading = false;
          state.editUserId = null;
        }
      });
    },

    setEditDisplayName: (name: string) => {
      set((state) => { state.editDisplayName = name; });
    },

    setEditPhoneNumber: (phone: string) => {
      set((state) => { state.editPhoneNumber = phone; });
    },

    setEditRoleId: (roleId: string) => {
      set((state) => { state.editRoleId = roleId; });
    },

    setEditIsActive: (active: boolean) => {
      set((state) => { state.editIsActive = active; });
    },

    setEditIsVerified: (verified: boolean) => {
      set((state) => { state.editIsVerified = verified; });
    },

    openEditModal: (user: Record<string, unknown>) => {
      set((state) => {
        state.showEditModal = true;
        state.editUserId = user.id as string;
        state.editDisplayName = (user.display_name as string) || "";
        state.editPhoneNumber = (user.phone_number as string) || "";
        state.editRoleId = (user.role_id as string) || DEFAULT_ROLE_ID;
        state.editIsActive = (user.is_active as boolean) ?? true;
        state.editIsVerified = (user.is_verified as boolean) ?? false;
        state.editError = null;
        state.editLoading = false;
      });
    },

    updateUser: async () => {
      set((state) => {
        state.editLoading = true;
        state.editError = null;
        state.editFieldErrors = {};
      });

      try {
        const { editUserId, editDisplayName, editPhoneNumber, editRoleId, editIsActive, editIsVerified } = get();

        if (!editUserId) {
          set((state) => {
            state.editError = "User ID is missing";
            state.editLoading = false;
          });
          return;
        }

        const payload: Record<string, unknown> = {};

        if (editDisplayName) payload.display_name = editDisplayName;
        payload.phone_number = editPhoneNumber;
        payload.role_id = editRoleId;
        payload.is_active = editIsActive;
        payload.is_verified = editIsVerified;

        const res: any = await putHttp(`/admin/users/${editUserId}`, payload);

        if (res?.status === true) {
          set((state) => {
            state.showEditModal = false;
            state.editLoading = false;
            state.editUserId = null;
          });
          get().fetchUsers();
        } else {
          set((state) => {
            state.editError = res?.message || "Failed to update user";
            state.editLoading = false;
          });
        }
      } catch (err: any) {
        set((state) => {
          const fieldErrors: Record<string, string> = {};
          if (err?.data?.data && Array.isArray(err.data.data)) {
            for (const item of err.data.data) {
              if (item?.field && item?.message) {
                fieldErrors[item.field] = item.message;
              }
            }
          }
          
          state.editFieldErrors = fieldErrors;
          if (Object.keys(fieldErrors).length === 0) {
            state.editError = err?.message || "Failed to update user";
          }
          state.editLoading = false;
        });
      }
    },

    setShowDeleteModal: (show: boolean) => {
      set((state) => {
        state.showDeleteModal = show;
        if (!show) {
          state.deleteUserId = null;
          state.deleteUserDisplayName = "";
          state.deleteLoading = false;
        }
      });
    },

    openDeleteModal: (user: Record<string, unknown>) => {
      set((state) => {
        state.showDeleteModal = true;
        state.deleteUserId = user.id as string;
        state.deleteUserDisplayName = (user.display_name as string) || (user.email as string) || "this user";
      });
    },

    deleteUser: async () => {
      set((state) => {
        state.deleteLoading = true;
      });

      try {
        const { deleteUserId } = get();

        if (!deleteUserId) {
          set((state) => {
            state.deleteLoading = false;
          });
          return;
        }

        const res: any = await delHttp(`/admin/users/${deleteUserId}`);

        if (res?.status === true) {
          set((state) => {
            state.showDeleteModal = false;
            state.deleteLoading = false;
            state.deleteUserId = null;
          });
          get().fetchUsers();
        } else {
          set((state) => {
            state.deleteLoading = false;
          });
        }
      } catch (err: any) {
        set((state) => {
          state.deleteLoading = false;
        });
      }
    },
  }))
);