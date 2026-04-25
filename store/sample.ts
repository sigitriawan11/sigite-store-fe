// /**
//  * stores/userStore.ts
//  * Zustand store — production grade
//  * Features: immer, persist, AbortController, optimistic update
//  */

// import { create } from "zustand";
// import { persist, createJSONStorage } from "zustand/middleware";
// import { immer } from "zustand/middleware/immer";
// import type { AxiosProgressEvent } from "axios";
// import { isCancelled } from "@/service/http";

// interface User {
//   id: number;
//   name: string;
//   email: string;
//   status: "active" | "inactive";
//   avatarUrl?: string;
// }

// interface UserFilters {
//   page: number;
//   limit: number;
//   search: string;
// }

// interface UserStore {
//   // ── State ──────────────────────────────────
//   users: User[];
//   selectedUser: User | null;
//   total: number;
//   filters: UserFilters;
//   uploadProgress: number;
//   loading: {
//     fetchAll: boolean;
//     fetchOne: boolean;
//     create: boolean;
//     update: boolean;
//     remove: boolean;
//     upload: boolean;
//   };
//   error: string | null;
//   _abortController: AbortController | null;

//   // ── Actions ────────────────────────────────
//   setFilters: (filters: Partial<UserFilters>) => void;
//   fetchAll: () => Promise<void>;
//   fetchById: (id: number) => Promise<void>;
//   create: (payload: { name: string; email: string; password: string }) => Promise<User | null>;
//   update: (id: number, payload: { name: string; email: string }) => Promise<void>;
//   updateStatus: (id: number, status: User["status"]) => Promise<void>;
//   remove: (id: number) => Promise<void>;
//   uploadAvatar: (id: number, file: File) => Promise<void>;
//   clearError: () => void;
//   clearSelected: () => void;
// }

// // ─────────────────────────────────────────────
// // STORE
// // ─────────────────────────────────────────────
// export const useUserStore = create<UserStore>()(
//   persist(
//     immer((set, get) => ({
//       // ── Initial State ──
//       users: [],
//       selectedUser: null,
//       total: 0,
//       filters: { page: 1, limit: 10, search: "" },
//       uploadProgress: 0,
//       loading: {
//         fetchAll: false,
//         fetchOne: false,
//         create: false,
//         update: false,
//         remove: false,
//         upload: false,
//       },
//       error: null,
//       _abortController: null,

//       // ── Set Filters → otomatis re-fetch ──
//       setFilters: (partial) => {
//         set((s) => {
//           Object.assign(s.filters, partial);
//         });
//         get().fetchAll();
//       },

//       // ── GET list ──
//       fetchAll: async () => {
//         // Abort request sebelumnya kalau masih in-flight
//         get()._abortController?.abort();
//         const controller = new AbortController();
//         set((s) => {
//           s._abortController = controller;
//           s.loading.fetchAll = true;
//           s.error = null;
//         });

//         try {
//           const res = await UserService.getAll(get().filters, {
//             signal: controller.signal,
//           });
//           set((s) => {
//             s.users = res.data;
//             s.total = res.meta.total;
//           });
//         } catch (err: any) {
//           if (!isCancelled(err) && err.name !== "CanceledError") {
//             set((s) => { s.error = err.message; });
//           }
//         } finally {
//           set((s) => { s.loading.fetchAll = false; });
//         }
//       },

//       // ── GET single ──
//       fetchById: async (id) => {
//         set((s) => {
//           s.loading.fetchOne = true;
//           s.error = null;
//         });
//         try {
//           const user = await UserService.getById(id);
//           set((s) => { s.selectedUser = user; });
//         } catch (err: any) {
//           set((s) => { s.error = err.message; });
//         } finally {
//           set((s) => { s.loading.fetchOne = false; });
//         }
//       },

//       // ── POST create ──
//       create: async (payload) => {
//         set((s) => {
//           s.loading.create = true;
//           s.error = null;
//         });
//         try {
//           const newUser = await UserService.create(payload);
//           // Optimistic prepend
//           set((s) => {
//             s.users.unshift(newUser);
//             s.total += 1;
//           });
//           return newUser;
//         } catch (err: any) {
//           set((s) => { s.error = err.message; });
//           return null;
//         } finally {
//           set((s) => { s.loading.create = false; });
//         }
//       },

//       // ── PUT full update ──
//       update: async (id, payload) => {
//         // Simpan snapshot untuk rollback
//         const snapshot = get().users.find((u) => u.id === id);

