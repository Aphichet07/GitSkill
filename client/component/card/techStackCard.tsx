"use client";
import React from "react";

interface TechStackCardProps {
  name: string;
  iconUrl?: string;
}

function TechStackCard({ name, iconUrl }: TechStackCardProps) {
  const getFallbackIcon = (techName: string) => {
    const lowerName = techName.toLowerCase();

    let iconName = lowerName.replace(/[^a-z0-9]/g, "");
    if (lowerName.includes("html")) iconName = "html";
    if (lowerName.includes("css")) iconName = "css";
    if (lowerName.includes("javascript") || lowerName === "js") iconName = "js";
    if (lowerName.includes("typescript") || lowerName === "ts") iconName = "ts";
    if (lowerName.includes("c++") || lowerName === "cpp") iconName = "cpp";
    if (lowerName.includes("c#") || lowerName === "csharp") iconName = "cs";
    if (lowerName.includes("node")) iconName = "nodejs";

    return `https://skillicons.dev/icons?i=${iconName}`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 w-24 h-24 sm:w-28 sm:h-28 flex flex-col items-center justify-center gap-2 sm:gap-3 p-2 shrink-0 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
      <div className="flex items-center justify-center h-8 sm:h-12">
        <img
          src={iconUrl || getFallbackIcon(name)}
          alt={name}
          className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 object-contain drop-shadow-sm"
          onError={(e) => {
            e.currentTarget.src =
              "https://cdn-icons-png.flaticon.com/512/888/888879.png";
          }}
        />
      </div>

      <span className="text-xs sm:text-sm font-medium text-gray-700 text-center truncate w-full px-1">
        {name}
      </span>
    </div>
  );
}

export default TechStackCard;
