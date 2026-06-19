"use client";

import { useAuthStore } from "@/store/auth";
import { useMenuStore } from "@/store/menu";
import { Logo } from "@/assets";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import {
  BiBell,
  BiWallet,
  BiUserCircle,
  BiLogOut,
  BiChevronDown,
  BiMenuAltLeft,
  BiCog,
  BiHelpCircle,
} from "react-icons/bi";
import { motion, AnimatePresence } from "framer-motion";

const AdminHeader = () => {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { sidebarCollapsed, toggleSidebar } = useMenuStore();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  const isSuperAdmin = user?.role_name === "SUPER_ADMIN";

  if (!mounted) return null;

  return (
    <header className="sticky top-0 z-30 w-full h-16 bg-[#0e1324]/95 backdrop-blur-md border-b border-white/10">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
         
        <div className="flex items-center gap-3">
           
          <button
            onClick={toggleSidebar}
            className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 lg:hidden"
          >
            <BiMenuAltLeft size={22} />
          </button>

           
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 lg:hidden"
          >
            <div className="relative w-7 h-7">
              <Image src={Logo.src} alt="Logo" fill className="object-contain" />
            </div>
            <span className="font-bold text-base text-white">
              Sigite<span className="text-(--color-1)">Store</span>
            </span>
          </Link>

        </div>

         
        <div className="flex items-center gap-2">
           
          {!isSuperAdmin && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-(--color-1)/10 border border-(--color-1)/20">
              <BiWallet className="text-(--color-1)" size={18} />
              <span className="text-sm font-medium text-white">
                Rp {(user?.wallet_balance || 0).toLocaleString("id-ID")}
              </span>
            </div>
          )}

           
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setNotifOpen(!notifOpen)}
              className="relative p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
            >
              <BiBell size={22} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <AnimatePresence>
              {notifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-80 bg-[#0e1324] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                >
                  <div className="p-4 border-b border-white/10">
                    <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-500 text-center py-8">
                      No notifications yet
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

           
          <div className="relative" ref={profileRef}>
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-(--color-1)/20 flex items-center justify-center text-(--color-1) font-bold text-sm">
                {(user?.display_name || user?.email || "U").charAt(0).toUpperCase()}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-sm font-medium text-white leading-tight">
                  {user?.display_name || "User"}
                </p>
                <p className="text-xs text-gray-500 leading-tight">
                  {user?.role_name || "User"}
                </p>
              </div>
              <BiChevronDown
                size={16}
                className={`text-gray-500 transition-transform duration-200 ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>
            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-[#0e1324] border border-white/10 rounded-xl shadow-2xl overflow-hidden"
                >
                  <div className="p-3 border-b border-white/10">
                    <p className="text-sm font-medium text-white">
                      {user?.display_name || "User"}
                    </p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                  <div className="p-1">
                    {!isSuperAdmin && (
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          router.push("/admin/wallet");
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <BiWallet size={16} />
                        Wallet
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        router.push("/admin/profile");
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <BiUserCircle size={16} />
                      Profile & Security
                    </button>
                    {isSuperAdmin && (
                      <button
                        onClick={() => {
                          setProfileOpen(false);
                          router.push("/admin/settings");
                        }}
                        className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                      >
                        <BiCog size={16} />
                        System Settings
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setProfileOpen(false);
                        router.push("/admin/support");
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <BiHelpCircle size={16} />
                      Help & Support
                    </button>
                    <hr className="my-1 border-white/10" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <BiLogOut size={16} />
                      Logout
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;