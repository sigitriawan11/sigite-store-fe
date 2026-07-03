"use client";

import { useEffect, useCallback } from "react";
import { useAdminSettingsStore } from "@/store/adminSettings";
import {
  BiCog,
  BiSave,
  BiReset,
  BiServer,
  BiRefresh,
  BiCheck,
  BiXCircle,
} from "react-icons/bi";

export default function AdminSettingsPage() {
  const {
    settings,
    loading,
    saving,
    error,
    successMessage,
    dirtyFields,
    activeTab,
    fetchSettings,
    setDirtyField,
    resetDirtyFields,
    saveSettings,
    setActiveTab,
    clearMessages,
  } = useAdminSettingsStore();

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const hasChanges = Object.keys(dirtyFields).length > 0;

  const currentSettings =
    activeTab === "general" ? settings.general : settings.system;

  const handleValueChange = useCallback(
    (key: string, value: unknown) => {
      setDirtyField(key, value);
    },
    [setDirtyField]
  );

  const handleSave = useCallback(() => {
    saveSettings();
  }, [saveSettings]);

  const handleRefresh = useCallback(() => {
    resetDirtyFields();
    fetchSettings();
  }, [resetDirtyFields, fetchSettings]);

  const renderSettingInput = (
    key: string,
    setting: { value: unknown; description: string | null }
  ) => {
    const currentValue =
      key in dirtyFields ? dirtyFields[key] : setting.value;
    const valueType = typeof currentValue;

    if (valueType === "boolean") {
      return (
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium text-white capitalize">
              {key.replace(/_/g, " ")}
            </p>
            {setting.description && (
              <p className="text-xs text-gray-500 mt-0.5">
                {setting.description}
              </p>
            )}
          </div>
          <button
            onClick={() => handleValueChange(key, !currentValue)}
            className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
              currentValue ? "bg-emerald-500" : "bg-gray-600"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                currentValue ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      );
    }

    if (valueType === "number") {
      return (
        <div>
          <label className="block text-xs font-medium text-gray-400 mb-1.5 capitalize">
            {key.replace(/_/g, " ")}
          </label>
          {setting.description && (
            <p className="text-xs text-gray-500 mb-2">{setting.description}</p>
          )}
          <input
            type="number"
            value={currentValue as number}
            onChange={(e) =>
              handleValueChange(key, Number(e.target.value))
            }
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors"
          />
        </div>
      );
    }

    return (
      <div>
        <label className="block text-xs font-medium text-gray-400 mb-1.5 capitalize">
          {key.replace(/_/g, " ")}
        </label>
        {setting.description && (
          <p className="text-xs text-gray-500 mb-2">{setting.description}</p>
        )}
        <input
          type="text"
          value={String(currentValue ?? "")}
          onChange={(e) => handleValueChange(key, e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-300 placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors"
        />
      </div>
    );
  };

  const tabClass = (tab: "general" | "system") =>
    `flex items-center gap-2 px-5 py-2.5 text-sm font-medium rounded-lg transition-colors ${
      activeTab === tab
        ? "bg-(--color-1) text-white shadow-lg shadow-(--color-1)/20"
        : "text-gray-400 hover:text-white hover:bg-white/5 border border-white/10"
    }`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage system configuration and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-white/10"
          >
            <BiRefresh size={16} />
            Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className="flex items-center gap-2 px-5 py-2 bg-(--color-1) hover:bg-(--color-2) text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <BiSave size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400 flex items-center gap-2">
          <BiXCircle className="shrink-0" size={18} />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-sm text-emerald-400 flex items-center gap-2">
          <BiCheck className="shrink-0" size={18} />
          {successMessage}
        </div>
      )}

      {hasChanges && !error && !successMessage && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-sm text-amber-400 flex items-center gap-2">
          <BiReset className="shrink-0" size={16} />
          You have unsaved changes. Click &quot;Save Changes&quot; to apply them.
        </div>
      )}

      <div className="flex gap-3">
        <button onClick={() => setActiveTab("general")} className={tabClass("general")}>
          <BiCog size={16} />
          General
        </button>
        <button onClick={() => setActiveTab("system")} className={tabClass("system")}>
          <BiServer size={16} />
          System
        </button>
      </div>

      <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center gap-3">
              <svg className="animate-spin h-8 w-8 text-(--color-1)" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-sm text-gray-500">Loading settings...</p>
            </div>
          </div>
        ) : Object.keys(currentSettings).length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <BiCog className="text-gray-600 mb-3" size={40} />
            <p className="text-sm text-gray-500">
              No {activeTab} settings found
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/10">
            {Object.entries(currentSettings).map(([key, setting]) => (
              <div key={key} className="p-5">
                {renderSettingInput(key, setting)}
              </div>
            ))}
          </div>
        )}
      </div>

      {hasChanges && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0e1a]/95 border-t border-white/10 backdrop-blur-md lg:hidden">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-(--color-1) hover:bg-(--color-2) text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving...
              </>
            ) : (
              <>
                <BiSave size={16} />
                Save Changes
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}