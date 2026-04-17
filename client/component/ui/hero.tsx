"use client";
import { useState } from "react";
import Image from "next/image";
import Logo from "@/asset/logo1.png";
import Slide from "@/component/ui/slide";
import AuthModal from "../modals/authModal";
function HeroBackground() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <section className="relative w-full pt-15 pb-10 border-b border-slate-400 overflow-hidden bg-white">
      <div
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      ></div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col items-center justify-center gap-2">
          <div className="overflow-hidden rounded-lg">
            <Image src={Logo} alt="logo" width={100} height={100} />
          </div>

          <h1 className="font-bold text-5xl text-transparent bg-clip-text bg-[linear-gradient(to_right,#322854,#3F1A84,#7B70DD,#3140B3)]">
            Your Code-Native Portfolio
          </h1>

          <div className="relative pt-6">
            <span className="font-medium text-2xl text-gray-600 text-shadow-lg">
              Turn your GitHub into a visual skill dashboard.
            </span>
          </div>
          <div className="relative">
            <span className="font-medium text-2xl text-gray-600 text-shadow-lg">
              Stand out and get hired.
            </span>
          </div>

          <div className="relative pt-20">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="min-w-50 min-h-10 group inline-flex items-center justify-center px-6 py-2 overflow-hidden text-[18px] font-bold tracking-widest text-white border border-transparent rounded-[5px] transition-all duration-300 bg-black hover:-translate-y-0.5 shadow-2xl"
              >
                <span className="relative flex items-center justify-center gap-2">
                  GET STARTED
                </span>
              </button>
            </div>
          </div>
          <div className="relative pt-30">
            <div className="flex flex-col items-center justify-center">
              <Slide />
              <p className="text-[10px] font-light text-gray-600 ">
                Scroll Down
              </p>
            </div>
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
        </div>
      </div>
    </section>
  );
}

export default HeroBackground;