"use client";

import { useEffect, useCallback, useMemo, ReactNode } from "react";
import { useAdminOrdersStore } from "@/store/adminOrders";
import { useUserTransactionsStore } from "@/store/userTransactions";
import { useAuthStore } from "@/store/auth";
import DynamicTable from "@/components/dashboard/DynamicTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Helper } from "@/utils/Helper";
import { BiSearch, BiReset } from "react-icons/bi";

const STATUS_OPTIONS = ["", "PENDING", "PAID", "FAILED", "EXPIRED"];
const COLUMNS = ["Ref ID", "Product", "Amount", "Payment", "Status", "Date"];

const renderers: Record<string, (v: unknown, row: Record<string, unknown>) => ReactNode> = {
  Amount: (v) => Helper.formatRupiah(Number(v) || 0),
  Status: (v) => <StatusBadge status={String(v)} />,
  Date: (v) =>
    v ? new Date(String(v)).toLocaleString("id-ID", {
      day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
    }) : "-",
};

function mapRows(rows: Record<string, unknown>[]) {
  return rows.map((o: any) => ({
    "Ref ID": o.ref_id,
    Product: o.product_code,
    Amount: Number(o.amount) || 0,
    Payment: o.payment_type,
    Status: o.status,
    Date: o.created_at,
  }));
}

export default function TransactionsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role_name === "Super Admin";
  return isAdmin ? <AdminTransactionsView /> : <UserTransactionsView />;
}

function TransactionsFilter({
  subtitle, search, status, loading, setSearch, setStatus, onSearch, onReset,
}: {
  subtitle: string;
  search: string; status: string; loading: boolean;
  setSearch: (v: string) => void; setStatus: (v: string) => void;
  onSearch: () => void; onReset: () => void;
}) {
  return (
    <>
      <div>
        <h1 className="text-2xl font-bold text-white">Transaction History</h1>
        <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
      </div>
      <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl p-4 lg:p-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="w-full sm:w-44">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-(--color-1)/50 transition-colors cursor-pointer">
              {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="bg-[#0e1324] text-gray-300">{s || "All Status"}</option>)}
            </select>
          </div>
          <div className="w-full sm:w-72">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Search</label>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && onSearch()} placeholder="Ref ID, product..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors" />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button onClick={onSearch} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-(--color-1) hover:bg-(--color-2) text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"><BiSearch size={16} /> Search</button>
            <button onClick={onReset} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 border border-white/10"><BiReset size={16} /> Reset</button>
          </div>
        </div>
      </div>
    </>
  );
}

function AdminTransactionsView() {
  const {
    orders, paginate, loading, error, page, pageSize, search, status,
    setPage, setPageSize, setSearch, setStatus, resetFilters, fetchOrders,
  } = useAdminOrdersStore();

  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, status]);

  const data = useMemo(() => mapRows(orders), [orders]);
  const onSearch = useCallback(() => { setPage(1); fetchOrders(); }, [setPage, fetchOrders]);
  const onReset = useCallback(() => { resetFilters(); setTimeout(() => fetchOrders(), 0); }, [resetFilters, fetchOrders]);

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">{error}</div>}
      <TransactionsFilter subtitle="All transactions in the system" search={search} status={status} loading={loading} setSearch={setSearch} setStatus={setStatus} onSearch={onSearch} onReset={onReset} />
      <DynamicTable columns={COLUMNS} data={data} loading={loading} paginate={paginate} onPageChange={setPage} onPageSizeChange={setPageSize} emptyMessage="No transactions found" columnRenderers={renderers} />
    </div>
  );
}

function UserTransactionsView() {
  const {
    transactions, paginate, loading, error, page, pageSize, search, status,
    setPage, setPageSize, setSearch, setStatus, resetFilters, fetchTransactions,
  } = useUserTransactionsStore();

  useEffect(() => {
    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, status]);

  const data = useMemo(() => mapRows(transactions), [transactions]);
  const onSearch = useCallback(() => { setPage(1); fetchTransactions(); }, [setPage, fetchTransactions]);
  const onReset = useCallback(() => { resetFilters(); setTimeout(() => fetchTransactions(), 0); }, [resetFilters, fetchTransactions]);

  return (
    <div className="space-y-6">
      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">{error}</div>}
      <TransactionsFilter subtitle="Your transaction history" search={search} status={status} loading={loading} setSearch={setSearch} setStatus={setStatus} onSearch={onSearch} onReset={onReset} />
      <DynamicTable columns={COLUMNS} data={data} loading={loading} paginate={paginate} onPageChange={setPage} onPageSizeChange={setPageSize} emptyMessage="No transactions found" columnRenderers={renderers} />
    </div>
  );
}
