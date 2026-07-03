"use client";

import { useEffect, useCallback, useMemo, ReactNode } from "react";
import { usePaymentSimStore } from "@/store/paymentSim";
import DynamicTable from "@/components/dashboard/DynamicTable";
import { Helper } from "@/utils/Helper";
import { BiSearch, BiRefresh, BiCheckCircle, BiXCircle, BiCheck, BiTestTube } from "react-icons/bi";

const COLUMNS = ["Ref ID", "Product", "Channel", "Amount", "Email", "Payment", "Date", "Action"];

export default function PaymentSimPage() {
  const {
    pending, paginate, loading, error, success, forbidden, payingRefId,
    page, pageSize, search,
    setPage, setPageSize, setSearch, fetchPending, pay, clearMessages,
  } = usePaymentSimStore();

  useEffect(() => {
    fetchPending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  useEffect(() => {
    return () => clearMessages();
  }, [clearMessages]);

  const data = useMemo(
    () =>
      pending.map((o: any) => ({
        "Ref ID": o.ref_id,
        Product: o.product_code,
        Channel: o.channel_code,
        Amount: Number(o.amount) || 0,
        Email: o.email,
        Payment: o.payment_type,
        Date: o.created_at,
        Action: o.ref_id,
      })),
    [pending]
  );

  const renderers: Record<string, (v: unknown, row: Record<string, unknown>) => ReactNode> = useMemo(
    () => ({
      Amount: (v) => Helper.formatRupiah(Number(v) || 0),
      Date: (v) =>
        v
          ? new Date(String(v)).toLocaleString("id-ID", {
              day: "2-digit", month: "short", year: "numeric",
              hour: "2-digit", minute: "2-digit",
            })
          : "-",
      Action: (v) => {
        const refId = String(v);
        const isPaying = payingRefId === refId;
        return (
          <button
            onClick={() => pay(refId)}
            disabled={!!payingRefId}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-medium rounded-lg transition-colors border border-emerald-500/30 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <BiCheck size={14} /> {isPaying ? "Paying..." : "Pay"}
          </button>
        );
      },
    }),
    [pay, payingRefId]
  );

  const handleSearch = useCallback(() => {
    setPage(1);
    fetchPending();
  }, [setPage, fetchPending]);

  if (forbidden) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Payment Simulator</h1>
        </div>
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-6 text-sm text-amber-400">
          This tool is only available in the staging environment (NODE_ENV=STAGING).
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-white">Payment Simulator</h1>
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <BiTestTube size={13} /> STAGING
          </span>
        </div>
        <p className="text-gray-500 text-sm mt-1">
          Simulate a successful Xendit payment for pending transactions (test/dev only)
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400 flex items-center gap-2">
          <BiXCircle className="shrink-0" size={18} /> {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-sm text-emerald-400 flex items-center gap-2">
          <BiCheckCircle className="shrink-0" size={18} /> {success}
        </div>
      )}

      <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl p-4 lg:p-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="w-full sm:w-80">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Search pending</label>
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
              onClick={() => fetchPending()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 border border-white/10"
            >
              <BiRefresh size={16} /> Refresh
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
        emptyMessage="No pending transactions to simulate"
        columnRenderers={renderers}
      />
    </div>
  );
}
