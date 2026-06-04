"use client";
import React from "react";

interface PointCardProps {
  topic: string;
  explain: string;
  point: number;
  maxPoint?: number;
  iconUrl?: string;
}

function PointCard({
  topic,
  explain,
  point,
  maxPoint = 100,
  iconUrl,
}: PointCardProps) {
  const percentage = Math.min(Math.max((point / maxPoint) * 100, 0), 100);

  const getColorClass = (pct: number) => {
    if (pct >= 80) return "bg-green-500";
    if (pct >= 50) return "bg-blue-400";
    if (pct > 0) return "bg-yellow-400";
    return "bg-gray-300";
  };

  const colorClass = getColorClass(percentage);

  return (
    <div className="bg-white rounded-[20px] shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 p-5 w-full flex flex-col gap-5 h-full">
      <div className="flex items-center gap-4">
        {/* ไอคอน */}
        <div
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shrink-0 transition-colors duration-500 overflow-hidden ${
            iconUrl ? "bg-gray-50 border border-gray-100 p-2" : colorClass
          }`}
        >
          {iconUrl ? (
            <img
              src={iconUrl}
              alt={topic}
              className="w-full h-full object-contain drop-shadow-sm"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <svg
              width="28"
              height="28"
              className="w-6 h-6 sm:w-7 sm:h-7"
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
          )}
        </div>

        <div className="flex flex-col">
          <h2 className="text-[18px] sm:text-[20px] font-bold text-gray-800 leading-tight">
            {topic}
          </h2>
          <p className="text-[11px] sm:text-[12px] text-gray-500 mt-1 line-clamp-2 leading-snug">
            {explain}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 mt-auto">
        <div className="flex items-baseline">
          <span className="text-[24px] sm:text-[28px] font-bold text-gray-900 leading-none">
            {point}
          </span>
          <span className="text-[14px] sm:text-[16px] font-medium text-gray-400 leading-none ml-1">
            /{maxPoint}
          </span>
          <span className="text-[12px] text-gray-500 ml-2 mb-1">pts</span>
        </div>

        <div className="w-full h-2 sm:h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
}

export default PointCard;
