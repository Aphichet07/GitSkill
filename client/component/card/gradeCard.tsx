"use client"
import React from "react";

interface GradeCardProps {
    point: number;
    grade: string;
}

function GradeCard({ point, grade } : GradeCardProps) {
    return (
        <div className="bg-white rounded-[22px] w-40 h-20 overflow-hidden shadow-lg">
            <div className="flex h-full">
                <div className="w-2/3 flex flex-col justify-center pl-4">
                    <div className="text-xs font-semibold text-gray-500">
                        GRADE
                    </div>
                    <div className="text-sm font-bold text-gray-800">
                        {point}/100
                    </div>
                </div>
                <div className="w-1/3 flex items-center justify-center text-3xl font-bold text-red-500 bg-red-50/50">
                    {grade}
                </div>
                
            </div>
        </div>
    );
}

export default GradeCard