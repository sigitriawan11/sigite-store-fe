"use client";

import { useEffect, useMemo, useRef, useState, ReactNode } from "react";
import { useUserDepositsStore } from "@/store/userDeposits";
import DynamicTable from "@/components/dashboard/DynamicTable";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { Helper } from "@/utils/Helper";
import { BiMoneyWithdraw, BiImage, BiX, BiCheck, BiXCircle, BiSend } from "react-icons/bi";

const COLUMNS = ["Amount", "Method", "Sender", "Status", "Note", "Date"];

export default function DepositPage() {
  const {
    deposits, paginate, loading, page, pageSize,
    submitting, formError, formSuccess, fieldErrors,
    setPage, setPageSize, fetchDeposits, createDeposit, clearMessages,
  } = useUserDepositsStore();

  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("BCA");
  const [senderName, setSenderName] = useState("");
  const [proof, setProof] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDeposits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  useEffect(() => () => clearMessages(), [clearMessages]);

  const onFile = (f: File | null) => {
    setProof(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const submit = async () => {
    const ok = await createDeposit({ amount, method, sender_name: senderName, proof });
    if (ok) {
      setAmount(""); setSenderName(""); setProof(null); setPreview(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const data = useMemo(
    () =>
      deposits.map((d: any) => ({
        Amount: Number(d.amount) || 0,
        Method: d.method,
        Sender: d.sender_name ?? "-",
        Status: d.status,
        Note: d.admin_note ?? "-",
        Date: d.created_at,
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
    }),
    []
  );

  const inputCls = (err?: boolean) =>
    `w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors ${err ? "border-red-500/50" : "border-white/10"}`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Deposit</h1>
        <p className="text-gray-500 text-sm mt-1">
          Top up your wallet balance by transferring and uploading the proof
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 bg-[#0e1324]/80 border border-white/10 rounded-xl p-5 space-y-4 h-fit">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <BiMoneyWithdraw className="text-(--color-1)" size={18} /> New Deposit
          </h2>

          {formError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400 flex items-center gap-2">
              <BiXCircle className="shrink-0" size={16} /> {formError}
            </div>
          )}
          {formSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-sm text-emerald-400 flex items-center gap-2">
              <BiCheck className="shrink-0" size={16} /> {formSuccess}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Amount (Rp) <span className="text-red-400">*</span></label>
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="50000" className={inputCls(!!fieldErrors?.amount)} />
            {fieldErrors?.amount && <p className="text-xs text-red-400 mt-1">{fieldErrors.amount}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Transfer Method</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)} className={inputCls()}>
              {["BCA", "BNI", "BRI", "Mandiri", "DANA", "OVO", "GoPay"].map((m) => (
                <option key={m} value={m} className="bg-[#0e1324]">{m}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Sender Name</label>
            <input type="text" value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="Name on the transfer" className={inputCls()} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Transfer Proof <span className="text-red-400">*</span></label>
            <div
              onClick={() => fileRef.current?.click()}
              className="relative border-2 border-dashed border-white/10 hover:border-(--color-1)/50 rounded-xl p-5 text-center cursor-pointer transition-colors group"
            >
              {preview ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={preview} alt="Proof" className="h-24 w-24 object-contain rounded-lg bg-white/5 p-1" />
                  <p className="text-xs text-gray-500">Click to change</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:bg-(--color-1)/10 transition-colors">
                    <BiImage className="text-gray-500 group-hover:text-(--color-1)" size={22} />
                  </div>
                  <p className="text-sm text-gray-400">Upload transfer proof</p>
                  <p className="text-xs text-gray-600">PNG, JPG, JPEG</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" onChange={(e) => onFile(e.target.files?.[0] || null)} className="hidden" />
              {preview && (
                <button
                  onClick={(e) => { e.stopPropagation(); onFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30"
                >
                  <BiX size={14} />
                </button>
              )}
            </div>
          </div>

          <button
            onClick={submit}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-(--color-1) hover:bg-(--color-2) text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BiSend size={16} /> {submitting ? "Submitting..." : "Submit Deposit"}
          </button>
        </div>

        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-white mb-3">Deposit History</h2>
          <DynamicTable
            columns={COLUMNS}
            data={data}
            loading={loading}
            paginate={paginate}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
            emptyMessage="No deposits yet"
            columnRenderers={renderers}
          />
        </div>
      </div>
    </div>
  );
}
