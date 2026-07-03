"use client";

import { useMemo, ReactNode } from "react";
import { motion } from "framer-motion";

interface Paginate {
  page: number;
  pageSize: number;
  total: number;
}

export type ColumnRenderer = (value: unknown, row: Record<string, unknown>) => ReactNode;

interface DynamicTableProps {
  columns: string[];
  data: Record<string, unknown>[];
  loading?: boolean;
  paginate?: Paginate;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  emptyMessage?: string;
  columnRenderers?: Record<string, ColumnRenderer>;
}

const DynamicTable = ({
  columns,
  data,
  loading = false,
  paginate,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50, 100],
  emptyMessage = "No data available",
  columnRenderers = {},
}: DynamicTableProps) => {
  const totalPages = paginate ? Math.ceil(paginate.total / paginate.pageSize) : 0;

  const getPageNumbers = useMemo(() => {
    if (!paginate || totalPages <= 1) return [];
    const current = paginate.page;
    const pages: (number | "...")[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push("...");
      const start = Math.max(2, current - 1);
      const end = Math.min(totalPages - 1, current + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (current < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  }, [paginate, totalPages]);

  const formatCellValue = (value: unknown): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "number") {
      
      if (value > 1000) return value.toLocaleString("id-ID");
      return String(value);
    }
    return String(value);
  };

  const isImageColumn = (col: string, value: unknown): boolean => {
    return col.toLowerCase() === "image" && typeof value === "string" && value.length > 0;
  };

  return (
    <div className="w-full">
       
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0e1324]/80 hide-scrollbar">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap"
                >
                  {col.replace(/_/g, " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              
              Array.from({ length: 5 }).map((_, rowIdx) => (
                <tr key={`skeleton-${rowIdx}`}>
                  <td className="px-4 py-3">
                    <div className="h-4 w-6 bg-white/10 rounded animate-pulse" />
                  </td>
                  {columns.map((_, colIdx) => (
                    <td key={`skeleton-${rowIdx}-${colIdx}`} className="px-4 py-3">
                      <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              
              <tr>
                <td
                  colSpan={columns.length + 1}
                  className="px-4 py-16 text-center"
                >
                  <div className="flex flex-col items-center justify-center gap-3">
                    <svg
                      className="w-12 h-12 text-gray-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                      />
                    </svg>
                    <p className="text-gray-500 text-sm">{emptyMessage}</p>
                  </div>
                </td>
              </tr>
            ) : (
              
              data.map((row, rowIndex) => {
                const startIndex = paginate
                  ? (paginate.page - 1) * paginate.pageSize + 1
                  : 1;
                return (
                  <motion.tr
                    key={rowIndex}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: rowIndex * 0.03 }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">
                      {startIndex + rowIndex}
                    </td>
                    {columns.map((col) => {
                      const value = row[col];
                      
                      if (columnRenderers[col]) {
                        return (
                          <td
                            key={col}
                            className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap"
                          >
                            {columnRenderers[col](value, row)}
                          </td>
                        );
                      }
                      
                      if (isImageColumn(col, value)) {
                        return (
                          <td
                            key={col}
                            className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap"
                          >
                            <img
                              src={`${process.env.NEXT_PUBLIC_API_URL?.replace('/v1', '')}${value}`}
                              alt={col}
                              className="h-10 w-10 object-contain rounded-md bg-white/10 p-1"
                              onError={(e) => {
                                
                              }}
                            />
                          </td>
                        );
                      }
                      return (
                        <td
                          key={col}
                          className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap"
                        >
                          {formatCellValue(value)}
                        </td>
                      );
                    })}
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {paginate && totalPages > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4">
           
          <div className="text-sm text-gray-500">
            Showing{" "}
            <span className="text-gray-300 font-medium">
              {Math.min(
                (paginate.page - 1) * paginate.pageSize + 1,
                paginate.total
              )}
            </span>{" "}
            to{" "}
            <span className="text-gray-300 font-medium">
              {Math.min(paginate.page * paginate.pageSize, paginate.total)}
            </span>{" "}
            of{" "}
            <span className="text-gray-300 font-medium">{paginate.total}</span>{" "}
            entries
          </div>

          <div className="flex items-center gap-3">
             
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Rows:</span>
              <select
                value={paginate.pageSize}
                onChange={(e) =>
                  onPageSizeChange?.(Number(e.target.value))
                }
                className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-gray-300 focus:outline-none focus:border-(--color-1)/50 transition-colors cursor-pointer"
              >
                {pageSizeOptions.map((size) => (
                  <option key={size} value={size} className="bg-[#0e1324] text-gray-300">
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => onPageChange?.(1)}
                disabled={paginate.page === 1}
                className="px-2 py-1.5 text-sm text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => onPageChange?.(paginate.page - 1)}
                disabled={paginate.page === 1}
                className="px-2 py-1.5 text-sm text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {getPageNumbers.map((page, idx) =>
                page === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-2 py-1 text-sm text-gray-600">
                    ...
                  </span>
                ) : (
                  <button
                    key={page}
                    onClick={() => onPageChange?.(page)}
                    className={`min-w-[32px] px-2 py-1.5 text-sm rounded-lg transition-colors ${
                      paginate.page === page
                        ? "bg-(--color-1) text-white font-medium"
                        : "text-gray-500 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}

              <button
                onClick={() => onPageChange?.(paginate.page + 1)}
                disabled={paginate.page >= totalPages}
                className="px-2 py-1.5 text-sm text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={() => onPageChange?.(totalPages)}
                disabled={paginate.page >= totalPages}
                className="px-2 py-1.5 text-sm text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DynamicTable;