"use client";

import { useEffect, useCallback } from "react";
import { useAdminUsersStore } from "@/store/adminUsers";
import DynamicTable from "@/components/dashboard/DynamicTable";
import {
  BiSearch,
  BiReset,
  BiUser,
  BiX,
  BiEdit,
  BiTrash,
  BiShow,
  BiCheck,
  BiXCircle,
  BiPlus,
} from "react-icons/bi";

export default function AdminUsersPage() {
  const {
    users,
    paginate,
    loading,
    error,
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    setSearch,
    fetchUsers,
    resetFilters,

    showCreateModal,
    createLoading,
    createEmail,
    createPassword,
    createDisplayName,
    createPhoneNumber,
    createRoleId,
    createIsActive,
    createIsVerified,
    createError,
    createFieldErrors,
    setShowCreateModal,
    setCreateEmail,
    setCreatePassword,
    setCreateDisplayName,
    setCreatePhoneNumber,
    setCreateRoleId,
    setCreateIsActive,
    setCreateIsVerified,
    createUser,

    showDetailModal,
    detailUser,
    detailLoading,
    setShowDetailModal,
    fetchUserDetail,

    showEditModal,
    editLoading,
    editDisplayName,
    editPhoneNumber,
    editRoleId,
    editIsActive,
    editIsVerified,
    editError,
    editFieldErrors,
    setShowEditModal,
    setEditDisplayName,
    setEditPhoneNumber,
    setEditRoleId,
    setEditIsActive,
    setEditIsVerified,
    openEditModal,
    updateUser,

    showDeleteModal,
    deleteLoading,
    deleteUserDisplayName,
    setShowDeleteModal,
    openDeleteModal,
    deleteUser,
  } = useAdminUsersStore();

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, page, pageSize]);

  const columns = [
    "email",
    "display_name",
    "phone_number",
    "role_id",
    "is_active",
    "is_verified",
    "created_at",
    "actions",
  ];

  const handleSearch = useCallback(() => {
    setPage(1);
    fetchUsers();
  }, [setPage, fetchUsers]);

  const handleReset = useCallback(() => {
    resetFilters();
    fetchUsers();
  }, [resetFilters, fetchUsers]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleViewDetail = useCallback(
    (row: Record<string, unknown>) => {
      const id = row.id as string;
      fetchUserDetail(id);
    },
    [fetchUserDetail]
  );

  const formatDate = (value: unknown): string => {
    if (!value) return "-";
    const date = new Date(value as string);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRoleName = (roleId: unknown): string => {
    if (roleId === "40463aa4-1c77-4358-b4e8-02f42b414184") return "Super Admin";
    if (roleId === "c788c670-2d0d-42f2-9c56-a60fcb78d859") return "User";
    return (roleId as string) || "-";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage and view all registered users
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-(--color-1) hover:bg-(--color-2) text-white text-sm font-medium rounded-lg transition-colors"
        >
          <BiPlus size={16} />
          Add User
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl p-4 lg:p-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="w-full sm:w-72">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              <BiSearch className="inline mr-1 -mt-0.5" size={14} />
              Search
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search by email, name, or phone..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-(--color-1) hover:bg-(--color-2) text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <BiSearch size={16} />
              Search
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
            >
              <BiReset size={16} />
              Reset
            </button>
          </div>
        </div>
      </div>

      <DynamicTable
        columns={columns}
        data={users}
        loading={loading}
        paginate={paginate}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        emptyMessage="No users found matching your filters"
        columnRenderers={{
          role_id: (value) => (
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                value === "40463aa4-1c77-4358-b4e8-02f42b414184"
                  ? "bg-purple-500/10 text-purple-400 border border-purple-500/20"
                  : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
              }`}
            >
              {getRoleName(value)}
            </span>
          ),
          is_active: (value) => {
            const active = value === true || value === "true";
            return active ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                Inactive
              </span>
            );
          },
          is_verified: (value) => {
            const verified = value === true || value === "true";
            return verified ? (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                <BiCheck size={14} />
                Verified
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <BiXCircle size={14} />
                Unverified
              </span>
            );
          },
          created_at: (value) => (
            <span className="text-xs text-gray-400">{formatDate(value)}</span>
          ),
          email: (value, row) => (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-(--color-1)/10 flex items-center justify-center shrink-0">
                <BiUser className="text-(--color-1)" size={14} />
              </div>
              <div className="min-w-0">
                <span className="text-sm text-white truncate block max-w-[200px]">
                  {String(value ?? "")}
                </span>
                {row.display_name ? (
                  <p className="text-xs text-gray-500 truncate max-w-[200px]">
                    {String(row.display_name)}
                  </p>
                ) : null}
              </div>
            </div>
          ),
          actions: (_value, row) => (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleViewDetail(row)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-(--color-1) hover:bg-(--color-1)/10 transition-colors"
                title="View Detail"
              >
                <BiShow size={16} />
              </button>
              <button
                onClick={() => openEditModal(row)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition-colors"
                title="Edit User"
              >
                <BiEdit size={16} />
              </button>
              <button
                onClick={() => openDeleteModal(row)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                title="Delete User"
              >
                <BiTrash size={16} />
              </button>
            </div>
          ),
        }}
      />

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="relative bg-[#0e1324] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-(--color-1)/10 flex items-center justify-center">
                  <BiUser className="text-(--color-1)" size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Add User</h2>
                  <p className="text-xs text-gray-500">Create a new user account</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              >
                <BiX size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {createError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                  {createError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="user@example.com"
                  className={`w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors ${
                    createFieldErrors?.email ? 'border-red-500/50' : 'border-white/10'
                  }`}
                />
                {createFieldErrors?.email && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    {createFieldErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Password <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="Min. 8 characters with uppercase, lowercase, and number"
                  className={`w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors ${
                    createFieldErrors?.password ? 'border-red-500/50' : 'border-white/10'
                  }`}
                />
                {createFieldErrors?.password && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    {createFieldErrors.password}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Display Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={createDisplayName}
                  onChange={(e) => setCreateDisplayName(e.target.value)}
                  placeholder="User display name"
                  className={`w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors ${
                    createFieldErrors?.display_name ? 'border-red-500/50' : 'border-white/10'
                  }`}
                />
                {createFieldErrors?.display_name && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    {createFieldErrors.display_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={createPhoneNumber}
                  onChange={(e) => setCreatePhoneNumber(e.target.value)}
                  placeholder="e.g. 08123456789"
                  className={`w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors ${
                    createFieldErrors?.phone_number ? 'border-red-500/50' : 'border-white/10'
                  }`}
                />
                {createFieldErrors?.phone_number && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    {createFieldErrors.phone_number}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Role <span className="text-red-400">*</span>
                </label>
                <select
                  value={createRoleId}
                  onChange={(e) => setCreateRoleId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-(--color-1)/50 transition-colors"
                >
                  <option value="c788c670-2d0d-42f2-9c56-a60fcb78d859">User</option>
                  <option value="40463aa4-1c77-4358-b4e8-02f42b414184">Super Admin</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Active Status
                  </label>
                  <p className="text-xs text-gray-600">Allow user to login immediately</p>
                </div>
                <button
                  onClick={() => setCreateIsActive(!createIsActive)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    createIsActive ? "bg-emerald-500" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      createIsActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Verified
                  </label>
                  <p className="text-xs text-gray-600">Mark email as verified</p>
                </div>
                <button
                  onClick={() => setCreateIsVerified(!createIsVerified)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    createIsVerified ? "bg-blue-500" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      createIsVerified ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
              <button
                onClick={() => setShowCreateModal(false)}
                disabled={createLoading}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-lg transition-colors border border-white/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={createUser}
                disabled={createLoading}
                className="flex items-center gap-2 px-5 py-2 bg-(--color-1) hover:bg-(--color-2) text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {createLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <BiPlus size={16} />
                    Create User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDetailModal(false)}
          />
          <div className="relative bg-[#0e1324] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-(--color-1)/10 flex items-center justify-center">
                  <BiUser className="text-(--color-1)" size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">User Detail</h2>
                  <p className="text-xs text-gray-500">View user information</p>
                </div>
              </div>
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              >
                <BiX size={20} />
              </button>
            </div>

            <div className="p-5">
              {detailLoading ? (
                <div className="flex items-center justify-center py-8">
                  <svg className="animate-spin h-8 w-8 text-(--color-1)" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
              ) : detailUser ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 pb-4 border-b border-white/10">
                    <div className="w-14 h-14 rounded-full bg-(--color-1)/20 flex items-center justify-center shrink-0">
                      <BiUser className="text-(--color-1)" size={28} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {String(detailUser.display_name ?? "No Name")}
                      </h3>
                      <p className="text-sm text-gray-400 truncate">
                        {String(detailUser.email ?? "")}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Phone Number</p>
                      <p className="text-sm text-white">
                        {String(detailUser.phone_number ?? "-")}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Role</p>
                      <p className="text-sm text-white">
                        {getRoleName(detailUser.role_id)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Status</p>
                      <p>
                        {detailUser.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            Inactive
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Verified</p>
                      <p>
                        {detailUser.is_verified ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                            <BiCheck size={14} />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                            <BiXCircle size={14} />
                            Unverified
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Created At</p>
                      <p className="text-sm text-white">
                        {formatDate(detailUser.created_at)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Updated At</p>
                      <p className="text-sm text-white">
                        {formatDate(detailUser.updated_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">User not found</p>
              )}
            </div>

            <div className="flex items-center justify-end p-5 border-t border-white/10">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-lg transition-colors border border-white/10"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowEditModal(false)}
          />
          <div className="relative bg-[#0e1324] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <BiEdit className="text-amber-400" size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Edit User</h2>
                  <p className="text-xs text-gray-500">Update user information</p>
                </div>
              </div>
              <button
                onClick={() => setShowEditModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              >
                <BiX size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {editError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                  {editError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="User display name"
                  className={`w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors ${
                    editFieldErrors?.display_name ? 'border-red-500/50' : 'border-white/10'
                  }`}
                />
                {editFieldErrors?.display_name && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    {editFieldErrors.display_name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={editPhoneNumber}
                  onChange={(e) => setEditPhoneNumber(e.target.value)}
                  placeholder="e.g. 08123456789"
                  className={`w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors ${
                    editFieldErrors?.phone_number ? 'border-red-500/50' : 'border-white/10'
                  }`}
                />
                {editFieldErrors?.phone_number && (
                  <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
                    <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    {editFieldErrors.phone_number}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Role
                </label>
                <select
                  value={editRoleId}
                  onChange={(e) => setEditRoleId(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-(--color-1)/50 transition-colors"
                >
                  <option value="40463aa4-1c77-4358-b4e8-02f42b414184">Super Admin</option>
                  <option value="c788c670-2d0d-42f2-9c56-a60fcb78d859">User</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Active Status
                  </label>
                  <p className="text-xs text-gray-600">Allow user to login and use the system</p>
                </div>
                <button
                  onClick={() => setEditIsActive(!editIsActive)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    editIsActive ? "bg-emerald-500" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      editIsActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">
                    Verified
                  </label>
                  <p className="text-xs text-gray-600">Mark user email as verified</p>
                </div>
                <button
                  onClick={() => setEditIsVerified(!editIsVerified)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    editIsVerified ? "bg-blue-500" : "bg-gray-600"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                      editIsVerified ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
              <button
                onClick={() => setShowEditModal(false)}
                disabled={editLoading}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-lg transition-colors border border-white/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={updateUser}
                disabled={editLoading}
                className="flex items-center gap-2 px-5 py-2 bg-(--color-1) hover:bg-(--color-2) text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <BiEdit size={16} />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative bg-[#0e1324] border border-white/10 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <BiTrash className="text-red-400" size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Delete User</h2>
                  <p className="text-xs text-gray-500">Confirm user deletion</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              >
                <BiX size={20} />
              </button>
            </div>

            <div className="p-5">
              <p className="text-sm text-gray-300">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-white">
                  {deleteUserDisplayName}
                </span>
                ? This action will soft-delete the user. They will not be able to login again.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleteLoading}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-lg transition-colors border border-white/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={deleteUser}
                disabled={deleteLoading}
                className="flex items-center gap-2 px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <BiTrash size={16} />
                    Delete User
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}