"use client";

import { LogOut, X } from "lucide-react";

interface LogoutCardProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function LogoutCard({
  isOpen,
  onClose,
  onConfirm,
}: LogoutCardProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm transition-opacity">
      <div className="bg-white rounded-2xl w-full max-w-[90%] sm:max-w-md shadow-2xl overflow-hidden transform transition-all scale-100 opacity-100">
        {/* Header */}
        <div className="flex justify-end p-3 sm:p-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors focus:outline-none"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Body */}
        <div className="px-5 sm:px-6 pb-6 sm:pb-8 pt-0 flex flex-col items-center text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-rose-50 rounded-full flex items-center justify-center mb-4 sm:mb-5 ring-8 ring-rose-50/50">
            <LogOut
              size={28}
              strokeWidth={2}
              className="text-[#ca2143] sm:w-8 sm:h-8"
            />
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            ต้องการออกจากระบบใช่หรือไม่?
          </h3>

          <p className="text-sm text-gray-500 mb-6 sm:mb-8 leading-relaxed">
            คุณจะต้องทำการเข้าสู่ระบบใหม่อีกครั้งในครั้งต่อไป<br/>
            เพื่อเข้าใช้งานข้อมูลของคุณ
          </p>

          <div className="flex flex-col-reverse sm:flex-row w-full gap-3">
            <button
              onClick={onClose}
              className="w-full sm:flex-1 px-4 py-3 sm:py-2.5 border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all focus:outline-none"
            >
              ยกเลิก
            </button>
            <button
              onClick={onConfirm}
              className="w-full sm:flex-1 px-4 py-3 sm:py-2.5 bg-[#ca2143] text-white text-sm font-semibold rounded-xl shadow-[0_2px_8px_rgba(202,33,67,0.25)] hover:bg-[#b01d3a] hover:shadow-[0_4px_12px_rgba(202,33,67,0.35)] hover:-translate-y-0.5 transition-all focus:outline-none"
            >
              ออกจากระบบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LogoutCard;