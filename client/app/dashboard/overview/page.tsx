"use client";

import { useState, useEffect } from "react";

function OverviewPage() {
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

      <div className="bg-white p-8 rounded-3xl border border-[#eaeaea] shadow-sm"></div>
    </div>
  );
}

export default OverviewPage;
