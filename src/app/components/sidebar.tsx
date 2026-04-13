"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Wallet,
  ArrowLeftRight,
  TrendingUp,
  User,
  Settings,
  ShieldCheck,
  Menu,
  X,
  LogOut,
  Mail // 👈 Includes Mail icon
} from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/messages", label: "Messages", icon: Mail }, // 👈 The Button for Users
  { href: "/deposit", label: "Deposit", icon: Wallet },
  { href: "/withdrawal", label: "Withdrawal", icon: ArrowLeftRight },
  { href: "/trade", label: "Trade", icon: TrendingUp },
  { href: "/settings/profile", label: "Profile Settings", icon: User },
  { href: "/settings/account", label: "Account Settings", icon: Settings },
  { href: "/settings/security", label: "Security", icon: ShieldCheck },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  useEffect(() => setMobileOpen(false), [pathname]);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/api/auth/logout';
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => {
          if (window.innerWidth >= 768) {
            setDesktopCollapsed(!desktopCollapsed);
          } else {
            setMobileOpen(!mobileOpen);
          }
        }}
        className="fixed top-4 left-4 z-50 p-2 rounded-md bg-[#0b1220] border border-white/10 text-white hover:bg-white/5 transition-colors"
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "fixed inset-y-0 left-0 z-40 bg-[#0b1220] border-r border-white/10 transition-all duration-300 ease-in-out flex flex-col",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0",
          desktopCollapsed ? "md:w-20" : "md:w-64"
        )}
      >
        <div
          className={clsx(
            "flex items-center h-16 border-b border-white/10 flex-shrink-0",
            desktopCollapsed ? "justify-center" : "px-6"
          )}
        >
          <div className="text-xl font-bold text-white tracking-wide">
            {desktopCollapsed ? (
              <span className="text-blue-500">TRADE</span>
            ) : (
              <>
                CFD <span className="text-blue-500">X</span>
              </>
            )}
          </div>
        </div>

        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {items.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={clsx(
                  "flex items-center gap-3 px-3 py-3 rounded-xl transition-all group",
                  isActive
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                    : "text-gray-400 hover:bg-white/5 hover:text-white",
                  desktopCollapsed && "justify-center px-0"
                )}
                title={desktopCollapsed ? item.label : undefined}
              >
                <Icon
                  size={20}
                  className={clsx(isActive ? "text-white" : "group-hover:text-white")}
                />
                {!desktopCollapsed && (
                  <span className="text-sm font-medium whitespace-nowrap">
                    {item.label}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-white/10 mt-auto bg-[#0b1220] flex-shrink-0">
          <button
            onClick={handleLogout}
            className={clsx(
              "flex items-center gap-3 w-full px-3 py-3 rounded-xl transition-all group text-red-400 hover:text-red-300 hover:bg-red-500/10",
              desktopCollapsed && "justify-center px-0"
            )}
            title="Log Out"
            type="button"
          >
            <LogOut size={20} />
            {!desktopCollapsed && (
              <span className="text-sm font-medium">Log Out</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
// Force update user sidebar
