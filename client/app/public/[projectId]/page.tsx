"use client";

import React, { useEffect, useState, useCallback, use } from "react";
import axios from "axios";
import {
  Sparkles,
  Award,
  Activity,
  Code2,
  Link as LinkIcon,
  ChevronDown,
} from "lucide-react";

import GradeCard from "@/component/card/gradeCard";
import ProfileCard from "@/component/card/profileCard";
import DescribeCard from "@/component/card/describeCard";
import PointCard from "@/component/card/pointCard";
import TechStackCard from "@/component/card/techStackCard";

// Base URL สำหรับเรียก API (ดึงจาก env หรือใช้ localhost ตอน dev)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const SKILL_DESCRIPTIONS: Record<string, string> = {
  Documentation: "การเขียนเอกสารอธิบายโค้ดและโปรเจกต์",
  Architecture: "การออกแบบโครงสร้างระบบ",
  "Testing & CI": "การเขียนเทสและระบบ CI/CD",
  "Clean Code": "การเขียนโค้ดให้อ่านและดูแลรักษาง่าย",
  Efficiency: "ประสิทธิภาพการทำงานของระบบ",
  Security: "ความปลอดภัยของระบบ",
  "Good Habit": "พฤติกรรมการเขียนโค้ดที่ดี",
};

const SKILL_ICONS: Record<string, string> = {
  Documentation: "/badges/folder.png",
  Architecture: "/badges/coding.png",
  "Testing & CI": "/badges/exam-time.png",
  "Clean Code": "/badges/webpage.png",
  Efficiency: "/badges/lightning.png",
  Security: "/badges/cyber-security.png",
  "Good Habit": "/badges/convenience.png",
};

// ─── คอมโพเนนต์ตัวช่วยลดโค้ดซ้ำ (Section Header) ───
function SectionHeader({
  title,
  subtitle,
  icon: Icon,
}: {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
}) {
  return (
    <div className="flex items-center gap-2 mb-4">
      {Icon && <Icon className="w-4 h-4 text-gray-400" />}
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
        {title}
        {subtitle && (
          <span className="text-[#26318c] ml-1 lowercase tracking-normal">
            ({subtitle})
          </span>
        )}
      </h3>
    </div>
  );
}

