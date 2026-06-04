"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import GradeCard from "@/component/card/gradeCard";
import ProfileCard from "@/component/card/profileCard";
import DescribeCard from "@/component/card/describeCard";
import PointCard from "@/component/card/pointCard";
import TechStackCard from "@/component/card/techStackCard";
import {
  Check,
  Globe,
  Loader2,
  Share2,
  Sparkles,
  Lock,
  ChevronDown,
  Award,
  Activity,
  Code2,
  Link as LinkIcon
} from "lucide-react";
import { useParams } from "next/navigation";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const SKILL_DESCRIPTIONS: Record<string, string> = {
  Documentation: "เอกสารโปรเจกต์ครบถ้วนและชัดเจน",
  Architecture: "โครงสร้างโปรเจกต์เป็นระเบียบ บำรุงรักษาง่าย",
  "Testing & CI": "มีการเขียน Test และวางท่อ CI/CD ที่ดี",
  "Clean Code": "โค้ดสะอาด อ่านง่าย ทำตาม Best Practice",
  Efficiency: "โค้ดทำงานได้รวดเร็ว จัดการทรัพยากรคุ้มค่า",
  Security: "มีความปลอดภัย ไม่มีช่องโหว่ร้ายแรง",
  "Good Habit": "มีวินัยในการ Commit และจัดการ Git",
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

function calculateGrade(score: number): string {
  if (score >= 80) return "S";
  if (score >= 65) return "A";
  if (score >= 50) return "B";
  if (score >= 35) return "C";
  return "F";
}

function SectionHeader({ title, subtitle, icon: Icon }: { title: string, subtitle?: string, icon?: React.ElementType }) {
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

function ReportPage() {
  const params = useParams();
  const publicUsername = params?.username as string;
  const isPublicView = !!publicUsername;

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const [profileData, setProfileData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [githubProfile, setGithubProfile] = useState<any>(null);

  const [isCopied, setIsCopied] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [isUpdatingVisibility, setIsUpdatingVisibility] = useState(false);

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("overall");
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [projectAnalysisData, setProjectAnalysisData] = useState<any>(null);
  const [isFetchingAnalysis, setIsFetchingAnalysis] = useState(false);

  const [showAllSources, setShowAllSources] = useState(false);

  const handleToggleVisibility = async () => {
    setIsUpdatingVisibility(true);
    setTimeout(() => {
      setIsPublic(!isPublic);
      setIsUpdatingVisibility(false);
    }, 400);
  };

  const handleShare = () => {
    if (!isPublic) return;

    let shareUrl = "";

    if (selectedProjectId === "overall") {
      const usernameToShare = githubProfile?.username || userData?.username || "unknown";
      shareUrl = `${window.location.origin}/report/${usernameToShare}`;
    } else {
      const selectedProject = projects.find((p) => p._id === selectedProjectId);
      const postgresProjectId = selectedProject?.id || selectedProject?._id;
      shareUrl = `${window.location.origin}/public/${postgresProjectId}`;
    }

    navigator.clipboard.writeText(shareUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const fetchGithubProfile = useCallback(
    async (forceRefresh = false) => {
      const GITHUB_PROFILE_CACHE_KEY = isPublicView
        ? `public_github_${publicUsername}`
        : "user_github_profile_cache";

      try {
        if (!forceRefresh) {
          const cachedData = sessionStorage.getItem(GITHUB_PROFILE_CACHE_KEY);
          if (cachedData) {
            setGithubProfile(JSON.parse(cachedData));
            return;
          }
        }

        const url = isPublicView
          ? `${API_BASE_URL}/user/public/github/profile/${publicUsername}`
          : `${API_BASE_URL}/user/github/profile`;

        // บังคับ Type ให้ Response
        const res = await axios.get<{ success: boolean; data: any }>(url, {
          withCredentials: !isPublicView,
        });

        if (res.data.success) {
          const data = res.data.data;
          setGithubProfile(data);
          sessionStorage.setItem(
            GITHUB_PROFILE_CACHE_KEY,
            JSON.stringify(data),
          );
        }
      } catch (error: any) {
        console.error("Fetch GitHub Error:", error.message);
      }
    },
    [isPublicView, publicUsername],
  );

  const fetchProfileData = useCallback(async () => {
    setIsLoadingProfile(true);
    try {
      const url = isPublicView
        ? `${API_BASE_URL}/user/public/profile/${publicUsername}`
        : `${API_BASE_URL}/user/profile`;

      const res = await axios.get<{ success: boolean; data: any }>(url, { withCredentials: !isPublicView });
      if (res.data.success) setProfileData(res.data.data);
    } catch (error: any) {
      console.error("Fetch Data Error:", error.message);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [isPublicView, publicUsername]);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await axios.get<{ data: any[] }>(`${API_BASE_URL}/project/`, {
        params: { userId: currentUserId },
        withCredentials: true,
      });
      setProjects(res.data.data || []);
    } catch (err: any) {
      console.error("Fetch Projects Error:", err);
    }
  }, [currentUserId]);

  useEffect(() => {
    if (isPublicView) {
      fetchProfileData();
      fetchGithubProfile();
      return;
    }

    const checkAuthStatus = async () => {
      try {
        const res = await axios.get<{ isAuthenticated: boolean; user?: any; userId?: number }>(
          `${API_BASE_URL}/auth/status`,
          { withCredentials: true }
        );

        if (res.data.isAuthenticated) {
          setIsAuthenticated(true);
          setUserData(res.data.user);

          const userId = res.data.user?.id || res.data.userId || res.data.user?.userId;
          setCurrentUserId(userId);

          fetchProfileData();
          fetchGithubProfile(false);
        } else {
          setIsAuthenticated(false);
          setCurrentUserId(null);
        }
      } catch (error) {
        setIsAuthenticated(false);
        setCurrentUserId(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [isPublicView, fetchProfileData, fetchGithubProfile]);

  useEffect(() => {
    setShowAllSources(false);
    
    if (selectedProjectId === "overall") {
      setProjectAnalysisData(null);
      return;
    }

    const fetchDetailedAnalysis = async () => {
      setIsFetchingAnalysis(true);
      try {
        const url = isPublicView
          ? `${API_BASE_URL}/score/public/projects/${selectedProjectId}/status`
          : `${API_BASE_URL}/score/projects/${selectedProjectId}/status`;

        const res = await axios.get<{ data?: any } | any>(url, {
          params: isPublicView ? {} : { userId: currentUserId },
          withCredentials: !isPublicView,
        });

        const responseData = res.data.data || res.data;
        setProjectAnalysisData(responseData);
      } catch (error) {
        console.error("Fetch Project Analysis Error:", error);
        setProjectAnalysisData(null);
      } finally {
        setIsFetchingAnalysis(false);
      }
    };

    fetchDetailedAnalysis();
  }, [selectedProjectId, currentUserId, isPublicView]);

  const currentViewData = useMemo(() => {
    if (selectedProjectId === "overall") {
      let overallScore = 0;
      let overallGrade = "F";

      if (profileData?.skills?.overallScore !== undefined) {
        overallScore = profileData.skills.overallScore;
        overallGrade = profileData.skills.overallGrade || calculateGrade(overallScore);
      } else if (profileData?.skills?.coreMetrics && profileData.skills.coreMetrics.length > 0) {
        const totalPoints = profileData.skills.coreMetrics.reduce(
          (sum: number, skill: any) => sum + (skill.points || 0),
          0,
        );
        overallScore = Math.round(totalPoints / profileData.skills.coreMetrics.length);
        overallGrade = calculateGrade(overallScore);
      }

      const overallSources = projects.map((p) => ({
        name: p.groupName,
        desc: `โปรเจกต์ประกอบด้วย ${p.repos?.length || 0} Repositories`,
        url: "#",
      }));

      return {
        score: overallScore,
        grade: overallGrade,
        insight:
          profileData?.insight ||
          "นักพัฒนาที่มีความถนัดด้าน Backend โดดเด่นเรื่อง Clean Code และการวางโครงสร้าง Architecture พร้อมเรียนรู้เทคโนโลยีใหม่ๆ อยู่เสมอ",
        metrics: profileData?.skills?.coreMetrics || [],
        languages: profileData?.skills?.languages || [],
        sources:
          overallSources.length > 0
            ? overallSources
            : [
                {
                  name: "GitSkill Data",
                  desc: "ข้อมูลประเมินโปรไฟล์รวม (ยังไม่มีโปรเจกต์อ้างอิง)",
                  url: "#",
                },
              ],
      };
    } else {
      const project = projects.find((p) => p._id === selectedProjectId);

      const projectSources =
        project?.repos?.map((repo: any) => ({
          name: repo.name,
          desc:
            repo.description || `Repository ในโปรเจกต์ ${project.groupName}`,
          url: repo.url || "#",
        })) || [];

      if (isFetchingAnalysis) {
        return {
          score: 0,
          grade: "...",
          insight: "กำลังดึงข้อมูลการวิเคราะห์ของโปรเจกต์นี้...",
          metrics: [],
          languages: [],
          sources: projectSources,
        };
      }

      const res = projectAnalysisData || project?.analysisResult;

      if (!project || !res || Object.keys(res).length === 0) {
        return {
          score: 0,
          grade: project?.grade || "Pending",
          insight: "โปรเจกต์นี้กำลังรอการวิเคราะห์หรือยังไม่ได้รับการประเมินผลจาก AI",
          metrics: [],
          languages: [],
          sources: projectSources,
        };
      }

      const projectMetrics = [
        {
          skill_name: "Documentation",
          points: Math.round(((res.doc_score ?? res.docScore ?? 0) / 10) * 100),
        },
        {
          skill_name: "Architecture",
          points: Math.round(((res.arch_score ?? res.archScore ?? 0) / 10) * 100),
        },
        {
          skill_name: "Testing & CI",
          points: Math.round(((res.test_ci_score ?? res.testCiScore ?? 0) / 15) * 100),
        },
        {
          skill_name: "Clean Code",
          points: Math.round(((res.clean_code_score ?? res.cleanCodeScore ?? 0) / 15) * 100),
        },
        {
          skill_name: "Efficiency",
          points: Math.round(((res.efficiency_score ?? res.efficiencyScore ?? 0) / 20) * 100),
        },
        {
          skill_name: "Security",
          points: Math.round(((res.security_score ?? res.securityScore ?? 0) / 15) * 100),
        },
        {
          skill_name: "Good Habit",
          points: Math.round(((res.habit_score ?? res.habitScore ?? 0) / 10) * 100),
        },
      ];

      const uniqueLanguages = Array.from(
        new Set(
          project.repos?.map((repo: any) => repo.language).filter(Boolean),
        ),
      );
      const projectLanguages = uniqueLanguages.map((lang) => ({
        skill_name: lang,
      }));

      return {
        score: res.final_score || res.finalScore || 0,
        grade: res.grade || "F",
        insight: res.insight || "ไม่มีข้อเสนอแนะ AI เพิ่มเติมสำหรับโปรเจกต์นี้",
        metrics: projectMetrics,
        languages: projectLanguages,
        sources: projectSources,
      };
    }
  }, [
    selectedProjectId,
    profileData,
    projects,
    projectAnalysisData,
    isFetchingAnalysis,
  ]);

  if (isCheckingAuth || isLoadingProfile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-4 font-sans text-gray-400">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-gray-300" />
        <p className="text-sm font-medium">กำลังโหลดข้อมูลโปรไฟล์...</p>
      </div>
    );
  }

  if (!isAuthenticated && !isPublicView) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 font-sans text-gray-600">
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-sm text-center max-w-sm w-full">
          <p className="font-semibold text-base text-gray-900 mb-1">
            กรุณาเข้าสู่ระบบ
          </p>
          <p className="text-xs text-gray-400 leading-relaxed">
            สิทธิ์การเข้าถึงเซสชันของคุณหมดอายุ หรือยังไม่ได้ลงชื่อเข้าใช้งาน
          </p>
        </div>
      </div>
    );
  }

  const visibleSources = showAllSources 
    ? currentViewData.sources 
    : currentViewData.sources.slice(0, 8);

  return (
    <div className="min-h-screen bg-white py-8 sm:py-16 px-4 sm:px-6 flex justify-center font-sans">
      <div className="max-w-[1100px] w-full flex flex-col gap-8 relative">
        
        {/* ── โซนควบคุม (Header Controls) ── */}
        {!isPublicView && (
          <div className="flex flex-wrap items-center justify-end gap-3 mb-2 relative z-10">
            {projects.length > 0 && (
              <div className="relative mr-auto sm:mr-4 mb-2 sm:mb-0 w-full sm:w-auto">
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold rounded-full pl-4 pr-8 py-2 focus:outline-none focus:border-[#26318c] focus:ring-1 focus:ring-[#26318c]/20 transition-all cursor-pointer min-w-[140px] w-full sm:w-auto"
                >
                  <option value="overall">ภาพรวมทั้งหมด (Overall)</option>
                  <optgroup label="โปรเจกต์ของคุณ">
                    {projects.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.groupName}
                      </option>
                    ))}
                  </optgroup>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                  <ChevronDown className="w-3.5 h-3.5" />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full transition-colors">
              <span className={`text-[11px] font-medium transition-colors ${!isPublic ? "text-gray-900" : "text-gray-400"}`}>
                <Lock className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                Private
              </span>
              <button
                onClick={handleToggleVisibility}
                disabled={isUpdatingVisibility}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${isPublic ? "bg-[#26318c]" : "bg-gray-300"}`}
                role="switch"
                aria-checked={isPublic}
              >
                <span className="sr-only">Toggle Public View</span>
                <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isPublic ? "translate-x-4" : "translate-x-0"}`} />
              </button>
              <span className={`text-[11px] font-medium transition-colors ${isPublic ? "text-[#26318c]" : "text-gray-400"}`}>
                <Globe className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                Public
              </span>
            </div>

            <button
              onClick={handleShare}
              disabled={!isPublic || isCopied}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                !isPublic
                  ? "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed opacity-60"
                  : isCopied
                    ? "bg-green-50 text-green-700 border-green-200 shadow-sm"
                    : "bg-white text-gray-700 border-gray-200 hover:border-[#26318c] hover:text-[#26318c] shadow-sm cursor-pointer"
              }`}
            >
              {isCopied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
              {isCopied ? "คัดลอกลิงก์แล้ว" : "แชร์โปรไฟล์"}
            </button>
          </div>
        )}

        {/* ── โซน Hero (โปรไฟล์และ Insight ยืดเต็มจอ) ── */}
        <div className="w-full flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <ProfileCard
              imageUrl={
                githubProfile?.avatarUrl ||
                userData?.avatarUrl ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRbH81GnvBPAOl6QGuKAGQzFSvy-cfuht7Y9Q&s"
              }
              name={
                githubProfile?.name ||
                githubProfile?.username ||
                userData?.name ||
                "Unknown User"
              }
              position="Software Engineer"
            />
            <div className="shrink-0 w-full sm:w-auto flex justify-start sm:justify-end">
              <GradeCard point={currentViewData.score} grade={currentViewData.grade} />
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
          
          <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-8 shadow-[0_2px_8px_rgba(0,0,0,0.01)] w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              <div className="lg:col-span-4 flex flex-col gap-8">
                
                {/* Achievements */}
                <div className="w-full">
                  <SectionHeader title="Achievements" icon={Award} />
                  <div className="flex flex-wrap gap-3 w-full">
                    {profileData?.badges && profileData.badges.length > 0 ? (
                      profileData.badges.map((badge: any, idx: number) => (
                        <div 
                          key={idx} 
                          className="flex flex-col items-center justify-center p-3 border border-gray-100 rounded-xl bg-gray-50 hover:bg-[#26318c]/5 hover:border-[#26318c]/20 transition-all flex-1 min-w-[80px] group"
                          title={badge.description || badge.name}
                        >
                          <img 
                            src={badge.iconUrl || SKILL_ICONS[badge.name] || "/badges/coding.png"} 
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
                    {currentViewData.languages.length > 0 ? (
                      currentViewData.languages.map((lang: any, idx: number) => (
                        <TechStackCard key={idx} name={lang.skill_name} />
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 w-full py-1">ไม่พบข้อมูลภาษา</p>
                    )}
                  </div>
                </div>

              </div>

              {/* ฝั่งขวา: Skill Analysis */}
              <div className="lg:col-span-8 flex flex-col">
                <SectionHeader 
                  title="Skill Analysis" 
                  subtitle={selectedProjectId !== "overall" ? "Project specific" : undefined} 
                  icon={Activity} 
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
                  {currentViewData.metrics.length > 0 ? (
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
                    <div className="col-span-full bg-gray-50 border border-gray-100 rounded-xl p-10 text-center text-gray-400 text-sm h-full flex items-center justify-center">
                      โปรเจกต์นี้ยังไม่ได้รับการประเมินด้วย AI หรืออยู่ระหว่างการประมวลผล
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>

          {/* กล่องล่าง */}
          <div className="w-full">
            <SectionHeader title="Verified Source" icon={LinkIcon} />
            <div className="bg-white border border-gray-100 rounded-2xl p-5 sm:p-6 shadow-[0_2px_8px_rgba(0,0,0,0.01)] w-full">
              <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600">
                {currentViewData.sources.length > 0 ? (
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
                          <a href={source.url} target="_blank" rel="noreferrer" className="text-gray-400 hover:text-[#26318c] transition-colors shrink-0">
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
                  <li className="text-gray-400 p-2 col-span-full">ไม่มีข้อมูล Source Code</li>
                )}
              </ul>

              {/* ปุ่มแสดงเพิ่มเติม */}
              {currentViewData.sources.length > 8 && (
                <div className="mt-6 flex justify-center border-t border-gray-50 pt-6">
                  <button
                    onClick={() => setShowAllSources(!showAllSources)}
                    className="text-xs font-semibold text-gray-500 hover:text-[#26318c] border border-gray-200 hover:border-[#26318c] bg-white hover:bg-gray-50 px-6 py-2 rounded-full transition-all flex items-center gap-2"
                  >
                    {showAllSources ? "แสดงน้อยลง" : `แสดงเพิ่มเติม (${currentViewData.sources.length - 8} รายการ)`}
                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAllSources ? "rotate-180" : ""}`} />
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
    <svg className="inline-block w-3.5 h-3.5 ml-0.5 align-text-bottom transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

export default ReportPage;