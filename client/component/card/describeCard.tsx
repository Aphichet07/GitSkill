"use client"
import React from "react";

interface DescribeProps{
    describe: string
}


function DescribeCard({describe} : DescribeProps) {
    return (
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-200 p-8 w-full">
            
            <h2 className="text-xl font-bold text-gray-900 mb-3">
                Describe
            </h2>
            
            <p className="text-sm text-gray-600 leading-relaxed">{describe}</p>
            
        </div>
    );
}

export default DescribeCard
