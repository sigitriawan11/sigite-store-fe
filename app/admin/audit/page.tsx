"use client";

import { useEffect, useCallback, useMemo, ReactNode } from "react";
import { useAdminAuditStore } from "@/store/adminAudit";
import DynamicTable from "@/components/dashboard/DynamicTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { BiSearch, BiReset } from "react-icons/bi";

const ACTION_OPTIONS = ["", "CREATE", "UPDATE", "DELETE"];
const COLUMNS = ["Action", "Resource", "Resource ID", "Actor", "Method", "Path", "IP", "Time"];

export default function AuditPage() {
  const {
    logs, paginate, loading, error,
    page, pageSize, search, action, resource,
    setPage, setPageSize, setSearch, setAction, setResource, resetFilters, fetchLogs,
  } = useAdminAuditStore();

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, action]);

  const data = useMemo(
    () =>
      logs.map((l: any) => ({
        Action: l.action,
        Resource: l.resource ?? "-",
        "Resource ID": l.resource_id ?? "-",
        Actor: l.actor_email ?? "-",
        Method: l.method ?? "-",
        Path: l.path ?? "-",
        IP: l.ip_address ?? "-",
        Time: l.created_at,
      })),
    [logs]
  );

  const renderers: Record<string, (v: unknown, row: Record<string, unknown>) => ReactNode> = useMemo(
    () => ({
      Action: (v) => <StatusBadge status={String(v)} />,
      Time: (v) =>
        v
          ? new Date(String(v)).toLocaleString("id-ID", {
              day: "2-digit", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit", second: "2-digit",
            })
          : "-",
    }),
    []
  );

  const handleSearch = useCallback(() => {
    setPage(1);
    fetchLogs();
  }, [setPage, fetchLogs]);

  const handleReset = useCallback(() => {
    resetFilters();
    setTimeout(() => fetchLogs(), 0);
  }, [resetFilters, fetchLogs]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Activity Log / Audit</h1>
        <p className="text-gray-500 text-sm mt-1">
          Track all administrative actions performed in the system
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl p-4 lg:p-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end flex-wrap">
          <div className="w-full sm:w-40">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Action</label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-(--color-1)/50 transition-colors cursor-pointer"
            >
              {ACTION_OPTIONS.map((a) => (
                <option key={a} value={a} className="bg-[#0e1324] text-gray-300">
                  {a || "All Actions"}
                </option>
              ))}
            </select>
          </div>
          <div className="w-full sm:w-44">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Resource</label>
            <input
              type="text"
              value={resource}
              onChange={(e) => setResource(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="e.g. users, orders"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors"
            />
          </div>
          <div className="w-full sm:w-64">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Actor email, path, resource id..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors"
            />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-(--color-1) hover:bg-(--color-2) text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <BiSearch size={16} /> Search
            </button>
            <button
              onClick={handleReset}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 border border-white/10"
            >
              <BiReset size={16} /> Reset
            </button>
          </div>
        </div>
      </div>

      <DynamicTable
        columns={COLUMNS}
        data={data}
        loading={loading}
        paginate={paginate}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        emptyMessage="No audit logs found"
        columnRenderers={renderers}
      />
    </div>
  );
}
