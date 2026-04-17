"use client";

import { useState, useEffect } from "react";
import {
  Binoculars,
  FolderKanban,
  Brain,
  FileUser,
  Settings,
  UserCircle,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/asset/logo1.png";

function Sidebar() {
  return (
    <>
      {/* ให้ชิดซ้าย */}
      <aside className="w-64 min-h-screen bg-white flex flex-col border-r border-[#eaeaea]">
        <div className="p-4">
          <div className="w-full h-40 flex flex-col items-center justify-center gap-2">
            <Image
              src={Logo}
              alt="logo"
              width={100}
              height={100}
              className="object-contain"
            />
            <h1 className="text-xl font-bold text-black text-center">
              GitSkill
            </h1>
          </div>
        </div>
        <nav className="flex-1 px-3 py-6 border-t border-[#eaeaea]">
          <div className="flex flex-col gap-y-1">
            <Link
              href="/dashboard/overview"
              className="group flex items-center h-11 px-4 rounded-xl text-[#26318c] hover:bg-white/50 hover:shadow-sm transition-all duration-200"
            >
              <Binoculars
                size={20}
                strokeWidth={1.5}
                className="shrink-0 opacity-70 group-hover:opacity-100"
              />
              <span className="ml-3 text-sm font-medium">Overview</span>
            </Link>

            <Link
              href="/dashboard/project"
              className="group flex items-center h-11 px-4 rounded-xl text-[#26318c] hover:bg-white/50 hover:shadow-sm transition-all duration-200"
            >
              <FolderKanban
                size={20}
                strokeWidth={1.5}
                className="shrink-0 opacity-70 group-hover:opacity-100"
              />
              <span className="ml-3 text-sm font-medium">Projects</span>
            </Link>

            <Link
              href="/dashboard/insight"
              className="group flex items-center h-11 px-4 rounded-xl text-[#26318c] hover:bg-white/50 hover:shadow-sm transition-all duration-200"
            >
              <Brain
                size={20}
                strokeWidth={1.5}
                className="shrink-0 opacity-70 group-hover:opacity-100"
              />
              <span className="ml-3 text-sm font-medium">Insight</span>
            </Link>

            <Link
              href="/dashboard/report"
              className="group flex items-center h-11 px-4 rounded-xl text-[#26318c] hover:bg-white/50 hover:shadow-sm transition-all duration-200"
            >
              <FileUser
                size={20}
                strokeWidth={1.5}
                className="shrink-0 opacity-70 group-hover:opacity-100"
              />
              <span className="ml-3 text-sm font-medium">Report</span>
            </Link>
          </div>
        </nav>

        <div className="p-4 border-t border-[#eaeaea]">
          <div className="flex flex-col gap-y-1">
            {/* Settings Button */}
            <button className="group flex items-center h-10 w-full px-3 rounded-xl text-[#26318c] hover:bg-white/50 hover:shadow-sm transition-all duration-200">
              <Settings
                size={18}
                strokeWidth={1.5}
                className="shrink-0 opacity-70 group-hover:rotate-45 transition-transform duration-300"
              />
              <span className="ml-3 text-sm font-medium">Settings</span>
            </button>

            {/* Profile Button */}
            <button className="group flex items-center h-10 w-full px-3 rounded-xl text-[#26318c] hover:bg-white/50 hover:shadow-sm transition-all duration-200">
              <UserCircle
                size={18}
                strokeWidth={1.5}
                className="shrink-0 opacity-70"
              />
              <span className="ml-3 text-sm font-medium">Profile</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
