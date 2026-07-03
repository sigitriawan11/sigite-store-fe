"use client";

import { useEffect, useMemo, useState, ReactNode } from "react";
import { useAdminDepositsStore } from "@/store/adminDeposits";
import DynamicTable from "@/components/dashboard/DynamicTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Helper } from "@/utils/Helper";
import { BiSearch, BiShow, BiX, BiCheck, BiXCircle, BiCheckCircle } from "react-icons/bi";

const IMAGE_BASE = process.env.NEXT_PUBLIC_API_URL?.replace("/v1", "") ?? "";
const STATUS_OPTIONS = ["", "PENDING", "APPROVED", "REJECTED"];
const COLUMNS = ["User", "Amount", "Method", "Sender", "Status", "Date", "Action"];

export default function DepositConfirmationPage() {
  const {
    deposits, paginate, loading, error, success,
    page, pageSize, search, status, selected, processing,
    setPage, setPageSize, setSearch, setStatus,
    fetchDeposits, openDetail, closeDetail, confirm, reject, clearMessages,
  } = useAdminDepositsStore();

  const [rejectNote, setRejectNote] = useState("");
  const [rejecting, setRejecting] = useState(false);

  useEffect(() => {
    fetchDeposits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, status]);

  useEffect(() => () => clearMessages(), [clearMessages]);

  const data = useMemo(
    () =>
      deposits.map((d: any) => ({
        User: d.user_email ?? d.user_name ?? "-",
        Amount: Number(d.amount) || 0,
        Method: d.method,
        Sender: d.sender_name ?? "-",
        Status: d.status,
        Date: d.created_at,
        Action: d,
      })),
    [deposits]
  );

  const renderers: Record<string, (v: unknown, row: Record<string, unknown>) => ReactNode> = useMemo(
    () => ({
      Amount: (v) => Helper.formatRupiah(Number(v) || 0),
      Status: (v) => <StatusBadge status={String(v)} />,
      Date: (v) => v ? new Date(String(v)).toLocaleString("id-ID", {
        day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
      }) : "-",
      Action: (_v, row) => (
        <button
          onClick={() => { openDetail((row as any).Action); setRejectNote(""); setRejecting(false); }}
          className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-medium rounded-lg transition-colors border border-white/10"
        >
          <BiShow size={14} /> Review
        </button>
      ),
    }),
    [openDetail]
  );

  const sel = selected as any;
  const isPending = sel?.status === "PENDING";

  const handleReject = async () => {
    if (!rejectNote.trim()) return;
    await reject(Number(sel.id), rejectNote.trim());
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Deposit Confirmation</h1>
        <p className="text-gray-500 text-sm mt-1">Review manual deposits and credit user balances</p>
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
          <div className="w-full sm:w-44">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-(--color-1)/50 transition-colors cursor-pointer">
              {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="bg-[#0e1324]">{s || "All Status"}</option>)}
            </select>
          </div>
          <div className="w-full sm:w-72">
            <label className="block text-xs font-medium text-gray-500 mb-1.5">Search</label>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (setPage(1), fetchDeposits())} placeholder="User email, name, sender..." className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors" />
          </div>
          <button onClick={() => { setPage(1); fetchDeposits(); }} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-(--color-1) hover:bg-(--color-2) text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
            <BiSearch size={16} /> Search
          </button>
        </div>
      </div>

      <DynamicTable
        columns={COLUMNS}
        data={data}
        loading={loading}
        paginate={paginate}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        emptyMessage="No deposits found"
        columnRenderers={renderers}
      />

      {sel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={closeDetail} />
          <div className="relative w-full max-w-lg bg-[#0e1324] border border-white/10 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto hide-scrollbar">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 sticky top-0 bg-[#0e1324]">
              <h3 className="text-base font-semibold text-white">Deposit Review</h3>
              <button onClick={closeDetail} className="text-gray-400 hover:text-white"><BiX size={22} /></button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-white">{Helper.formatRupiah(Number(sel.amount) || 0)}</span>
                <StatusBadge status={String(sel.status)} />
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-gray-500">User</p><p className="text-gray-300 break-words">{sel.user_email ?? "-"}</p></div>
                <div><p className="text-xs text-gray-500">Method</p><p className="text-gray-300">{sel.method}</p></div>
                <div><p className="text-xs text-gray-500">Sender</p><p className="text-gray-300">{sel.sender_name ?? "-"}</p></div>
                <div><p className="text-xs text-gray-500">Date</p><p className="text-gray-300">{sel.created_at ? new Date(sel.created_at).toLocaleString("id-ID") : "-"}</p></div>
              </div>

              <div>
                <p className="text-xs font-medium text-gray-500 mb-1.5">Transfer Proof</p>
                {sel.proof_url ? (
                  <a href={`${IMAGE_BASE}${sel.proof_url}`} target="_blank" rel="noreferrer">
                    <img src={`${IMAGE_BASE}${sel.proof_url}`} alt="Proof" className="max-h-64 rounded-lg border border-white/10 bg-white/5 object-contain" />
                  </a>
                ) : (
                  <p className="text-sm text-gray-500">No proof uploaded</p>
                )}
              </div>

              {sel.admin_note && (
                <div><p className="text-xs text-gray-500">Admin Note</p><p className="text-gray-300 text-sm">{sel.admin_note}</p></div>
              )}

              {isPending && (
                <div className="pt-3 border-t border-white/10 space-y-3">
                  {rejecting ? (
                    <div className="space-y-2">
                      <textarea value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} rows={2} placeholder="Rejection reason..." className="w-full resize-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-red-500/50" />
                      <div className="flex gap-2">
                        <button onClick={handleReject} disabled={processing || !rejectNote.trim()} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/15 hover:bg-red-500/25 text-red-400 text-sm font-medium rounded-lg border border-red-500/30 transition-colors disabled:opacity-50">
                          <BiXCircle size={16} /> Confirm Reject
                        </button>
                        <button onClick={() => setRejecting(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-lg border border-white/10">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => confirm(Number(sel.id))} disabled={processing} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-sm font-medium rounded-lg border border-emerald-500/30 transition-colors disabled:opacity-50">
                        <BiCheck size={16} /> {processing ? "Processing..." : "Approve & Credit"}
                      </button>
                      <button onClick={() => setRejecting(true)} disabled={processing} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-sm font-medium rounded-lg border border-red-500/20 transition-colors disabled:opacity-50">
                        <BiXCircle size={16} /> Reject
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
