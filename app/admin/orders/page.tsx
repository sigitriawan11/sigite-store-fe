"use client";

import { useEffect, useCallback, useMemo, ReactNode } from "react";
import { useAdminOrdersStore } from "@/store/adminOrders";
import DynamicTable from "@/components/dashboard/DynamicTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Helper } from "@/utils/Helper";
import { BiSearch, BiReset, BiShow, BiX } from "react-icons/bi";

const STATUS_OPTIONS = ["", "PENDING", "PAID", "FAILED", "EXPIRED"];
const COLUMNS = ["Ref ID", "Product", "Channel", "Amount", "Email", "Status", "Date", "Action"];

export default function AdminOrdersPage() {
  const {
    orders, paginate, loading, error,
    page, pageSize, search, status, dateFrom, dateTo,
    selected, detailLoading, updating,
    setPage, setPageSize, setSearch, setStatus, setDateFrom, setDateTo, resetFilters,
    fetchOrders, openDetail, closeDetail, updateStatus,
  } = useAdminOrdersStore();

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, status]);

  const data = useMemo(
    () =>
      orders.map((o: any) => ({
        "Ref ID": o.ref_id,
        Product: o.product_code,
        Channel: o.channel_code,
        Amount: Number(o.amount) || 0,
        Email: o.email,
        Status: o.status,
        Date: o.created_at,
        Action: o.ref_id,
      })),
    [orders]
  );

  const renderers: Record<string, (v: unknown, row: Record<string, unknown>) => ReactNode> = useMemo(
    () => ({
      Amount: (v) => Helper.formatRupiah(Number(v) || 0),
      Status: (v) => <StatusBadge status={String(v)} />,
      Date: (v) =>
        v
          ? new Date(String(v)).toLocaleString("id-ID", {
              day: "2-digit", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })
          : "-",
      Action: (v) => (
        <button
          onClick={() => openDetail(String(v))}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium rounded-lg transition-colors border border-white/10"
        >
          <BiShow size={14} /> Detail
        </button>
      ),
    }),
    [openDetail]
  );

  const handleSearch = useCallback(() => {
    setPage(1);
    fetchOrders();
  }, [setPage, fetchOrders]);

  const handleReset = useCallback(() => {
    resetFilters();
    setTimeout(() => fetchOrders(), 0);
  }, [resetFilters, fetchOrders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Order Management</h1>
        <p className="text-gray-500 text-sm mt-1">
          View, filter and manage all transaction orders
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl p-4 lg:p-5">
        <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-end flex-wrap">
          <div className="w-full sm:w-44">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-(--color-1)/50 transition-colors cursor-pointer"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s} className="bg-[#0e1324] text-gray-300">
                  {s || "All Status"}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full sm:w-40">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-(--color-1)/50 transition-colors"
            />
          </div>

          <div className="w-full sm:w-40">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-(--color-1)/50 transition-colors"
            />
          </div>

          <div className="w-full sm:w-64">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Search</label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Ref ID, email, phone, product..."
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
        emptyMessage="No orders found"
        columnRenderers={renderers}
      />

      {(selected || detailLoading) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={closeDetail}
          />
          <div className="relative w-full max-w-lg bg-[#0e1324] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 sticky top-0 bg-[#0e1324]">
              <h3 className="text-base font-semibold text-white">Order Detail</h3>
              <button
                onClick={closeDetail}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <BiX size={22} />
              </button>
            </div>

            {detailLoading ? (
              <div className="p-8 text-center text-sm text-gray-500">Loading...</div>
            ) : selected ? (
              <div className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-gray-300">
                    {String(selected.ref_id)}
                  </span>
                  <StatusBadge status={String(selected.status)} />
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <Field label="Product" value={String(selected.product_code)} />
                  <Field label="Channel" value={String(selected.channel_code)} />
                  <Field label="Amount" value={Helper.formatRupiah(Number(selected.amount) || 0)} />
                  <Field label="Payment Type" value={String(selected.payment_type ?? "-")} />
                  <Field label="Email" value={String(selected.email ?? "-")} />
                  <Field label="Phone" value={String(selected.phone ?? "-")} />
                  <Field
                    label="Created"
                    value={new Date(String(selected.created_at)).toLocaleString("id-ID")}
                  />
                  <Field
                    label="Paid At"
                    value={selected.paid_at ? new Date(String(selected.paid_at)).toLocaleString("id-ID") : "-"}
                  />
                </div>

                {!!selected.account_data && Object.keys(selected.account_data as object).length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-gray-500 mb-1">Account Data</p>
                    <pre className="text-xs text-gray-400 bg-white/5 rounded-lg p-3 overflow-x-auto">
                      {JSON.stringify(selected.account_data, null, 2)}
                    </pre>
                  </div>
                )}

                <div className="pt-3 border-t border-white/10">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    Update status manually
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {["PENDING", "PAID", "FAILED", "EXPIRED"].map((st) => (
                      <button
                        key={st}
                        disabled={updating || selected.status === st}
                        onClick={() => updateStatus(String(selected.ref_id), st)}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-gray-300 break-words">{value}</p>
    </div>
  );
}
