"use client";

import { useState, useEffect } from "react";
import {
  Binoculars,
  FolderKanban,
  Brain,
  FileUser,
  Settings,
  UserCircle,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/asset/logo1.png";

function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth >= 768) {
        setIsMobileOpen(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const collapsed = isCollapsed && !isMobile;

  return (
    <>
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 flex items-center justify-center w-10 h-10 bg-white border border-[#eaeaea] rounded-xl shadow-sm text-[#26318c] hover:bg-gray-50 transition-all focus:outline-none"
      >
        <Menu size={20} strokeWidth={2} />
      </button>

      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Container หลัก */}
      <div className="relative z-50">
        <aside
          className={`fixed md:relative inset-y-0 left-0 bg-white flex flex-col border-r border-[#eaeaea] transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] z-50
          ${collapsed ? "w-20" : "w-64"} 
          ${isMobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"} 
          md:translate-x-0 md:shadow-none`}
        >
          {/* X สำหรับ Mobile */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="md:hidden absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <X size={20} strokeWidth={2} />
          </button>

          <div className="p-4">
            <div className="w-full h-40 flex flex-col items-center justify-center gap-2 overflow-hidden">
              <Image
                src={Logo}
                alt="logo"
                width={collapsed ? 45 : 100}
                height={collapsed ? 45 : 100}
                className="object-contain transition-all duration-500"
              />
              {!collapsed && (
                <h1 className="text-xl font-bold text-black text-center whitespace-nowrap animate-fadeIn">
                  GitSkill
                </h1>
              )}
            </div>
          </div>

          <nav className="flex-1 px-3 py-6 border-t border-[#eaeaea]">
            <div className="flex flex-col gap-y-1">
              <Link
                href="/dashboard"
                onClick={() => setIsMobileOpen(false)}
                className={`group flex items-center h-11 rounded-xl text-[#26318c] hover:bg-[#f8f9fa] hover:shadow-sm transition-all duration-200 ${
                  collapsed ? "justify-center px-0" : "px-4"
                }`}
              >
                <Binoculars
                  size={20}
                  strokeWidth={1.5}
                  className="shrink-0 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-300"
                />
                {!collapsed && (
                  <span className="ml-3 text-sm font-medium whitespace-nowrap animate-fadeIn">
                    Overview
                  </span>
                )}
              </Link>

              <Link
                href="/dashboard/project"
                onClick={() => setIsMobileOpen(false)}
                className={`group flex items-center h-11 rounded-xl text-[#26318c] hover:bg-[#f8f9fa] hover:shadow-sm transition-all duration-200 ${
                  collapsed ? "justify-center px-0" : "px-4"
                }`}
              >
                <FolderKanban
                  size={20}
                  strokeWidth={1.5}
                  className="shrink-0 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-300"
                />
                {!collapsed && (
                  <span className="ml-3 text-sm font-medium whitespace-nowrap animate-fadeIn">
                    Projects
                  </span>
                )}
              </Link>

              <Link
                href="/dashboard/insight"
                onClick={() => setIsMobileOpen(false)}
                className={`group flex items-center h-11 rounded-xl text-[#26318c] hover:bg-[#f8f9fa] hover:shadow-sm transition-all duration-200 ${
                  collapsed ? "justify-center px-0" : "px-4"
                }`}
              >
                <Brain
                  size={20}
                  strokeWidth={1.5}
                  className="shrink-0 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-300"
                />
                {!collapsed && (
                  <span className="ml-3 text-sm font-medium whitespace-nowrap animate-fadeIn">
                    Insight
                  </span>
                )}
              </Link>

              <Link
                href="/dashboard/report"
                onClick={() => setIsMobileOpen(false)}
                className={`group flex items-center h-11 rounded-xl text-[#26318c] hover:bg-[#f8f9fa] hover:shadow-sm transition-all duration-200 ${
                  collapsed ? "justify-center px-0" : "px-4"
                }`}
              >
                <FileUser
                  size={20}
                  strokeWidth={1.5}
                  className="shrink-0 opacity-70 group-hover:opacity-100 group-hover:scale-110 transition-transform duration-300"
                />
                {!collapsed && (
                  <span className="ml-3 text-sm font-medium whitespace-nowrap animate-fadeIn">
                    Report
                  </span>
                )}
              </Link>
            </div>
          </nav>

          <div className="p-4 border-t border-[#eaeaea]">
            <div className="flex flex-col gap-y-1">
              <button
                className={`group flex items-center h-10 w-full rounded-xl text-[#26318c] hover:bg-[#f8f9fa] hover:shadow-sm transition-all duration-200 ${
                  collapsed ? "justify-center px-0" : "px-3"
                }`}
              >
                <Settings
                  size={18}
                  strokeWidth={1.5}
                  className="shrink-0 opacity-70 group-hover:rotate-45 transition-transform duration-300"
                />
                {!collapsed && (
                  <span className="ml-3 text-sm font-medium whitespace-nowrap animate-fadeIn">
                    Settings
                  </span>
                )}
              </button>

              <button
                className={`group flex items-center h-10 w-full rounded-xl text-[#26318c] hover:bg-[#f8f9fa] hover:shadow-sm transition-all duration-200 ${
                  collapsed ? "justify-center px-0" : "px-3"
                }`}
              >
                <UserCircle
                  size={18}
                  strokeWidth={1.5}
                  className="shrink-0 opacity-70 group-hover:scale-110 transition-transform duration-300"
                />
                {!collapsed && (
                  <span className="ml-3 text-sm font-medium whitespace-nowrap animate-fadeIn">
                    Profile
                  </span>
                )}
              </button>
            </div>
          </div>
        </aside>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex absolute top-8 left-full ml-4 items-center justify-center w-9 h-9 bg-white border border-[#eaeaea] rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] hover:border-[#26318c]/30 hover:bg-[#f8f9fa] transition-all duration-300 group focus:outline-none"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronLeft
            size={18}
            strokeWidth={2.5}
            className={`text-gray-400 group-hover:text-[#26318c] transition-transform duration-500 ease-in-out ${
              collapsed ? "rotate-180" : "rotate-0"
            }`}
          />
        </button>
      </div>
    </>
  );
}

export default Sidebar;
