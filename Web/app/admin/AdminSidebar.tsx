"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FileText, Circle, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/lib/stores";

const NAV_ITEMS = [
  { href: "/admin", label: "概览", icon: LayoutDashboard },
  { href: "/admin/latex-sync", label: "LaTeX 同步", icon: FileText },
] as const;

type AdminSidebarProps = {
  collapsed: boolean;
  onToggleCollapse: () => void;
};

export function AdminSidebar({ collapsed, onToggleCollapse }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    useAuthStore.getState().clearAuth();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside
      className={`
        flex-shrink-0 flex flex-col border-r border-white/10 overflow-hidden
        transition-[width] duration-300 ease-out
        ${collapsed ? "w-[72px]" : "w-56"}
      `}
      style={{
        fontFamily: "'LXGW WenKai', sans-serif",
        background: "rgba(0,0,0,0.2)",
      }}
      aria-expanded={!collapsed}
    >
      <div
        className={`
          flex items-center border-b border-white/10 overflow-hidden
          transition-[padding] duration-300 ease-out
          ${collapsed ? "p-3 justify-center" : "p-4"}
        `}
      >
        <Link
          href="/courses"
          className={`flex items-center text-white/90 font-semibold hover:text-white transition-colors ${
            collapsed ? "gap-0 justify-center" : "gap-3"
          }`}
          title={collapsed ? "返回课程" : undefined}
        >
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
              boxShadow: "0 2px 12px rgba(124, 58, 237, 0.35)",
            }}
          >
            <Circle size={16} className="text-white" strokeWidth={2.5} aria-hidden />
          </div>
          {!collapsed && (
            <span className="whitespace-nowrap truncate ml-0 opacity-100 transition-opacity duration-300">
              课程
            </span>
          )}
        </Link>
      </div>
      <nav className="p-3 flex-1 overflow-hidden flex flex-col" aria-label="管理后台导航">
        <ul className="space-y-1 flex-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  title={collapsed ? label : undefined}
                  className={`
                    flex items-center rounded-lg text-sm font-medium transition-colors cursor-pointer
                    ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}
                    ${isActive
                      ? "text-white bg-white/10"
                      : "text-white/70 hover:text-white hover:bg-white/5"}
                  `}
                >
                  <Icon size={18} className="flex-shrink-0" aria-hidden />
                  {!collapsed && (
                    <span className="whitespace-nowrap truncate transition-opacity duration-300">
                      {label}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          onClick={handleLogout}
          title={collapsed ? "登出" : undefined}
          className={`
            flex items-center rounded-lg text-sm font-medium transition-colors cursor-pointer
            mt-auto pt-2 border-t border-white/10
            ${collapsed ? "justify-center px-0 py-2.5" : "gap-3 px-3 py-2.5"}
            text-white/70 hover:text-white hover:bg-white/5
          `}
          aria-label="登出"
        >
          <LogOut size={18} className="flex-shrink-0" aria-hidden />
          {!collapsed && (
            <span className="whitespace-nowrap truncate transition-opacity duration-300">
              登出
            </span>
          )}
        </button>
      </nav>
      <div className="p-3 pt-2 border-t border-white/10 shrink-0">
        <button
          type="button"
          onClick={onToggleCollapse}
          className={`
            flex items-center w-full rounded-lg py-2 text-white/70 hover:text-white hover:bg-white/5
            transition-colors duration-200 cursor-pointer
            ${collapsed ? "justify-center px-0" : "gap-3 px-3"}
          `}
          aria-label={collapsed ? "展开侧边栏" : "收起侧边栏"}
          title={collapsed ? "展开侧边栏" : "收起侧边栏"}
        >
          {collapsed ? (
            <ChevronRight size={18} aria-hidden />
          ) : (
            <>
              <ChevronLeft size={18} aria-hidden />
              <span className="text-sm font-medium whitespace-nowrap truncate">
                收起
              </span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}
