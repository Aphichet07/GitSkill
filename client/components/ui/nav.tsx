"use client";
import { useState } from "react";
import Image from "next/image";
import Logo from "@/asset/logo1.png";
import AuthModal from "../modals/authModal";
function Header() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navItems = [
    { label: "Home", href: "#home" },
    { label: "Feature", href: "#feature" },
    { label: "How It Works", href: "#work" },
  ];

  return (
    <header className="w-full bg-white h-20 border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-8">
        <div className="flex items-center gap-2 group cursor-pointer">
          <div className="overflow-hidden rounded-lg">
            <Image
              src={Logo}
              alt="logo"
              width={45}
              height={45}
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-800 leading-none">
              GITGKILL.AI
            </h1>
          </div>
        </div>

        <nav className="hidden md:block">
          <ul className="flex gap-10">
            {navItems.map((item) => (
              <li key={item.label}>
                <a
                  href={item.href}
                  className="relative scroll-smooth hover:text-blue-600 transition-colors after:absolute after:left-0 after:-bottom-1 after:h-0.5 after:w-0 after:bg-blue-600 after:transition-all after:duration-300 hover:after:w-full"
                >
                  {item.label}
                </a>
              </li>
            ))}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="group relative inline-flex items-center justify-center px-6 py-2 overflow-hidden font-mono text-[10px] font-bold tracking-widest text-white border border-transparent rounded-lg transition-all duration-300 bg-black hover:-translate-y-0.5"
              >
                <span className="relative flex items-center justify-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                  GET STARTED
                </span>
              </button>
            </div>

            {isModalOpen && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                
                <div
                  className="w-full max-w-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <AuthModal onClose={() => setIsModalOpen(false)} />
                </div>
              </div>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;