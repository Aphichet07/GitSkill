"use client";

import { AlertTriangle, X } from "lucide-react";

interface DeleteCardProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  projectName?: string;
}

function DeleteCard({
  isOpen,
  onClose,
  onConfirm,
  projectName = "โปรเจกต์นี้",
}: DeleteCardProps) {
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
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-red-50 rounded-full flex items-center justify-center mb-4 sm:mb-5 ring-8 ring-red-50/50">
            <AlertTriangle
              size={28}
              strokeWidth={2}
              className="text-red-500 sm:w-8 sm:h-8"
            />
          </div>

          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
            คุณต้องการลบโปรเจกต์นี้ใช่หรือไม่?
          </h3>

          <p className="text-sm text-gray-500 mb-6 sm:mb-8 leading-relaxed">
            <span className="font-semibold text-gray-700">{projectName}</span>{" "}
            จะถูกลบอย่างถาวร
            ข้อมูลทั้งหมดที่เกี่ยวข้องจะไม่สามารถกู้คืนกลับมาได้อีก
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
              className="w-full sm:flex-1 px-4 py-3 sm:py-2.5 bg-red-500 text-white text-sm font-semibold rounded-xl shadow-[0_2px_8px_rgba(239,68,68,0.25)] hover:bg-red-600 hover:shadow-[0_4px_12px_rgba(239,68,68,0.35)] hover:-translate-y-0.5 transition-all focus:outline-none"
            >
              ยืนยันการลบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteCard;
