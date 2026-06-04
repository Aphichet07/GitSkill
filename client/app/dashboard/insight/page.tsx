"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  FolderGit2,
  BarChart3,
  ShieldCheck,
  Zap,
  FileCode2,
  GitMerge,
  TestTube2,
  BookOpen,
  Wrench,
  Trophy,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProjectData {
  _id: string;
  groupName: string;
  repos: any[];
  createdAt: string;
  isAnalyzed: boolean;
  grade?: string;
}

interface ScoreAnalysis {
  grade: string;
  final_score: number;
  doc_score: number;
  arch_score: number;
  test_ci_score: number;
  clean_code_score: number;
  efficiency_score: number;
  security_score: number;
  habit_score: number;
  insight: string;
  detailed_stats: {
    massiveFiles?: number;
    nestedLoopsO2?: number;
    hardcodedSecrets?: number;
    sqlInjections?: number;
    leftoverLogs?: number;
    commentRatioPercent?: number;
  };
}

interface ProjectInsight {
  project: ProjectData;
  analysis: ScoreAnalysis | null;
  loading: boolean;
}

const SCORE_METRICS = [
  { key: "doc_score",        label: "Documentation", max: 10,  icon: BookOpen,    color: "bg-blue-400"   },
  { key: "arch_score",       label: "Architecture",  max: 10,  icon: GitMerge,    color: "bg-indigo-400" },
  { key: "test_ci_score",    label: "Testing & CI",  max: 15,  icon: TestTube2,   color: "bg-cyan-400"   },
  { key: "clean_code_score", label: "Clean Code",    max: 15,  icon: FileCode2,   color: "bg-teal-400"   },
  { key: "efficiency_score", label: "Efficiency",    max: 20,  icon: Zap,         color: "bg-yellow-400" },
  { key: "security_score",   label: "Security",      max: 15,  icon: ShieldCheck, color: "bg-red-400"    },
  { key: "habit_score",      label: "Good Habits",   max: 15,  icon: Wrench,      color: "bg-purple-400" },
] as const;

// Base URL สำหรับเรียก API (ดึงจาก env หรือใช้ localhost ตอน dev)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

//คิด grade badge
function getGradeBadge(grade: string | undefined) {
  switch (grade) {
    case "S":
      return (
        <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white border-none px-3 py-1 shadow-sm font-bold">
          <Trophy className="w-3 h-3 mr-1" /> Tier S
        </Badge>
      );
    case "A":
      return (
        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-3 py-1 font-bold">
          <CheckCircle2 className="w-3 h-3 mr-1" /> Tier A
        </Badge>
      );
    case "B":
      return (
        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-3 py-1 font-bold">
          Tier B
        </Badge>
      );
    case "C":
      return (
        <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none px-3 py-1 font-bold">
          Tier C
        </Badge>
      );
    default:
      return null;
  }
}