export default function PublicProjectReportPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const [reportData, setReportData] = useState<any>(null);
  const [badges, setBadges] = useState<any[]>([]);
  const [repos, setRepos] = useState<any[]>([]);
  const [languages, setLanguages] = useState<any[]>([]); // ✅ เพิ่ม State สำหรับภาษา

  const [isLoading, setIsLoading] = useState(true);
  const [showAllSources, setShowAllSources] = useState(false);

  const { projectId } = use(params);

  const fetchPublicProject = useCallback(async () => {
    setIsLoading(true);
    try {
      // 1. ดึงข้อมูล Report หลัก
      const url = `${API_BASE_URL}/user/public/project/${projectId}`;
      const res = await axios.get<{ success: boolean; data: any }>(url);

      if (res.data.success) {
        const report = res.data.data;
        setReportData(report);

        // เซ็ตค่าเริ่มต้นเผื่อไว้
        if (report.badges) setBadges(report.badges);
        if (report.currentViewData?.sources)
          setRepos(report.currentViewData.sources);
        if (report.currentViewData?.languages)
          setLanguages(report.currentViewData.languages);

        let fetchedUserId = report.userData?.id;

        // 2. ดึงข้อมูล Project เพื่อเอา Repos และสกัดภาษาออกมา (Main Stack)
        try {
          const projectRes = await axios.get<{ data?: any } | any>(
            `${API_BASE_URL}/project/${projectId}`,
          );
          const projectData = projectRes.data.data || projectRes.data;

          if (projectData) {
            fetchedUserId = fetchedUserId || projectData.userId; // ✅ เก็บ userId ไปดึง Badge ต่อ

            if (projectData.repos && projectData.repos.length > 0) {
              const formattedRepos = projectData.repos.map((repo: any) => ({
                name: repo.name,
                url: repo.url || repo.html_url || "#",
                desc: repo.description || "Repository ในโปรเจกต์นี้",
              }));
              setRepos(formattedRepos);

              // ✅ สกัดภาษาจาก Repos เหมือนในหน้า Private
              const uniqueLangs = Array.from(
                new Set(
                  projectData.repos.map((r: any) => r.language).filter(Boolean),
                ),
              );
              if (uniqueLangs.length > 0) {
                setLanguages(uniqueLangs.map((lang) => ({ skill_name: lang })));
              }
            }
          }
        } catch (err) {
          console.warn("⚠️ ไม่สามารถดึงข้อมูล Repos ได้:", err);
        }

        // 3. ยิง API ขอข้อมูล Badges แยกต่างหาก โดยใช้ userId ที่ได้มาจาก Project
        if (fetchedUserId) {
          try {
            const profileRes = await axios.get<{ success: boolean; data: any }>(
              `${API_BASE_URL}/user/public/profile/${fetchedUserId}`,
            );
            if (profileRes.data.success && profileRes.data.data.badges) {
              setBadges(profileRes.data.data.badges); // ✅ เซ็ต Badges ลง State
            }
          } catch (err) {
            console.warn("⚠️ ไม่สามารถดึงข้อมูล Badges ได้:", err);
          }
        }
      }
    } catch (error) {
      console.error("❌ Fetch Public Data Error:", error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

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
        ไม่พบข้อมูลโปรเจกต์นี้ หรือโปรเจกต์อาจถูกตั้งค่าเป็นส่วนตัว
      </div>
    );
  }

  // ✅ ดึงเฉพาะ userData และ currentViewData ปล่อยให้ badges และ languages ใช้จาก State แทน
  const { userData, currentViewData } = reportData;

  // คำนวณ Sources ที่จะนำมาแสดงตาม state การพับ/ขยาย
  const visibleSources = showAllSources ? repos : repos.slice(0, 8);

  return (
    <div className="min-h-screen bg-white py-8 sm:py-16 px-4 sm:px-6 flex justify-center font-sans">
      <div className="max-w-[1100px] w-full flex flex-col gap-8 relative">
        {/* ── โซน Hero (Header & Insight) ── */}
        <div className="w-full flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-2">
            <ProfileCard
              imageUrl={
                userData?.github?.avatarUrl ||
                userData?.avatarUrl ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbH81GnvBPAOl6QGuKAGQzFSvy-cfuht7Y9Q&s"
              }
              name={userData?.github?.name || userData?.name || "Unknown User"}
              position="Software Engineer"
            />
            <div className="shrink-0 w-full sm:w-auto flex justify-start sm:justify-end">
              <GradeCard
                point={currentViewData.score}
                grade={currentViewData.grade}
              />
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 sm:p-6 relative overflow-hidden w-full">
            <div className="absolute top-0 right-0 p-3 text-gray-300 pointer-events-none">
              <Sparkles className="w-5 h-5" strokeWidth={1.2} />
            </div>
            <DescribeCard describe={currentViewData.insight} />
          </div>
        </div>

        {/* ── โซนเนื้อหา (Dashboard Layout) ── */}
        <div className="w-full flex flex-col gap-8 mt-2">
          {/* กล่องบน: Achievements, Main Stack, Skill Analysis รวมกัน */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.01)] w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* ฝั่งซ้าย: Achievements + Main Stack */}
              <div className="lg:col-span-4 flex flex-col gap-8">
                {/* Achievements */}
                <div className="w-full">
                  <SectionHeader title="Achievements" icon={Award} />
                  <div className="flex flex-wrap gap-3 w-full">
                    {badges && badges.length > 0 ? (
                      badges.map((badge: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-xl bg-gray-50 hover:bg-[#26318c]/5 hover:border-[#26318c]/20 transition-all flex-1 min-w-[80px] group"
                          title={badge.description || badge.name}
                        >
                          <img
                            src={
                              badge.iconUrl ||
                              SKILL_ICONS[badge.name] ||
                              "/badges/coding.png"
                            }
                            alt={badge.name}
                            className="w-8 h-8 mb-2 object-contain drop-shadow-sm group-hover:scale-110 transition-transform"
                          />
                          <span className="text-[10px] font-semibold text-gray-700 text-center group-hover:text-[#26318c] transition-colors leading-tight">
                            {badge.name}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="w-full text-center text-sm text-gray-400 py-4 bg-gray-50 rounded-xl border border-gray-100">
                        ยังไม่มีเหรียญรางวัลสะสม
                      </div>
                    )}
                  </div>
                </div>

                {/* Main Stack */}
                <div className="w-full">
                  <SectionHeader title="Main Stack" icon={Code2} />
                  <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                    {languages && languages.length > 0 ? (
                      languages.map((lang: any, idx: number) => (
                        <TechStackCard key={idx} name={lang.skill_name} />
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 w-full py-1">
                        ไม่พบข้อมูลภาษา
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* ฝั่งขวา: Skill Analysis */}
              <div className="lg:col-span-8 flex flex-col">
                <SectionHeader title="Skill Analysis" icon={Activity} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                  {currentViewData.metrics?.length > 0 ? (
                    currentViewData.metrics.map((skill: any, idx: number) => (
                      <PointCard
                        key={idx}
                        topic={skill.skill_name}
                        explain={
                          SKILL_DESCRIPTIONS[skill.skill_name] ||
                          "ทักษะด้านการพัฒนาซอฟต์แวร์"
                        }
                        point={skill.points}
                        iconUrl={SKILL_ICONS[skill.skill_name]}
                      />
                    ))
                  ) : (
                    <div className="col-span-full bg-gray-50 border border-gray-100 rounded-xl p-10 text-center text-gray-400 text-sm h-full flex items-center justify-center">
                      โปรเจกต์นี้ยังไม่ได้รับการประเมินด้วย AI
                      หรืออยู่ระหว่างการประมวลผล
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* กล่องล่าง: Verified Source */}
          <div className="w-full">
            <SectionHeader title="Verified Source" icon={LinkIcon} />
            <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)] w-full">
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                {repos?.length > 0 ? (
                  visibleSources.map((source: any, idx: number) => (
                    <li
                      key={idx}
                      className="flex flex-col gap-1.5 group bg-gray-50 border border-gray-100 hover:border-[#26318c]/30 hover:bg-[#26318c]/5 rounded-xl p-3 transition-all h-full"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 group-hover:text-[#26318c] transition-colors line-clamp-1">
                          {source.name}
                        </span>
                        {source.url !== "#" && (
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-gray-400 hover:text-[#26318c] transition-colors shrink-0"
                          >
                            <ExternalLinkIcon />
                          </a>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                        {source.desc}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-400 p-2 col-span-full">
                    ไม่มีข้อมูล Source Code
                  </li>
                )}
              </ul>

              {/* ปุ่มแสดงเพิ่มเติม (โชว์เฉพาะตอนที่มีรายการมากกว่า 8) */}
              {repos?.length > 8 && (
                <div className="mt-6 flex justify-center border-t border-gray-50 pt-6">
                  <button
                    onClick={() => setShowAllSources(!showAllSources)}
                    className="text-xs font-semibold text-gray-500 hover:text-[#26318c] border border-gray-200 hover:border-[#26318c] bg-white hover:bg-gray-50 px-6 py-2 rounded-full transition-all flex items-center gap-2"
                  >
                    {showAllSources
                      ? "แสดงน้อยลง"
                      : `แสดงเพิ่มเติม (${repos.length - 8} รายการ)`}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-300 ${showAllSources ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      className="inline-block w-3.5 h-3.5 ml-0.5 align-text-bottom transition-colors"
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
