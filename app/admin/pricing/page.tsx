"use client";

import { useEffect, useState } from "react";
import { useAdminPricingStore } from "@/store/adminPricing";
import { BiSave, BiReset, BiInfoCircle } from "react-icons/bi";

export default function PricingPage() {
  const {
    marginPercent,
    loading,
    saving,
    error,
    success,
    fetchMargin,
    updateMargin,
    clearMessages,
  } = useAdminPricingStore();

  const [localMargin, setLocalMargin] = useState<string>("1.00");
  const [previewPrice, setPreviewPrice] = useState<string>("");
  const [basePriceInput, setBasePriceInput] = useState<string>("");

  useEffect(() => {
    fetchMargin();
  }, [fetchMargin]);

  useEffect(() => {
    setLocalMargin(marginPercent.toFixed(2));
  }, [marginPercent]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        clearMessages();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success, clearMessages]);

  const handleSave = async () => {
    const value = parseFloat(localMargin);
    if (isNaN(value) || value < 0) {
      return;
    }
    await updateMargin(value);
  };

  const handleReset = () => {
    setLocalMargin(marginPercent.toFixed(2));
    setBasePriceInput("");
    setPreviewPrice("");
    clearMessages();
  };

  const handlePreviewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const basePrice = e.target.value;
    setBasePriceInput(basePrice);

    const priceNum = parseFloat(basePrice);
    const marginNum = parseFloat(localMargin);

    if (!isNaN(priceNum) && priceNum > 0 && !isNaN(marginNum)) {
      const calculated = Math.ceil(priceNum + priceNum * (marginNum / 100));
      setPreviewPrice(calculated.toLocaleString("id-ID"));
    } else {
      setPreviewPrice("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Pricing & Margin Management
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage the global profit margin percentage applied to all products
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-sm text-red-400">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-sm text-emerald-400">
          {success}
        </div>
      )}

      {loading ? (
        <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl p-8 text-center">
          <div className="inline-block w-6 h-6 border-2 border-(--color-1) border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-gray-400 text-sm">Loading margin settings...</p>
        </div>
      ) : (
        <>
          <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-white mb-6">
              Global Margin Settings
            </h2>

            <div className="max-w-md space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Margin Percentage (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    value={localMargin}
                    onChange={(e) => setLocalMargin(e.target.value)}
                    step="0.01"
                    min="0"
                    max="100"
                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-lg font-semibold text-white placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors"
                    placeholder="1.00"
                  />
                  <span className="text-gray-400 text-lg font-medium">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                  <BiInfoCircle size={14} />
                  Selling price = Base price + (Base price × Margin%)
                </p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-(--color-1) hover:bg-(--color-2) text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <BiSave size={16} />
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleReset}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50 border border-white/10"
                >
                  <BiReset size={16} />
                  Reset
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl p-6 lg:p-8">
            <h2 className="text-lg font-semibold text-white mb-6">
              Price Preview
            </h2>

            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Enter Base Price (Rp)
                </label>
                <input
                  type="number"
                  value={basePriceInput}
                  onChange={handlePreviewChange}
                  placeholder="e.g. 50000"
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-(--color-1)/50 transition-colors"
                />
              </div>

              {previewPrice && (
                <div className="bg-white/5 rounded-lg p-4 border border-white/10">
                  <div className="text-sm text-gray-400 mb-1">
                    Selling Price ({parseFloat(localMargin).toFixed(2)}% margin):
                  </div>
                  <div className="text-2xl font-bold text-(--color-1)">
                    Rp {previewPrice}
                  </div>
                  <div className="text-xs text-gray-500 mt-2">
                    * Rounded up (ceil)
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#0e1324]/80 border border-white/10 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-3">
              Information
            </h2>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start gap-2">
                <span className="text-(--color-1) mt-1">•</span>
                <span>
                  Margin applies <strong className="text-white">globally</strong>{" "}
                  to all Digiflazz products.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-(--color-1) mt-1">•</span>
                <span>
                  Prices will be recalculated on the next product sync (every 5
                  minutes).
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-(--color-1) mt-1">•</span>
                <span>
                  Current margin:{" "}
                  <strong className="text-white">
                    {marginPercent.toFixed(2)}%
                  </strong>
                </span>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}