function ScoreBar({ value, max, color }: { value: number; max: number; color: string }) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-1.5 rounded-full ${color} transition-all duration-500`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}

function InsightPage() {
  const router = useRouter();

  const [insights, setInsights]           = useState<ProjectInsight[]>([]);
  const [pageLoading, setPageLoading]     = useState(true);
  const [error, setError]                 = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [expandedId, setExpandedId]       = useState<string | null>(null);

  // เช็ค login
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await axios.get<{isAuthenticated: boolean; user?: {id?: number; userId?: number}; userId?: number}>(
          `${API_BASE_URL}/auth/status`, 
          { withCredentials: true }
        );
        if (res.data.isAuthenticated) {
          const userId = res.data.user?.id || res.data.userId || res.data.user?.userId;
          setCurrentUserId(userId ?? null);
        } else {
          setCurrentUserId(null);
        }
      } catch (err) {
        console.error("Auth Status Error:", err);
        setCurrentUserId(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (!isCheckingAuth && currentUserId !== null) {
      loadAllInsights();
    } else if (!isCheckingAuth && currentUserId === null) {
      setInsights([]);
      setPageLoading(false);
    }
  }, [currentUserId, isCheckingAuth]);

  //เอาโปรเจคมา
  const loadAllInsights = async () => {
    try {
      setPageLoading(true);
      setError("");

      const projectRes = await axios.get<{ data: ProjectData[] }>(
        `${API_BASE_URL}/project/`, 
        {
          params: { userId: currentUserId },
          withCredentials: true,
        }
      );
      const projects: ProjectData[] = projectRes.data.data ?? [];

      // Render
      setInsights(
        projects.map((p) => ({ project: p, analysis: null, loading: !!p.isAnalyzed })),
      );
      setPageLoading(false);

      //เอาข้อมูลจากที่ analyze มา
      await Promise.allSettled(
        projects
          .filter((p) => p.isAnalyzed)
          .map(async (p) => {
            try {
              // แก้ไข Type ตรงนี้ด้วยเช่นกัน
              const res = await axios.get<{ success: boolean; data: ScoreAnalysis }>(
                `${API_BASE_URL}/score/${p._id}/analyze`,
                { params: { userId: currentUserId }, withCredentials: true },
              );
              
              const analysis: ScoreAnalysis | null = res.data.success ? res.data.data : null;

              setInsights((prev) => prev.map((item) => 
                item.project._id === p._id ? { ...item, analysis, loading: false } : item,
              ));
            } catch {
              setInsights((prev) => prev.map((item) =>
                  item.project._id === p._id ? { ...item, loading: false }: item,
              ));
            }
          }),
      );
    } catch (err: any) {
      console.error("Load Insights Error:", err);
      setError("ไม่สามารถดึงข้อมูล Insights ได้ กรุณาลองใหม่อีกครั้ง");
      setPageLoading(false);
    }
  };

  //คำนวณโปรเจคที่วิเคราะห์แล้ว และคะแนนเฉลี่ย
  const analyzedInsights = insights.filter((i) => i.analysis !== null);
  const avgScore =
    analyzedInsights.length > 0
      ? Math.round(
          analyzedInsights.reduce((s, i) => s + (i.analysis?.final_score ?? 0), 0) /
            analyzedInsights.length,
        )
      : 0;

  const toggleExpand = (id: string) =>
    setExpandedId((prev) => (prev === id ? null : id));

  return (
    <div className="max-w-8xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#26318c]">My Insights</h1>
        <p className="text-gray-500 mt-2">
          ดูภาพรวมผลการวิเคราะห์โค้ดในแต่ละโปรเจกต์ของคุณแบบละเอียด
        </p>
      </header>

      {!pageLoading && !error && insights.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="rounded-2xl border-[#eaeaea] shadow-sm">
            <CardContent className="flex items-center gap-4 py-5 px-6">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-[#26318c] shrink-0">
                <FolderGit2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">โปรเจกต์ทั้งหมด</p>
                <p className="text-2xl font-bold text-slate-800">{insights.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[#eaeaea] shadow-sm">
            <CardContent className="flex items-center gap-4 py-5 px-6">
              <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center text-green-600 shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">วิเคราะห์แล้ว</p>
                <p className="text-2xl font-bold text-slate-800">{analyzedInsights.length}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-[#eaeaea] shadow-sm">
            <CardContent className="flex items-center gap-4 py-5 px-6">   
              <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-gray-500">คะแนนเฉลี่ย</p>
                <p className="text-2xl font-bold text-slate-800">
                  {analyzedInsights.length > 0 ? `${avgScore}/100` : "-"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="bg-white p-8 rounded-3xl border border-[#eaeaea] shadow-sm min-h-125 flex flex-col">

      {/*loading*/}
        {pageLoading && (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26318c] mb-4" />
            <p className="text-gray-500">กำลังโหลดข้อมูล Insights...</p>
          </div>
        )}

        {/* Error */}
        {!pageLoading && error && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <div className="text-red-500 mb-4 bg-red-50 p-4 rounded-full">
              <BarChart3 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">เกิดข้อผิดพลาด</h3>
            <p className="text-gray-500 mt-2">{error}</p>
            <Button onClick={loadAllInsights} className="mt-4 bg-[#26318c] hover:bg-[#1a2366]">
              ลองใหม่อีกครั้ง
            </Button>
          </div>
        )}

        {/* Empty state */}
        {!pageLoading && !error && insights.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <BarChart3 className="w-10 h-10 text-[#26318c]" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-slate-800">ยังไม่มีข้อมูล Insights</h2>
            <p className="text-gray-500 mb-6 max-w-md">
              คุณยังไม่มีโปรเจกต์ หรือยังไม่ได้วิเคราะห์โปรเจกต์ใดๆ
              กลับไปที่หน้า Projects เพื่อเริ่มวิเคราะห์ได้เลย
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-[#26318c] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#1a2366] transition-all shadow-md"
            >
              ไปที่ Dashboard
            </Button>
          </div>
        )}

        {/* Insight list */}
        {!pageLoading && !error && insights.length > 0 && (
          <>
            <div className="flex justify-between items-end mb-6 pb-4">
              <h2 className="text-xl font-semibold text-slate-800">
                All Insights{" "}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({insights.length})
                </span>
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              {insights.map(({ project, analysis, loading }) => {
                const isExpanded = expandedId === project._id;

                return (
                  <Card
                    key={project._id}
                    className="rounded-2xl border-gray-200 hover:border-[#26318c]/40 hover:shadow-md transition-all"
                  >
                    {/* Top row */}
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-3">
                        {/* Left: icon + name */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#26318c] shrink-0">
                            <FolderGit2 className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <CardTitle
                              className="text-lg font-bold text-slate-800 truncate"
                              title={project.groupName}
                            >
                              {project.groupName}
                            </CardTitle>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {project.repos?.length ?? 0} repositories
                            </p>
                          </div>
                        </div>

                        {/* Right badge,expand toggle */}
                        <div className="flex items-center gap-2 shrink-0">
                          {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#26318c]" />
                          ) : analysis ? (
                            getGradeBadge(analysis.grade)
                          ) : (
                            <Badge variant="secondary" className="text-gray-400 px-3 py-1 font-medium">
                              Pending
                            </Badge>
                          )}

                          {analysis && (
                            <button
                              onClick={() => toggleExpand(project._id)}
                              className="p-1.5 text-gray-400 hover:text-[#26318c] hover:bg-blue-50 rounded-lg transition-colors"
                              title={isExpanded ? "Collapse" : "Expand"}
                            >
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4" />
                              ) : (
                                <ChevronDown className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Score pill + insight message */}
                      {analysis && (
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex items-center gap-1.5 bg-[#26318c]/5 text-[#26318c] rounded-xl px-3 py-1.5 shrink-0">
                            <BarChart3 className="w-4 h-4" />
                            <span className="text-sm font-bold">
                              {analysis.final_score}
                              <span className="font-normal text-xs text-gray-400 ml-0.5">/100</span>
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 truncate flex-1">
                            {analysis.insight}
                          </p>
                        </div>
                      )}

                      {/* Not yet analyzed*/}
                      {!loading && !analysis && (
                        <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span>
                            โปรเจกต์นี้ยังไม่ได้วิเคราะห์ ไปที่ Projects เพื่อกด Analyze
                          </span>
                        </div>
                      )}
                    </CardHeader>

                    {/* Expanded detail section */}
                    {isExpanded && analysis && (
                      <CardContent className="pt-0 pb-6">
                        <div className="border-t border-gray-100 pt-5">

                          {/*ตัวเลื่อนลงด้านล่าง*/}
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                            Score Breakdown
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 mb-6">
                            {SCORE_METRICS.map(({ key, label, max, icon: Icon, color }) => {
                              const value = analysis[key as keyof ScoreAnalysis] as number;
                              return (
                                <div key={key}>
                                  <div className="flex items-center justify-between mb-1">
                                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                                      <Icon className="w-3.5 h-3.5 text-gray-400" />
                                      {label}
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700">
                                      {value}
                                      <span className="text-xs font-normal text-gray-400">/{max}</span>
                                    </span>
                                  </div>
                                  <ScoreBar value={value} max={max} color={color} />
                                </div>
                              );
                            })}
                          </div>

                          {/* Detailed stat*/}
                          {analysis.detailed_stats && (
                            <>
                              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                Detailed Stats
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {analysis.detailed_stats.hardcodedSecrets !== undefined && (
                                  <span
                                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                                      analysis.detailed_stats.hardcodedSecrets > 0
                                        ? "bg-red-50 text-red-600"
                                        : "bg-green-50 text-green-600"
                                    }`}
                                  >
                                    <ShieldCheck className="w-3 h-3" />
                                    Hardcoded secrets: {analysis.detailed_stats.hardcodedSecrets}
                                  </span>
                                )}
                                {analysis.detailed_stats.nestedLoopsO2 !== undefined && (
                                  <span
                                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                                      (analysis.detailed_stats.nestedLoopsO2 ?? 0) > 3
                                        ? "bg-yellow-50 text-yellow-700"
                                        : "bg-green-50 text-green-600"
                                    }`}
                                  >
                                    <Zap className="w-3 h-3" />
                                    Nested loops: {analysis.detailed_stats.nestedLoopsO2}
                                  </span>
                                )}
                                {analysis.detailed_stats.leftoverLogs !== undefined && (
                                  <span
                                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                                      (analysis.detailed_stats.leftoverLogs ?? 0) > 5
                                        ? "bg-orange-50 text-orange-600"
                                        : "bg-green-50 text-green-600"
                                    }`}
                                  >
                                    <FileCode2 className="w-3 h-3" />
                                    Console.logs: {analysis.detailed_stats.leftoverLogs}
                                  </span>
                                )}
                                {analysis.detailed_stats.commentRatioPercent !== undefined && (
                                  <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-blue-50 text-blue-600">
                                    <BookOpen className="w-3 h-3" />
                                    Comment ratio: {analysis.detailed_stats.commentRatioPercent}%
                                  </span>
                                )}
                                {analysis.detailed_stats.massiveFiles !== undefined && (
                                  <span
                                    className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                                      (analysis.detailed_stats.massiveFiles ?? 0) > 0
                                        ? "bg-orange-50 text-orange-600"
                                        : "bg-green-50 text-green-600"
                                    }`}
                                  >
                                    <FolderGit2 className="w-3 h-3" />
                                    Large files: {analysis.detailed_stats.massiveFiles}
                                  </span>
                                )}
                              </div>
                            </>
                          )}

                          <div className="mt-5 flex justify-end">
                            <Button
                              variant="ghost"
                              className="text-[#26318c] hover:bg-blue-50 rounded-xl text-sm"
                              onClick={() => router.push(`/project/${project._id}`)}
                            >
                              ดูโปรเจกต์
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default InsightPage;