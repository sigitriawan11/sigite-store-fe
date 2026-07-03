"use client";

import { useEffect, useMemo, ReactNode } from "react";
import { useUserWalletStore } from "@/store/userWallet";
import DynamicTable from "@/components/dashboard/DynamicTable";
import { Helper } from "@/utils/Helper";
import { BiWallet, BiRefresh } from "react-icons/bi";

const COLUMNS = ["Type", "Amount", "Balance Before", "Balance After", "Description", "Date"];

export default function WalletPage() {
  const {
    balance, logs, paginate, loading, error, page, pageSize,
    setPage, setPageSize, fetchWallet,
  } = useUserWalletStore();

  useEffect(() => {
    fetchWallet();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const data = useMemo(
    () =>
      logs.map((l: any) => ({
        Type: l.type,
        Amount: Number(l.amount) || 0,
        "Balance Before": Number(l.balance_before) || 0,
        "Balance After": Number(l.balance_after) || 0,
        Description: l.description ?? "-",
        Date: l.created_at,
      })),
    [logs]
  );

  const renderers: Record<string, (v: unknown, row: Record<string, unknown>) => ReactNode> = useMemo(
    () => ({
      Amount: (v) => {
        const n = Number(v) || 0;
        const credit = n >= 0;
        return (
          <span className={credit ? "text-emerald-400" : "text-red-400"}>
            {credit ? "+" : ""}{Helper.formatRupiah(n)}
          </span>
        );
      },
      "Balance Before": (v) => Helper.formatRupiah(Number(v) || 0),
      "Balance After": (v) => Helper.formatRupiah(Number(v) || 0),
      Date: (v) =>
        v ? new Date(String(v)).toLocaleString("id-ID", {
          day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
        }) : "-",
    }),
    []
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Wallet</h1>
          <p className="text-gray-500 text-sm mt-1">Your balance and transaction history</p>
        </div>
        <button
          onClick={() => fetchWallet()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 border border-white/10"
        >
          <BiRefresh size={16} /> Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="bg-gradient-to-br from-(--color-2) to-(--color-1) rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute -right-8 -top-8 opacity-20">
          <BiWallet size={140} />
        </div>
        <p className="text-white/80 text-sm font-medium">Current Balance</p>
        <p className="text-4xl font-bold text-white mt-2">
          {loading ? "..." : Helper.formatRupiah(balance)}
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-white mb-3">Balance History</h2>
        <DynamicTable
          columns={COLUMNS}
          data={data}
          loading={loading}
          paginate={paginate}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          emptyMessage="No balance history yet"
          columnRenderers={renderers}
        />
      </div>
    </div>
  );
}
