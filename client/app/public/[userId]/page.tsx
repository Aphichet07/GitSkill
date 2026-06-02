"use client";
import { useEffect, useState, useCallback, use } from "react";
import axios from "axios";
import { Sparkles } from "lucide-react"; 

import GradeCard from "@/component/card/gradeCard";
import ProfileCard from "@/component/card/profileCard";
import DescribeCard from "@/component/card/describeCard";
import PointCard from "@/component/card/pointCard";
import TechStackCard from "@/component/card/techStackCard";

const SKILL_DESCRIPTIONS: Record<string, string> = {
  "Documentation": "การเขียนเอกสารอธิบายโค้ดและโปรเจกต์",
  "Architecture": "การออกแบบโครงสร้างระบบ",
  "Testing & CI": "การเขียนเทสและระบบ CI/CD",
  "Clean Code": "การเขียนโค้ดให้อ่านและดูแลรักษาง่าย",
  "Efficiency": "ประสิทธิภาพการทำงานของระบบ",
  "Security": "ความปลอดภัยของระบบ",
  "Good Habit": "พฤติกรรมการเขียนโค้ดที่ดี"
};

const SKILL_ICONS: Record<string, string> = {
  Documentation: "/badge/folder.png",
  Architecture: "/badge/coding.png",
  "Testing & CI": "/badge/exam-time.png",
  "Clean Code": "/badge/webpage.png",
  Efficiency: "/badge/lightning.png",
  Security: "/badge/cyber-security.png",
  "Good Habit": "/badge/convenience.png",
};

export default function PublicProjectReportPage({ params }: { params: Promise<{ userId: string }> }) {
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const { userId } = use(params); 

  const fetchPublicProject = useCallback(async () => {
    setIsLoading(true);
    try {
      const url = `http://localhost:8000/user/public/project/${userId}`;
      const res = await axios.get(url); 
      
      if (res.data.success) {
        setReportData(res.data.data); 
      }
    } catch (error) {
      console.error("Fetch Public Data Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchPublicProject();
  }, [fetchPublicProject]);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#26318c]"></div>
      </div>
    );
  }

  if (!reportData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500 bg-gray-50">
        ไม่พบข้อมูลโปรเจกต์นี้ หรือโปรเจกต์อาจถูกลบไปแล้ว
      </div>
    );
  }

  const { userData, currentViewData } = reportData;

  return (
    <div className="min-h-screen bg-white py-8 sm:py-16 px-4 sm:px-6 flex justify-center font-sans">
      <div className="max-w-[1000px] w-full flex flex-col gap-10 sm:gap-14 relative">
        
        {/*  Header*/}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-6 border-b border-gray-100 mt-10 sm:mt-0">
          <ProfileCard
            imageUrl={userData.avatarUrl || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbH81GnvBPAOl6QGuKAGQzFSvy-cfuht7Y9Q&s"}
            name={userData.name || "Unknown User"}
            position="Software Engineer" // สามารถเพิ่มใน DB ได้ถ้าต้องการ
          />
          <div className="shrink-0 w-full sm:w-auto flex justify-start sm:justify-end">
            <GradeCard
              point={currentViewData.score}
              grade={currentViewData.grade}
            />
          </div>
        </div>

        {/* Insight*/}
        <div className="w-full">
          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 sm:p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 text-gray-300 pointer-events-none">
              <Sparkles className="w-5 h-5" strokeWidth={1.2} />
            </div>
            <DescribeCard describe={currentViewData.insight} />
          </div>
        </div>

        {/* Skill Analysis*/}
        <div className="w-full">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Skill Analysis 
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {currentViewData.metrics?.length > 0 ? (
              currentViewData.metrics.map((skill: any, idx: number) => (
                <PointCard
                  key={idx}
                  topic={skill.skill_name}
                  explain={SKILL_DESCRIPTIONS[skill.skill_name] || "ทักษะด้านการพัฒนาซอฟต์แวร์"}
                  point={skill.points}
                  iconUrl={SKILL_ICONS[skill.skill_name]}
                />
              ))
            ) : (
              <div className="col-span-full bg-white border border-gray-100 rounded-2xl p-8 text-center text-gray-400 text-sm">
                โปรเจกต์นี้ยังไม่ได้รับการประเมิน หรืออยู่ระหว่างการประมวลผล
              </div>
            )}
          </div>
        </div>

        {/* Main Tech Stack */}
        <div className="w-full">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Main Stack
          </h3>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
            <div className="flex flex-wrap gap-3 sm:gap-4">
              {currentViewData.languages?.length > 0 ? (
                currentViewData.languages.map((lang: any, idx: number) => (
                  <TechStackCard key={idx} name={lang.skill_name} />
                ))
              ) : (
                <p className="text-sm text-gray-400 w-full py-1">
                  ไม่พบข้อมูลภาษาที่ใช้ในโปรเจกต์นี้
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Verified Sources */}
        <div className="w-full">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Verified Source
          </h3>
          <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)]">
            <ul className="flex flex-col gap-4 text-sm text-gray-600">
              {currentViewData.sources?.length > 0 ? (
                currentViewData.sources.map((source: any, idx: number) => (
                  <li
                    key={idx}
                    className={`flex items-start sm:items-center gap-2 flex-wrap group ${idx > 0 ? "border-t border-gray-50 pt-4" : ""}`}
                  >
                    <span className="font-semibold text-gray-900 group-hover:text-[#26318c] transition-colors">
                      {source.name}
                    </span>
                    {source.url !== "#" && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-gray-400 hover:text-[#26318c] transition-colors"
                        aria-label={`Link to ${source.name}`}
                      >
                        <ExternalLinkIcon />
                      </a>
                    )}
                    <span className="text-gray-300 mx-1 hidden sm:inline">•</span>
                    <span className="text-gray-500 line-clamp-1">{source.desc}</span>
                  </li>
                ))
              ) : (
                <li className="text-gray-400">ไม่มีข้อมูล Source Code</li>
              )}
            </ul>
          </div>
        </div>
        
      </div>
    </div>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      className="inline-block w-4 h-4 ml-0.5 align-text-bottom transition-colors"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
      />
    </svg>
  );
}
