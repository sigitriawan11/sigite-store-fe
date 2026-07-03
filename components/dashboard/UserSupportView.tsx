"use client";

import { useEffect, useState, useCallback } from "react";
import { useUserSupportStore } from "@/store/userSupport";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { BiSearch, BiSend, BiSupport, BiPlus, BiX } from "react-icons/bi";

const STATUS_OPTIONS = ["", "OPEN", "PENDING", "RESOLVED", "CLOSED"];
const CATEGORIES = ["general", "transaction", "payment", "account"];

export default function UserSupportView() {
  const {
    tickets, loading, error, status, selected, detailLoading, replying,
    showCreate, creating, createError,
    setStatus, setShowCreate, fetchTickets, openTicket, createTicket, sendReply,
  } = useUserSupportStore();

  const [reply, setReply] = useState("");
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("general");
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleSend = useCallback(async () => {
    if (!selected || !reply.trim()) return;
    const ok = await sendReply(selected.id, reply.trim());
    if (ok) setReply("");
  }, [selected, reply, sendReply]);

  const handleCreate = async () => {
    const ok = await createTicket({ subject, category, message });
    if (ok) { setSubject(""); setCategory("general"); setMessage(""); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
          <p className="text-gray-500 text-sm mt-1">Get help and track your requests</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 bg-(--color-1) hover:bg-(--color-2) text-white text-sm font-medium rounded-lg transition-colors">
          <BiPlus size={16} /> New Ticket
        </button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl p-3">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-(--color-1)/50 transition-colors cursor-pointer">
              {STATUS_OPTIONS.map((s) => <option key={s} value={s} className="bg-[#0e1324]">{s || "All Status"}</option>)}
            </select>
          </div>
          <div className="space-y-2 max-h-[65vh] overflow-y-auto hide-scrollbar">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />)
            ) : tickets.length === 0 ? (
              <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl p-8 text-center text-sm text-gray-500">No tickets yet</div>
            ) : (
              tickets.map((t: any) => (
                <button key={t.id} onClick={() => openTicket(t.id)} className={`w-full text-left bg-[#0e1324]/80 border rounded-xl p-4 transition-colors ${selected?.id === t.id ? "border-(--color-1)/60" : "border-white/10 hover:border-white/20"}`}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-gray-500">{t.ticket_no}</span>
                    <StatusBadge status={String(t.status)} />
                  </div>
                  <p className="text-sm text-white font-medium truncate">{t.subject}</p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl min-h-[70vh] flex flex-col">
            {detailLoading ? (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-500">Loading ticket...</div>
            ) : !selected ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-3">
                <BiSupport size={40} />
                <p className="text-sm text-gray-500">Select a ticket to view the conversation</p>
              </div>
            ) : (
              <>
                <div className="px-5 py-4 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-gray-500">{selected.ticket_no}</span>
                    <StatusBadge status={String(selected.status)} />
                  </div>
                  <h3 className="text-base font-semibold text-white mt-1">{selected.subject}</h3>
                </div>

                <div className="flex-1 p-5 space-y-4 overflow-y-auto hide-scrollbar max-h-[50vh]">
                  {(selected.messages ?? []).map((m) => {
                    const isUser = m.sender_role === "user";
                    return (
                      <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${isUser ? "bg-(--color-1)/20 border border-(--color-1)/30" : "bg-white/5 border border-white/10"}`}>
                          <p className="text-xs text-gray-400 mb-1">{m.sender_name || (isUser ? "You" : "Admin")}</p>
                          <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">{m.message}</p>
                          <p className="text-[10px] text-gray-500 mt-1 text-right">{new Date(m.created_at).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selected.status !== "CLOSED" && (
                  <div className="p-4 border-t border-white/10">
                    <div className="flex items-end gap-2">
                      <textarea value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSend(); }} rows={2} placeholder="Type your reply... (Ctrl+Enter to send)" className="flex-1 resize-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors" />
                      <button onClick={handleSend} disabled={replying || !reply.trim()} className="flex items-center gap-2 px-4 py-2.5 bg-(--color-1) hover:bg-(--color-2) text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                        <BiSend size={16} /> Send
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowCreate(false)} />
          <div className="relative w-full max-w-lg bg-[#0e1324] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
              <h3 className="text-base font-semibold text-white">New Support Ticket</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-white"><BiX size={22} /></button>
            </div>
            <div className="p-5 space-y-4">
              {createError && <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">{createError}</div>}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Subject <span className="text-red-400">*</span></label>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief summary of your issue" className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 focus:outline-none focus:border-(--color-1)/50 transition-colors">
                  {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0e1324] capitalize">{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">Message <span className="text-red-400">*</span></label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Describe your issue..." className="w-full resize-none bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 p-5 border-t border-white/10">
              <button onClick={() => setShowCreate(false)} disabled={creating} className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-lg border border-white/10 disabled:opacity-50">Cancel</button>
              <button onClick={handleCreate} disabled={creating || !subject.trim() || !message.trim()} className="flex items-center gap-2 px-5 py-2 bg-(--color-1) hover:bg-(--color-2) text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                <BiPlus size={16} /> {creating ? "Creating..." : "Create Ticket"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
