"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";
import { useAccountStore } from "@/store/account";
import { Helper } from "@/utils/Helper";
import { BiUser, BiLockAlt, BiSave, BiCheck, BiXCircle, BiEnvelope, BiIdCard } from "react-icons/bi";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1">
      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
      </svg>
      {message}
    </p>
  );
}

const inputClass = (hasError?: boolean) =>
  `w-full bg-white/5 border rounded-lg px-3 py-2.5 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors ${
    hasError ? "border-red-500/50" : "border-white/10"
  }`;

export default function ProfilePage() {
  const { user, fetchSession } = useAuthStore();
  const {
    savingProfile, profileError, profileSuccess, profileFieldErrors,
    savingPassword, passwordError, passwordSuccess, passwordFieldErrors,
    updateProfile, changePassword, clearMessages,
  } = useAccountStore();

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const [syncedUserId, setSyncedUserId] = useState<string | undefined>(undefined);
  const currentUserId = user?.user_id ?? user?.id;
  if (user && currentUserId !== syncedUserId) {
    setSyncedUserId(currentUserId);
    setDisplayName(String(user.display_name ?? ""));
    setPhone(String(user.phone_number ?? ""));
  }

  useEffect(() => {
    return () => clearMessages();
  }, [clearMessages]);

  const handleSaveProfile = async () => {
    const ok = await updateProfile({ display_name: displayName, phone_number: phone });
    if (ok) await fetchSession();
  };

  const handleChangePassword = async () => {
    const ok = await changePassword({
      current_password: currentPassword,
      new_password: newPassword,
    });
    if (ok) {
      setCurrentPassword("");
      setNewPassword("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Profile &amp; Security</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage your profile information and account security
        </p>
      </div>

      <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-(--color-1)/20 border border-(--color-1)/30 flex items-center justify-center text-2xl text-(--color-1) font-bold shrink-0">
            {String(user?.display_name ?? user?.email ?? "?").charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-semibold text-white truncate">
              {String(user?.display_name ?? "-")}
            </p>
            <p className="text-sm text-gray-500 flex items-center gap-1.5">
              <BiEnvelope size={14} /> {String(user?.email ?? "-")}
            </p>
            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
              <span className="inline-flex items-center gap-1">
                <BiIdCard size={14} /> {String(user?.role_name ?? "-")}
              </span>
              {typeof user?.wallet_balance === "number" && (
                <span>Wallet: {Helper.formatRupiah(user.wallet_balance)}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <BiUser className="text-(--color-1)" size={18} /> Profile Information
          </h2>

          {profileError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400 flex items-center gap-2">
              <BiXCircle className="shrink-0" size={16} /> {profileError}
            </div>
          )}
          {profileSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-sm text-emerald-400 flex items-center gap-2">
              <BiCheck className="shrink-0" size={16} /> {profileSuccess}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">Email</label>
            <input
              type="email"
              value={String(user?.email ?? "")}
              disabled
              className="w-full bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2.5 text-sm text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
              className={inputClass(!!profileFieldErrors?.display_name)}
            />
            <FieldError message={profileFieldErrors?.display_name} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Phone Number
            </label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="08xxxxxxxxxx"
              className={inputClass(!!profileFieldErrors?.phone_number)}
            />
            <FieldError message={profileFieldErrors?.phone_number} />
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={savingProfile}
            className="flex items-center gap-2 px-5 py-2 bg-(--color-1) hover:bg-(--color-2) text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            <BiSave size={16} /> {savingProfile ? "Saving..." : "Save Profile"}
          </button>
        </div>

        <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <BiLockAlt className="text-(--color-1)" size={18} /> Change Password
          </h2>

          {passwordError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400 flex items-center gap-2">
              <BiXCircle className="shrink-0" size={16} /> {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 text-sm text-emerald-400 flex items-center gap-2">
              <BiCheck className="shrink-0" size={16} /> {passwordSuccess}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass(!!passwordFieldErrors?.current_password)}
            />
            <FieldError message={passwordFieldErrors?.current_password} />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1.5">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass(!!passwordFieldErrors?.new_password)}
            />
            <FieldError message={passwordFieldErrors?.new_password} />
            <p className="text-xs text-gray-600 mt-1.5">
              Min 8 chars with uppercase, lowercase, and a number.
            </p>
          </div>

          <button
            onClick={handleChangePassword}
            disabled={savingPassword || !currentPassword || !newPassword}
            className="flex items-center gap-2 px-5 py-2 bg-(--color-1) hover:bg-(--color-2) text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <BiLockAlt size={16} /> {savingPassword ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
