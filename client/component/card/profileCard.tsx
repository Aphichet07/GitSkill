"use client";
import React from "react";

interface ProfileCardProps {
  imageUrl: string;
  name: string;
  position: string;
}

function ProfileCard({ imageUrl, name, position }: ProfileCardProps) {
  return (
    <div className="flex items-center gap-5 w-auto">
      <div className="shrink-0">
        <img
          src={imageUrl}
          alt="Image"
          className="w-20 h-20 rounded-full object-cover"
        />
      </div>

      <div className="flex flex-col">
        <h1 className="text-3xl font-medium text-black">{name}</h1>
        <p className="text-lg text-gray-900 mt-0.5">{position}</p>
      </div>
    </div>
  );
}

export default ProfileCard;