//         // Optimistic update
//         set((s) => {
//           const user = s.users.find((u) => u.id === id);
//           if (user) Object.assign(user, payload);
//           s.loading.update = true;
//           s.error = null;
//         });

//         try {
//           const updated = await UserService.update(id, payload);
//           set((s) => {
//             const idx = s.users.findIndex((u) => u.id === id);
//             if (idx !== -1) s.users[idx] = updated;
//             if (s.selectedUser?.id === id) s.selectedUser = updated;
//           });
//         } catch (err: any) {
//           // Rollback
//           set((s) => {
//             const idx = s.users.findIndex((u) => u.id === id);
//             if (idx !== -1 && snapshot) s.users[idx] = snapshot;
//             s.error = err.message;
//           });
//         } finally {
//           set((s) => { s.loading.update = false; });
//         }
//       },

//       // ── PATCH status ──
//       updateStatus: async (id, status) => {
//         const snapshot = get().users.find((u) => u.id === id);

//         // Optimistic update
//         set((s) => {
//           const user = s.users.find((u) => u.id === id);
//           if (user) user.status = status;
//           s.loading.update = true;
//           s.error = null;
//         });

//         try {
//           const updated = await UserService.updateStatus(id, status);
//           set((s) => {
//             const idx = s.users.findIndex((u) => u.id === id);
//             if (idx !== -1) s.users[idx] = updated;
//           });
//         } catch (err: any) {
//           // Rollback
//           set((s) => {
//             const idx = s.users.findIndex((u) => u.id === id);
//             if (idx !== -1 && snapshot) s.users[idx] = snapshot;
//             s.error = err.message;
//           });
//         } finally {
//           set((s) => { s.loading.update = false; });
//         }
//       },

//       // ── DELETE ──
//       remove: async (id) => {
//         const snapshot = get().users.find((u) => u.id === id);
//         const snapshotTotal = get().total;

//         // Optimistic remove
//         set((s) => {
//           s.users = s.users.filter((u) => u.id !== id);
//           s.total -= 1;
//           s.loading.remove = true;
//           s.error = null;
//         });

//         try {
//           await UserService.remove(id);
//         } catch (err: any) {
//           // Rollback
//           set((s) => {
//             if (snapshot) s.users.unshift(snapshot);
//             s.total = snapshotTotal;
//             s.error = err.message;
//           });
//         } finally {
//           set((s) => { s.loading.remove = false; });
//         }
//       },

//       // ── UPLOAD avatar ──
//       uploadAvatar: async (id, file) => {
//         set((s) => {
//           s.loading.upload = true;
//           s.uploadProgress = 0;
//           s.error = null;
//         });
//         try {
//           const updated = await UserService.uploadAvatar(
//             id,
//             file,
//             (event: AxiosProgressEvent) => {
//               const percent = Math.round((event.progress ?? 0) * 100);
//               set((s) => { s.uploadProgress = percent; });
//             }
//           );
//           set((s) => {
//             const idx = s.users.findIndex((u) => u.id === id);
//             if (idx !== -1) s.users[idx] = updated;
//           });
//         } catch (err: any) {
//           set((s) => { s.error = err.message; });
//         } finally {
//           set((s) => {
//             s.loading.upload = false;
//             s.uploadProgress = 0;
//           });
//         }
//       },

//       clearError: () => set((s) => { s.error = null; }),
//       clearSelected: () => set((s) => { s.selectedUser = null; }),
//     })),
//     {
//       name: "user-store",
//       storage: createJSONStorage(() => localStorage),
//       // Hanya persist data yang relevan, bukan loading/error/_abortController
//       partialize: (s) => ({
//         filters: s.filters,
//         users: s.users,
//         total: s.total,
//       }),
//     }
//   )
// );

// // ─────────────────────────────────────────────
// // SELECTORS
// // ─────────────────────────────────────────────
// export const useUsers = () => useUserStore((s) => s.users);
// export const useSelectedUser = () => useUserStore((s) => s.selectedUser);
// export const useUserFilters = () => useUserStore((s) => s.filters);
// export const useUserTotal = () => useUserStore((s) => s.total);
// export const useUserError = () => useUserStore((s) => s.error);
// export const useUserLoading = (key: keyof UserStore["loading"]) =>
//   useUserStore((s) => s.loading[key]);
// export const useUploadProgress = () => useUserStore((s) => s.uploadProgress);