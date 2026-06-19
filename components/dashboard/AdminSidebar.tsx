"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { useMenuStore } from "@/store/menu";
import { useAuthStore } from "@/store/auth";
import { Logo } from "@/assets";
import Image from "next/image";
import {
  BiHome,
  BiCart,
  BiPackage,
  BiHistory,
  BiGridAlt,
  BiWallet,
  BiDollar,
  BiSupport,
  BiGroup,
  BiBarChart,
  BiUserCircle,
  BiCog,
  BiClipboard,
  BiMenuAltLeft,
  BiChevronDown,
  BiChevronRight,
  BiLogOut,
} from "react-icons/bi";
import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const iconMap: Record<string, React.ReactNode> = {
  BiHome: <BiHome size={20} />,
  BiCart: <BiCart size={20} />,
  BiPackage: <BiPackage size={20} />,
  BiHistory: <BiHistory size={20} />,
  BiGridAlt: <BiGridAlt size={20} />,
  BiWallet: <BiWallet size={20} />,
  BiDollar: <BiDollar size={20} />,
  BiSupport: <BiSupport size={20} />,
  BiGroup: <BiGroup size={20} />,
  BiBarChart: <BiBarChart size={20} />,
  BiUserCircle: <BiUserCircle size={20} />,
  BiCog: <BiCog size={20} />,
  BiClipboard: <BiClipboard size={20} />,
};

const AdminSidebar = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { menus, sidebarCollapsed, toggleSidebar } = useMenuStore();
  const { user, logout } = useAuthStore();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  
  useEffect(() => {
    const activeMenu = menus.find((m) => pathname.startsWith(m.path));
    if (activeMenu?.parent_id) {
      setExpandedMenus((prev) => new Set(prev).add(activeMenu.parent_id!));
    }
  }, [pathname, menus]);

  const toggleExpand = (id: string) => {
    setExpandedMenus((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isActive = (path: string) => {
    if (path === "/admin/dashboard") return pathname === path;
    return pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/auth/login");
  };

  if (!mounted) return null;

  const renderMenuItem = (item: {
    id: string;
    name: string;
    icon: string;
    path: string;
    children?: any[];
  } | null) => {
    if (!item) return null;

    const hasChildren = item.children && item.children.length > 0;
    const active = isActive(item.path);
    const isExpanded = expandedMenus.has(item.id);

    const menuContent = (
      <div
        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-200 ${
          active
            ? "bg-(--color-1)/20 text-(--color-1) font-semibold"
            : "text-gray-400 hover:text-white hover:bg-white/5"
        } ${sidebarCollapsed ? "justify-center" : ""}`}
        onClick={() => {
          if (hasChildren) {
            toggleExpand(item.id);
          } else {
            router.push(item.path);
          }
        }}
      >
        <span className="flex-shrink-0">
          {iconMap[item.icon] || <BiHome size={20} />}
        </span>
        {!sidebarCollapsed && (
          <>
            <span className="flex-1 text-sm truncate">{item.name}</span>
            {hasChildren && (
              <span className="flex-shrink-0">
                {isExpanded ? (
                  <BiChevronDown size={16} />
                ) : (
                  <BiChevronRight size={16} />
                )}
              </span>
            )}
          </>
        )}
      </div>
    );

    if (hasChildren && !sidebarCollapsed) {
      return (
        <div key={item.id}>
          {menuContent}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="ml-6 border-l border-white/10 pl-2 mt-1 space-y-1">
                  {(item.children ?? []).map((child: any) => renderMenuItem(child))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }

    return <div key={item.id}>{menuContent}</div>;
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-40 flex flex-col bg-[#0a0e1a] border-r border-white/10 transition-all duration-300 ${
        sidebarCollapsed ? "w-[70px]" : "w-[260px]"
      }`}
    >
       
      <div
        className={`flex items-center h-16 border-b border-white/10 px-4 ${
          sidebarCollapsed ? "justify-center" : "justify-between"
        }`}
      >
        {!sidebarCollapsed && (
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image
                src={Logo.src}
                alt="Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="font-bold text-lg text-white tracking-wide">
              Sigite<span className="text-(--color-1)">Store</span>
            </span>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded hover:bg-white/5"
        >
          <BiMenuAltLeft size={20} />
        </button>
      </div>

       
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {menus.map((menu) => renderMenuItem(menu))}
      </nav>

       
      <div className="border-t border-white/10 p-3">
        {!sidebarCollapsed && user && (
          <div className="flex items-center gap-3 mb-3 px-2">
            <div className="w-8 h-8 rounded-full bg-(--color-1)/20 flex items-center justify-center text-(--color-1) font-bold text-sm">
              {(user.display_name || user.email || "U").charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate font-medium">
                {user.display_name || "User"}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user.role_name || "User"}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 ${
            sidebarCollapsed ? "justify-center" : ""
          }`}
        >
          <BiLogOut size={20} />
          {!sidebarCollapsed && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;