"use client";
import React from "react";

interface PointCardProps{
  // logo: string
  topic: string
  explain: string
  point: number
}

function PointCard({topic,explain, point} : PointCardProps) {
  return (
    <div className="bg-white rounded-[20px] shadow-sm border border-gray-200 p-5 w-full flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-[#60a5fa] rounded-2xl flex items-center justify-center shrink-0">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect
              x="5"
              y="3"
              width="14"
              height="18"
              rx="2"
              stroke="white"
              strokeWidth="2"
            />
            <path
              d="M9 8H15"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M9 12H15"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path
              d="M9 16H12"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div className="flex flex-col">
          <h2 className="text-[20px] font-medium text-black leading-tight">
            {topic}
          </h2>
          <p className="text-[10px] text-gray-700 mt-1">
            {explain}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-baseline">
          <span className="text-[24px] font-medium text-black leading-none">
            {point}
          </span>
          <span className="text-[16px] font-medium text-black leading-none">
            /15
          </span>
          <span className="text-[12px] text-black ml-2 mb-1">point</span>
        </div>

        <div className="w-full h-2.5 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#60a5fa] rounded-full"
            style={{ width: "86.6%" }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default PointCard;
