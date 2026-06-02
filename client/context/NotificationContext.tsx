"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface ToastNotification {
  id: number;
  message: string;
  type: ToastType;
}

interface NotificationContextType {
  addToast: (message: string, type: ToastType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const addToast = (message: string, type: ToastType) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  return (
    <NotificationContext.Provider value={{ addToast }}>
      {children}

      <div className="fixed bottom-6 right-6 z-9999 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center p-4 rounded-xl shadow-lg border animate-in slide-in-from-right-8 fade-in duration-300 min-w-75 max-w-sm
              ${toast.type === "success" ? "bg-green-50 border-green-200 text-green-800" : ""}
              ${toast.type === "error" ? "bg-red-50 border-red-200 text-red-800" : ""}
              ${toast.type === "info" ? "bg-blue-50 border-blue-200 text-blue-800" : ""}
            `}
          >
            <div className="mr-3">
              {toast.type === "success" && (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
              {toast.type === "error" && (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              {toast.type === "info" && (
                <Info className="w-5 h-5 text-blue-600" />
              )}
            </div>
            <p className="flex-1 text-sm font-medium">{toast.message}</p>
            <button
              onClick={() =>
                setToasts((prev) => prev.filter((t) => t.id !== toast.id))
              }
              className="ml-4 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotification ต้องถูกใช้งานภายใน NotificationProvider");
  }
  return context;
}
