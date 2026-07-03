"use client";

import { useEffect, useCallback, useMemo, ReactNode } from "react";
import { useAdminProductsStore } from "@/store/adminProducts";
import DynamicTable from "@/components/dashboard/DynamicTable";
import { BiSearch, BiReset, BiCategory } from "react-icons/bi";
import { Badge } from "antd";

export default function AdminProductsPage() {
  const {
    products,
    categories,
    paginate,
    loading,
    loadingCategories,
    error,
    page,
    pageSize,
    search,
    categoryId,
    setPage,
    setPageSize,
    setSearch,
    setCategoryId,
    fetchProducts,
    fetchCategories,
    resetFilters,
  } = useAdminProductsStore();

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts, page, pageSize]);

  const enrichedData = useMemo(() => {
    return products.map((product) => {
      const rawJson = product.raw_json as Record<string, unknown> | null | undefined;
      const statusSeller = rawJson?.buyer_product_status === true ? "Active" : "Inactive";
      return {
        ...product,
        "Status Seller": statusSeller,
      };
    });
  }, [products]);

  const columns = useMemo(() => {
    if (products.length === 0) return [];
    
    const keys = Object.keys(enrichedData[0]);
    
    const filteredKeys = keys.filter((k) => k !== "raw_json");
    
    const priorityOrder = ["Code", "Name", "Category", "Price", "Status", "Status Seller"];
    const prioritized = priorityOrder.filter((k) => filteredKeys.includes(k));
    const remaining = filteredKeys.filter((k) => !priorityOrder.includes(k));
    return [...prioritized, ...remaining];
  }, [enrichedData]);

  const getBadgeColor = (status: string): "success" | "error" => {
    return status === "Active" ? "success" : "error";
  };

  const columnRenderers: Record<string, (value: unknown, row: Record<string, unknown>) => ReactNode> = useMemo(() => ({
    "Status": (value) => {
      const status = String(value ?? "Inactive");
      return <Badge status={getBadgeColor(status)} text={status} />;
    },
    "Status Seller": (value) => {
      const status = String(value ?? "Inactive");
      return <Badge status={getBadgeColor(status)} text={status} />;
    },
  }), []);

  const handleSearch = useCallback(() => {
    setPage(1);
    fetchProducts();
  }, [setPage, fetchProducts]);

  const handleReset = useCallback(() => {
    resetFilters();
    setTimeout(() => {
      fetchProducts();
    }, 0);
  }, [resetFilters, fetchProducts]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        handleSearch();
      }
    },
    [handleSearch]
  );

  return (
    <div className="space-y-6">
       
      <div>
        <h1 className="text-2xl font-bold text-white">Product Management</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage and view all products in the catalog
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl p-4 lg:p-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
           
          <div className="w-full sm:w-56">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">
              <BiCategory className="inline mr-1 -mt-0.5" size={14} />
              Product Category
            </label>
            <select
              value={categoryId ?? ""}
              onChange={(e) => {
                setCategoryId(e.target.value ? Number(e.target.value) : null);
              }}
              disabled={loadingCategories}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-(--color-1)/50 transition-colors cursor-pointer disabled:opacity-50"
            >
              <option value="" className="bg-[#0e1324] text-gray-300">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-[#0e1324] text-gray-300">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

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
              placeholder="Search by name or code..."
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
        data={enrichedData}
        loading={loading}
        paginate={paginate}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        emptyMessage="No products found matching your filters"
        columnRenderers={columnRenderers}
      />
    </div>
  );
}