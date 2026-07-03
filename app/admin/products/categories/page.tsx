"use client";

import { useEffect, useCallback, useMemo, useRef, ReactNode } from "react";
import { useAdminCategoriesStore } from "@/store/adminCategories";
import DynamicTable from "@/components/dashboard/DynamicTable";
import { BiSearch, BiReset, BiCategory, BiPlus, BiX, BiImage, BiEdit } from "react-icons/bi";

const IMAGE_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/v1", "") ?? "";

export default function AdminCategoriesPage() {
  const {
    categories,
    paginate,
    loading,
    error,
    page,
    pageSize,
    search,
    setPage,
    setPageSize,
    setSearch,
    fetchCategories,
    resetFilters,

    showAddModal,
    addLoading,
    addName,
    addDisplayName,
    addImagePreview,
    addError,
    setShowAddModal,
    setAddName,
    setAddDisplayName,
    setAddImage,
    createCategory,

    toggleStatusLoading,
    toggleStatusId,
    toggleCategoryStatus,

    showEditModal,
    editLoading,
    editName,
    editDisplayName,
    editImagePreview,
    editCurrentImage,
    editError,
    openEditModal,
    closeEditModal,
    setEditName,
    setEditDisplayName,
    setEditImage,
    updateCategory,
  } = useAdminCategoriesStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories, page, pageSize]);

  const columns = useMemo(() => {
    if (categories.length === 0) return [];

    const keys = Object.keys(categories[0]);

    const priorityOrder = ["Name", "DigiFlazz Name", "Image", "Slug", "Status", "Created At"];
    const prioritized = priorityOrder.filter((k) => keys.includes(k));
    const remaining = keys.filter(
      (k) => !priorityOrder.includes(k) && k !== "Id"
    );
    return [...prioritized, ...remaining, "Action"];
  }, [categories]);

  const handleSearch = useCallback(() => {
    setPage(1);
    fetchCategories();
  }, [setPage, fetchCategories]);

  const handleReset = useCallback(() => {
    resetFilters();
    fetchCategories();
  }, [resetFilters, fetchCategories]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setAddImage(file);
    },
    [setAddImage]
  );

  const handleEditFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] || null;
      setEditImage(file);
    },
    [setEditImage]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0] || null;
      if (file && file.type.startsWith("image/")) {
        setAddImage(file);
      }
    },
    [setAddImage]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const columnRenderers = useMemo<
    Record<string, (value: unknown, row: Record<string, unknown>) => ReactNode>
  >(
    () => ({
      Status: (value) => {
        const isActive =
          typeof value === "string" && value.toLowerCase() === "active";
        return isActive ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-500/10 text-gray-400 border border-gray-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
            Inactive
          </span>
        );
      },
      Action: (_value, row) => {
        const id = Number(row.Id);
        const isActive =
          typeof row.Status === "string" && row.Status.toLowerCase() === "active";
        const isToggling = toggleStatusLoading && toggleStatusId === id;
        return (
          <div className="flex items-center gap-3">
            <button
              onClick={() => openEditModal(row)}
              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium rounded-lg transition-colors border border-white/10"
            >
              <BiEdit size={14} />
              Edit
            </button>
            <button
              onClick={() => toggleCategoryStatus(id)}
              disabled={isToggling}
              title={isActive ? "Deactivate" : "Activate"}
              className={`relative w-10 h-5 rounded-full transition-colors shrink-0 disabled:opacity-50 ${
                isActive ? "bg-emerald-500" : "bg-gray-600"
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                  isActive ? "translate-x-5" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        );
      },
    }),
    [toggleStatusLoading, toggleStatusId, toggleCategoryStatus, openEditModal]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Category Management</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage and view all product categories
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-(--color-1) hover:bg-(--color-2) text-white text-sm font-medium rounded-lg transition-colors"
        >
          <BiPlus size={16} />
          Add Category
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
              placeholder="Search by category name..."
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
        data={categories}
        loading={loading}
        paginate={paginate}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        emptyMessage="No categories found matching your filters"
        columnRenderers={columnRenderers}
      />

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAddModal(false)}
          />
          <div className="relative bg-[#0e1324] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-(--color-1)/10 flex items-center justify-center">
                  <BiCategory className="text-(--color-1)" size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Add Category</h2>
                  <p className="text-xs text-gray-500">Create a new product category</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              >
                <BiX size={20} />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {addError && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                  {addError}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Mobile Legends"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={addDisplayName}
                  onChange={(e) => setAddDisplayName(e.target.value)}
                  placeholder="e.g. Mobile Legends: Bang Bang"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Category Image
                </label>
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                  className="relative border-2 border-dashed border-white/10 hover:border-(--color-1)/50 rounded-xl p-6 text-center cursor-pointer transition-colors group"
                >
                  {addImagePreview ? (
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={addImagePreview}
                        alt="Preview"
                        className="h-20 w-20 object-contain rounded-lg bg-white/5 p-2"
                      />
                      <p className="text-xs text-gray-500">Click or drag to change</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-(--color-1)/10 transition-colors">
                        <BiImage className="text-gray-500 group-hover:text-(--color-1)" size={24} />
                      </div>
                      <p className="text-sm text-gray-400">
                        Drop an image here or click to browse
                      </p>
                      <p className="text-xs text-gray-600">SVG, PNG, JPG (recommended 64x64)</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {addImagePreview && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setAddImage(null);
                        if (fileInputRef.current) fileInputRef.current.value = "";
                      }}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      <BiX size={16} />
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
              <button
                onClick={() => setShowAddModal(false)}
                disabled={addLoading}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-lg transition-colors border border-white/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={createCategory}
                disabled={addLoading}
                className="flex items-center gap-2 px-5 py-2 bg-(--color-1) hover:bg-(--color-2) text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addLoading ? (
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
                    Create Category
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeEditModal}
          />
          <div className="relative bg-[#0e1324] border border-white/10 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-(--color-1)/10 flex items-center justify-center">
                  <BiEdit className="text-(--color-1)" size={18} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Edit Category</h2>
                  <p className="text-xs text-gray-500">Update this product category</p>
                </div>
              </div>
              <button
                onClick={closeEditModal}
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
                  Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="e.g. Mobile Legends"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Display Name
                </label>
                <input
                  type="text"
                  value={editDisplayName}
                  onChange={(e) => setEditDisplayName(e.target.value)}
                  placeholder="e.g. Mobile Legends: Bang Bang"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Category Image
                </label>
                <div
                  onClick={() => editFileInputRef.current?.click()}
                  className="relative border-2 border-dashed border-white/10 hover:border-(--color-1)/50 rounded-xl p-6 text-center cursor-pointer transition-colors group"
                >
                  {editImagePreview || editCurrentImage ? (
                    <div className="flex flex-col items-center gap-3">
                      <img
                        src={editImagePreview ?? `${IMAGE_BASE}${editCurrentImage}`}
                        alt="Preview"
                        className="h-20 w-20 object-contain rounded-lg bg-white/5 p-2"
                      />
                      <p className="text-xs text-gray-500">Click to change image</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-(--color-1)/10 transition-colors">
                        <BiImage className="text-gray-500 group-hover:text-(--color-1)" size={24} />
                      </div>
                      <p className="text-sm text-gray-400">
                        Drop an image here or click to browse
                      </p>
                      <p className="text-xs text-gray-600">SVG, PNG, JPG (recommended 64x64)</p>
                    </div>
                  )}
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleEditFileChange}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
              <button
                onClick={closeEditModal}
                disabled={editLoading}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-lg transition-colors border border-white/10 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={updateCategory}
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
    </div>
  );
}
