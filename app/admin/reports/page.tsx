"use client";

import { useEffect, useMemo } from "react";
import { useAdminReportsStore } from "@/store/adminReports";
import StatCard from "@/components/dashboard/StatCard";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Helper } from "@/utils/Helper";
import { BiFilterAlt, BiDownload, BiReceipt, BiDollarCircle, BiCheckCircle, BiPurchaseTag } from "react-icons/bi";

export default function ReportsPage() {
  const {
    data, loading, error, dateFrom, dateTo,
    setDateFrom, setDateTo, fetchReport,
  } = useAdminReportsStore();

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const maxDaily = useMemo(() => {
    if (!data?.daily_series?.length) return 0;
    return Math.max(...data.daily_series.map((d) => d.revenue), 0);
  }, [data]);

  const exportCsv = () => {
    if (!data) return;
    const rows: string[][] = [["Date", "Orders", "Revenue"]];
    data.daily_series.forEach((d) =>
      rows.push([d.date, String(d.orders), String(d.revenue)])
    );
    rows.push([]);
    rows.push(["Status", "Count", "Revenue"]);
    data.status_breakdown.forEach((s) =>
      rows.push([s.status, String(s.count), String(s.revenue)])
    );
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `report-${dateFrom}_${dateTo}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const summary = data?.summary;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Transaction Reports</h1>
          <p className="text-gray-500 text-sm mt-1">
            Analyze sales performance over a date range
          </p>
        </div>
        <button
          onClick={exportCsv}
          disabled={!data || loading}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 border border-white/10"
        >
          <BiDownload size={16} /> Export CSV
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl p-4 lg:p-5">
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <div className="w-full sm:w-44">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-(--color-1)/50 transition-colors"
            />
          </div>
          <div className="w-full sm:w-44">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-(--color-1)/50 transition-colors"
            />
          </div>
          <button
            onClick={() => fetchReport()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-(--color-1) hover:bg-(--color-2) text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <BiFilterAlt size={16} /> Apply
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Orders" value={(summary?.total_orders ?? 0).toLocaleString("id-ID")} icon={<BiReceipt />} accent="text-sky-400" loading={loading} />
        <StatCard label="Paid Orders" value={(summary?.paid_orders ?? 0).toLocaleString("id-ID")} icon={<BiCheckCircle />} accent="text-emerald-400" loading={loading} />
        <StatCard label="Total Revenue" value={Helper.formatRupiah(summary?.total_revenue ?? 0)} icon={<BiDollarCircle />} accent="text-(--color-1)" loading={loading} />
        <StatCard label="Success Rate" value={`${summary?.success_rate ?? 0}%`} icon={<BiPurchaseTag />} accent="text-violet-400" loading={loading} />
      </div>

      <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl p-5">
        <h2 className="text-sm font-semibold text-white mb-4">Daily Revenue</h2>
        {loading ? (
          <div className="h-40 rounded bg-white/5 animate-pulse" />
        ) : (data?.daily_series ?? []).length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">No data for this range</p>
        ) : (
          <div className="flex items-end gap-[3px] h-40 overflow-x-auto hide-scrollbar">
            {data!.daily_series.map((d) => {
              const h = maxDaily > 0 ? (d.revenue / maxDaily) * 100 : 0;
              return (
                <div
                  key={d.date}
                  className="flex-1 min-w-[8px] group relative flex items-end h-full"
                  title={`${d.date}: ${Helper.formatRupiah(d.revenue)} (${d.orders} orders)`}
                >
                  <div
                    className="w-full rounded-t bg-gradient-to-t from-(--color-2) to-(--color-1) min-h-[2px]"
                    style={{ height: `${Math.max(h, 1)}%` }}
                  />
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white">Status Breakdown</h2>
          </div>
          <div className="p-5 space-y-3">
            {(data?.status_breakdown ?? []).length === 0 ? (
              <p className="text-sm text-gray-500">No data</p>
            ) : (
              data!.status_breakdown.map((s) => (
                <div key={s.status} className="flex items-center justify-between">
                  <StatusBadge status={s.status} />
                  <div className="text-right">
                    <span className="text-sm text-white font-medium">{s.count}</span>
                    <span className="text-xs text-gray-500 ml-2">
                      {Helper.formatRupiah(s.revenue)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10">
            <h2 className="text-sm font-semibold text-white">Top Products</h2>
          </div>
          <div className="p-5 space-y-2">
            {(data?.top_products ?? []).length === 0 ? (
              <p className="text-sm text-gray-500">No data</p>
            ) : (
              data!.top_products.map((p, i) => (
                <div
                  key={p.product_code}
                  className="flex items-center justify-between text-sm py-1"
                >
                  <span className="text-gray-300">
                    <span className="text-gray-600 mr-2">{i + 1}.</span>
                    {p.product_code}
                  </span>
                  <div className="text-right">
                    <span className="text-gray-400">{p.count}x</span>
                    <span className="text-gray-500 ml-3">
                      {Helper.formatRupiah(p.revenue)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
