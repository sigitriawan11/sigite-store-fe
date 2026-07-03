"use client";

import { useEffect, useState, useCallback } from "react";
import { useAdminSupportStore } from "@/store/adminSupport";
import { useAuthStore } from "@/store/auth";
import UserSupportView from "@/components/dashboard/UserSupportView";
import StatusBadge from "@/components/dashboard/StatusBadge";
import { BiSearch, BiSend, BiSupport } from "react-icons/bi";

const STATUS_OPTIONS = ["", "OPEN", "PENDING", "RESOLVED", "CLOSED"];
const STATUS_ACTIONS = ["OPEN", "PENDING", "RESOLVED", "CLOSED"];

export default function SupportPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role_name === "Super Admin";
  return isAdmin ? <AdminSupportView /> : <UserSupportView />;
}

function AdminSupportView() {
  const {
    tickets, loading, error,
    search, status, selected, detailLoading, replying, updating,
    setSearch, setStatus, fetchTickets, openTicket, sendReply, changeStatus,
  } = useAdminSupportStore();

  const [reply, setReply] = useState("");

  useEffect(() => {
    fetchTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleSend = useCallback(async () => {
    if (!selected || !reply.trim()) return;
    const ok = await sendReply(selected.id, reply.trim());
    if (ok) setReply("");
  }, [selected, reply, sendReply]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage and respond to customer support tickets
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl p-3 space-y-3">
            <div className="relative">
              <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && fetchTickets()}
                placeholder="Search tickets..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors"
              />
            </div>
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

          <div className="space-y-2 max-h-[65vh] overflow-y-auto hide-scrollbar">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
              ))
            ) : tickets.length === 0 ? (
              <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl p-8 text-center text-sm text-gray-500">
                No tickets found
              </div>
            ) : (
              tickets.map((t: any) => (
                <button
                  key={t.id}
                  onClick={() => openTicket(t.id)}
                  className={`w-full text-left bg-[#0e1324]/80 border rounded-xl p-4 transition-colors ${
                    selected?.id === t.id
                      ? "border-(--color-1)/60"
                      : "border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-mono text-gray-500">{t.ticket_no}</span>
                    <StatusBadge status={String(t.status)} />
                  </div>
                  <p className="text-sm text-white font-medium truncate">{t.subject}</p>
                  <p className="text-xs text-gray-500 mt-1 truncate">
                    {t.requester_name || t.requester_email || "Unknown"}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl min-h-[70vh] flex flex-col">
            {detailLoading ? (
              <div className="flex-1 flex items-center justify-center text-sm text-gray-500">
                Loading ticket...
              </div>
            ) : !selected ? (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-600 gap-3">
                <BiSupport size={40} />
                <p className="text-sm text-gray-500">Select a ticket to view details</p>
              </div>
            ) : (
              <>
                <div className="px-5 py-4 border-b border-white/10">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-gray-500">
                          {selected.ticket_no}
                        </span>
                        <StatusBadge status={String(selected.status)} />
                      </div>
                      <h3 className="text-base font-semibold text-white mt-1">
                        {selected.subject}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {String(selected.requester_name ?? "")} ·{" "}
                        {String(selected.requester_email ?? "")} · {String(selected.category)} ·{" "}
                        priority: {String(selected.priority)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {STATUS_ACTIONS.map((st) => (
                      <button
                        key={st}
                        disabled={updating || selected.status === st}
                        onClick={() => changeStatus(selected.id, st)}
                        className="px-2.5 py-1 text-xs font-medium rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex-1 p-5 space-y-4 overflow-y-auto hide-scrollbar max-h-[45vh]">
                  {(selected.messages ?? []).map((m) => {
                    const isAdmin = m.sender_role === "admin";
                    return (
                      <div
                        key={m.id}
                        className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                            isAdmin
                              ? "bg-(--color-1)/20 border border-(--color-1)/30"
                              : "bg-white/5 border border-white/10"
                          }`}
                        >
                          <p className="text-xs text-gray-400 mb-1">
                            {m.sender_name || (isAdmin ? "Admin" : "User")}
                          </p>
                          <p className="text-sm text-gray-200 whitespace-pre-wrap break-words">
                            {m.message}
                          </p>
                          <p className="text-[10px] text-gray-500 mt-1 text-right">
                            {new Date(m.created_at).toLocaleString("id-ID", {
                              day: "2-digit", month: "short",
                              hour: "2-digit", minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="p-4 border-t border-white/10">
                  <div className="flex items-end gap-2">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) handleSend();
                      }}
                      rows={2}
                      placeholder="Type your reply... (Ctrl+Enter to send)"
                      className="flex-1 resize-none bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors"
                    />
                    <button
                      onClick={handleSend}
                      disabled={replying || !reply.trim()}
                      className="flex items-center gap-2 px-4 py-2.5 bg-(--color-1) hover:bg-(--color-2) text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <BiSend size={16} />
                      Send
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
