"use client";

import { useEffect, useMemo } from "react";
import { useAuthStore } from "@/store/auth";
import { useMenuStore } from "@/store/menu";
import AdminSidebar from "./AdminSidebar";
import AdminHeader from "./AdminHeader";
import { useRouter, usePathname } from "next/navigation";

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { isAuthenticated, isHydrated, user, checkSession } = useAuthStore();
  const { menus, sidebarCollapsed, mobileOpen, closeMobile, fetchMenus } = useMenuStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isHydrated) {
      checkSession();
    }
  }, [isHydrated, checkSession]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchMenus();
    }
  }, [isAuthenticated, fetchMenus]);

  
  const hasPageAccess = useMemo(() => {
    if (!isAuthenticated || menus.length === 0) return false;

    
    const flattenMenus = (items: any[]): string[] => {
      const paths: string[] = [];
      for (const item of items) {
        paths.push(item.path);
        if (item.children && item.children.length > 0) {
          paths.push(...flattenMenus(item.children));
        }
      }
      return paths;
    };

    const allowedPaths = flattenMenus(menus);
    
    
    return allowedPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
  }, [pathname, menus, isAuthenticated]);

  
  if (isHydrated && !isAuthenticated) {
    router.push("/auth/login");
    return null;
  }

  
  if (!isHydrated || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#000514] flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-(--color-1) border-t-transparent" />
      </div>
    );
  }

  
  if (isHydrated && isAuthenticated && menus.length > 0 && !hasPageAccess) {
    
    if (pathname !== "/admin/dashboard") {
      
      router.push("/admin/dashboard");
      return null;
    }
  }

  return (
    <div className="min-h-screen bg-[#000514]">
      <AdminSidebar />

      {mobileOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <div
        className={`transition-all duration-300 ml-0 ${
          sidebarCollapsed ? "lg:ml-[70px]" : "lg:ml-[260px]"
        }`}
      >
        <AdminHeader />
        <main className="p-4 lg:p-6 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
