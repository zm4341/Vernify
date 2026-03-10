"use client";

import { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";

export function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div
      className="min-h-screen flex"
      style={{
        fontFamily: "'LXGW WenKai', sans-serif",
        background: "linear-gradient(135deg, #0c0118 0%, #1a0a2e 25%, #16082a 50%, #0d0619 100%)",
      }}
    >
      <AdminSidebar
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((c) => !c)}
      />
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-4 sm:p-6 md:p-8 text-white overflow-auto">{children}</main>
      </div>
    </div>
  );
}
