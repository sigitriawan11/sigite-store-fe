"use client";

import { useEffect, useMemo } from "react";
import { useAdminDashboardStore } from "@/store/adminDashboard";
import { useUserDashboardStore } from "@/store/userDashboard";
import { useAuthStore } from "@/store/auth";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Helper } from "@/utils/Helper";
import {
  BiGroup,
  BiReceipt,
  BiDollarCircle,
  BiTrendingUp,
  BiRefresh,
  BiWallet,
  BiCartAlt,
  BiTimeFive,
} from "react-icons/bi";

const STATUS_ORDER = ["PAID", "PENDING", "FAILED", "EXPIRED"];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role_name === "Super Admin";
  return isAdmin ? <AdminDashboardView /> : <UserDashboardView />;
}

function AdminDashboardView() {
  const { data, loading, error, fetchDashboard } = useAdminDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const maxRevenue = useMemo(() => {
    if (!data?.revenue_series?.length) return 0;
    return Math.max(...data.revenue_series.map((d) => d.revenue), 0);
  }, [data]);

  const totals = data?.totals;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">
            Overview of your business metrics and analytics
          </p>
        </div>
        <button
          onClick={() => fetchDashboard()}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 border border-white/10"
        >
          <BiRefresh size={16} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={Helper.formatRupiah(totals?.total_revenue ?? 0)}
          icon={<BiDollarCircle />}
          accent="text-emerald-400"
          hint="From paid transactions"
          loading={loading}
        />
        <StatCard
          label="Revenue Today"
          value={Helper.formatRupiah(totals?.revenue_today ?? 0)}
          icon={<BiTrendingUp />}
          accent="text-(--color-1)"
          hint={`${totals?.orders_today ?? 0} orders today`}
          loading={loading}
        />
        <StatCard
          label="Total Transactions"
          value={(totals?.total_transactions ?? 0).toLocaleString("id-ID")}
          icon={<BiReceipt />}
          accent="text-sky-400"
          loading={loading}
        />
        <StatCard
          label="Total Users"
          value={(totals?.total_users ?? 0).toLocaleString("id-ID")}
          icon={<BiGroup />}
          accent="text-violet-400"
          loading={loading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[#0e1324]/80 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">
            Revenue — Last 7 Days
          </h2>
          {loading ? (
            <div className="h-48 rounded bg-white/5 animate-pulse" />
          ) : (
            <div className="flex items-end justify-between gap-2 h-48">
              {(data?.revenue_series ?? []).map((d) => {
                const heightPct =
                  maxRevenue > 0 ? (d.revenue / maxRevenue) * 100 : 0;
                return (
                  <div
                    key={d.date}
                    className="flex-1 flex flex-col items-center justify-end h-full group"
                  >
                    <div className="text-[10px] text-gray-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {Helper.formatRupiah(d.revenue)}
                    </div>
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-(--color-2) to-(--color-1) min-h-[2px] transition-all"
                      style={{ height: `${Math.max(heightPct, 1)}%` }}
                    />
                    <span className="text-[10px] text-gray-500 mt-2">
                      {new Date(d.date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                      })}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl p-5">
          <h2 className="text-sm font-semibold text-white mb-4">
            Transactions by Status
          </h2>
          <div className="space-y-3">
            {STATUS_ORDER.map((st) => {
              const count = data?.status_counts?.[st] ?? 0;
              const total = data?.totals?.total_transactions ?? 0;
              const pct = total > 0 ? (count / total) * 100 : 0;
              return (
                <div key={st}>
                  <div className="flex items-center justify-between mb-1">
                    <StatusBadge status={st} />
                    <span className="text-sm font-medium text-white">
                      {count}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full bg-(--color-1) rounded-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">
            Recent Transactions
          </h2>
        </div>
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {["Ref ID", "Product", "Email", "Amount", "Status", "Date"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    Loading...
                  </td>
                </tr>
              ) : (data?.recent_transactions ?? []).length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                    No transactions yet
                  </td>
                </tr>
              ) : (
                (data?.recent_transactions ?? []).map((t: any) => (
                  <tr key={t.ref_id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-300 font-mono whitespace-nowrap">
                      {t.ref_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                      {t.product_code}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                      {t.email}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">
                      {Helper.formatRupiah(Number(t.amount) || 0)}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <StatusBadge status={String(t.status)} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">
                      {new Date(t.created_at).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function UserDashboardView() {
  const { data, loading, error, fetchDashboard } = useUserDashboardStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Your account summary</p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Wallet Balance" value={Helper.formatRupiah(data?.balance ?? 0)} icon={<BiWallet />} accent="text-emerald-400" loading={loading} />
        <StatCard label="Total Spent" value={Helper.formatRupiah(data?.total_spent ?? 0)} icon={<BiDollarCircle />} accent="text-(--color-1)" hint="Paid transactions" loading={loading} />
        <StatCard label="My Transactions" value={(data?.total_transactions ?? 0).toLocaleString("id-ID")} icon={<BiCartAlt />} accent="text-sky-400" hint={`${data?.paid_transactions ?? 0} paid`} loading={loading} />
        <StatCard label="Pending Deposits" value={(data?.pending_deposits ?? 0).toLocaleString("id-ID")} icon={<BiTimeFive />} accent="text-amber-400" loading={loading} />
      </div>

      <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/10">
          <h2 className="text-sm font-semibold text-white">Recent Transactions</h2>
        </div>
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                {["Ref ID", "Product", "Amount", "Status", "Date"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-400 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">Loading...</td></tr>
              ) : (data?.recent_transactions ?? []).length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No transactions yet</td></tr>
              ) : (
                (data?.recent_transactions ?? []).map((t: any) => (
                  <tr key={t.ref_id} className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-300 font-mono whitespace-nowrap">{t.ref_id}</td>
                    <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">{t.product_code}</td>
                    <td className="px-4 py-3 text-sm text-gray-300 whitespace-nowrap">{Helper.formatRupiah(Number(t.amount) || 0)}</td>
                    <td className="px-4 py-3 whitespace-nowrap"><StatusBadge status={String(t.status)} /></td>
                    <td className="px-4 py-3 text-sm text-gray-400 whitespace-nowrap">{new Date(t.created_at).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
