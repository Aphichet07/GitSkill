"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

function Dashboard() {
  const [isLoginGithub, setIsLoginGithub] = useState<boolean>(false);
  const [isFetchRepo, setIsFetchRepo] = useState<boolean>(false);
  const router = useRouter();

  const handleAuthGithub = async (e: React.MouseEvent<HTMLButtonElement>) => {
    window.location.href = "http://127.0.0.1:8000/auth/github";
  };

  return (
    <div className="max-w-4xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#26318c]">
          Dashboard Overview
        </h1>
        <p className="text-gray-500 mt-2">
          Manage and analyze your GitHub repositories with AI.
        </p>
      </header>

      <div className="bg-white p-8 rounded-3xl border border-[#eaeaea] shadow-sm">
        {!isLoginGithub ? (
          <div className="flex flex-col items-center py-10 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Connect your GitHub</h2>
            <p className="text-gray-500 mb-6 max-w-sm">
              To start summarizing your repositories, please connect your GitHub
              account first.
            </p>
            <button
              onClick={handleAuthGithub}
              className="bg-[#26318c] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#1a2366] transition-all shadow-md active:scale-95"
            >
              Connect GitHub Account
            </button>
          </div>
        ) : (
          <div>
            <p className="text-green-600 font-medium">
              GitHub Connected Successfully!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
