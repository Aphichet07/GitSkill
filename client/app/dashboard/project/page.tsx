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
  Sparkles,
  GitPullRequestDraft,
  Calendar,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { ProjectData, ScoreAnalysis, ProjectInsight } from "../project/insight.types";
import { SCORE_METRICS } from "../project/insight.types";


function GradeBadge({ grade }: { grade: string | undefined }) {
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
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-1.5 rounded-full ${color} transition-all duration-500`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}


function InsightPage() {
  const router = useRouter();

  const [insights, setInsights]             = useState<ProjectInsight[]>([]);
  const [pageLoading, setPageLoading]       = useState(true);
  const [error, setError]                   = useState("");
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUserId, setCurrentUserId]   = useState<number | null>(null);
  const [expandedId, setExpandedId]         = useState<string | null>(null);

  //ออด check
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res = await axios.get("http://localhost:8000/auth/status", {
          withCredentials: true,
        });
        if (res.data.isAuthenticated) {
          const userId =
            res.data.user?.id || res.data.userId || res.data.user?.userId;
          setCurrentUserId(userId);
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

  //load อยากให้เป็นแบบ paralel
  const loadAllInsights = async () => {
    try {
      setPageLoading(true);
      setError("");

      const projectRes = await axios.get("http://localhost:8000/project/", {
        params: { userId: currentUserId },
        withCredentials: true,
      });
      const projects: ProjectData[] = projectRes.data.data ?? [];

      setInsights(
        projects.map((p) => ({
          project: p,
          analysis: null,
          loading: !!p.isAnalyzed,
          analyzing: false,
        })),
      );
      setPageLoading(false);

      await Promise.allSettled(
        projects
          .filter((p) => p.isAnalyzed)
          .map((p) => fetchScoreForProject(p._id)),
      );
    } catch (err: any) {
      console.error("Load Insights Error:", err);
      setError("ไม่สามารถดึงข้อมูล Insights ได้ กรุณาลองใหม่อีกครั้ง");
      setPageLoading(false);
    }
  };

  const fetchScoreForProject = async (projectId: string) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/score/${projectId}/analyze`,
        { params: { userId: currentUserId }, withCredentials: true },
      );
      const analysis: ScoreAnalysis | null = res.data.success ? res.data.data : null;
      setInsights((prev) =>
        prev.map((item) =>
          item.project._id === projectId
            ? { ...item, analysis, loading: false }
            : item,
        ),
      );
    } catch {
      setInsights((prev) =>
        prev.map((item) =>
          item.project._id === projectId ? { ...item, loading: false } : item,
        ),
      );
    }
  };

  // ── Analyze handler ───────────────────────────────────────────────────────
  const handleAnalyze = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setInsights((prev) =>
      prev.map((item) =>
        item.project._id === projectId ? { ...item, analyzing: true } : item,
      ),
    );
    try {
      await axios.post(
        `http://localhost:8000/score/group/${projectId}`,
        { userId: currentUserId },
        { withCredentials: true },
      );
      setInsights((prev) =>
        prev.map((item) =>
          item.project._id === projectId
            ? {
                ...item,
                analyzing: false,
                loading: true,
                project: { ...item.project, isAnalyzed: true },
              }
            : item,
        ),
      );
      await fetchScoreForProject(projectId);
      setExpandedId(projectId);
    } catch (err: any) {
      console.error("Analyze Error:", err);
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "เกิดข้อผิดพลาดในการวิเคราะห์โปรเจกต์",
      );
      setInsights((prev) =>
        prev.map((item) =>
          item.project._id === projectId ? { ...item, analyzing: false } : item,
        ),
      );
    }
  };

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  //คอดสกอร์เฉลี่ย
  const analyzedInsights = insights.filter((i) => i.analysis !== null);
  const avgScore =
    analyzedInsights.length > 0
      ? Math.round(
          analyzedInsights.reduce((s, i) => s + (i.analysis?.final_score ?? 0), 0) /
            analyzedInsights.length,
        )
      : 0;

  return (
    <div className="max-w-8xl">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#26318c]">My Projects</h1>
        <p className="text-gray-500 mt-2">
         see all your project insights in one place. Click on any project card to view detailed analysis and scores. Start analyzing your projects to unlock AI-powered insights and improve your code quality
        </p>
      </header>

      {/* Summary stat cards */}
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
                  {analyzedInsights.length > 0 ? `${avgScore}/100` : "—"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main panel */}
      <div className="bg-white p-8 rounded-3xl border border-[#eaeaea] shadow-sm min-h-[31.25rem] flex flex-col">

        {/* Loading */}
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

        {/* Empty */}
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
              onClick={() => router.push("/dashboard/project")}
              className="bg-[#26318c] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#1a2366] transition-all shadow-md"
            >
              ไปที่ Projects
            </Button>
          </div>
        )}

        {/* Insight grid */}
        {!pageLoading && !error && insights.length > 0 && (
          <>
            {/* Section*/}
            <div className="flex justify-between items-end mb-6 pb-4">
              <h2 className="text-xl font-semibold text-slate-800">
                All Insights{" "}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({insights.length})
                </span>
              </h2>
            </div>

            {/* column grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {insights.map(({ project, analysis, loading, analyzing }) => {
                const isExpanded = expandedId === project._id;

                return (
                  <div key={project._id} className="flex flex-col">
                    {/*projcet card */}
                    <Card
                      className="hover:border-[#26318c]/40 hover:shadow-md transition-all rounded-2xl border-gray-200 flex flex-col cursor-pointer relative"
                      onClick={() => router.push(`/dashboard/project/${project._id}`)}
                    >
                      {/* Grade badge */}
                      <div className="absolute top-4 right-4 z-10">
                        {loading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#26318c]" />
                        ) : analysis ? (
                          <GradeBadge grade={analysis.grade} />
                        ) : (
                          <Badge variant="secondary" className="text-gray-500 px-3 py-1 font-medium">
                            Pending
                          </Badge>
                        )}
                      </div>

                      <CardHeader className="pb-3">
                        {/* Folder icon */}
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#26318c] mb-3">
                          <FolderGit2 className="w-5 h-5" />
                        </div>

                        {/* Project name */}
                        <CardTitle
                          className="text-xl font-bold text-slate-800 truncate pr-16"
                          title={project.groupName}
                        >
                          {project.groupName}
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="pb-4 flex-1">
                        <div className="flex flex-col gap-3 text-sm text-gray-600">
                          {/* Repo count */}
                          <div className="flex items-center gap-2">
                            <GitPullRequestDraft className="w-4 h-4 text-gray-400" />
                            <span>รวม {project.repos?.length ?? 0} Repositories</span>
                          </div>

                          {/* Date */}
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span>สร้างเมื่อ: {formatDate(project.createdAt)}</span>
                          </div>

                          {/* Score pill */}
                          {analysis && (
                            <div className="flex items-center gap-2 mt-1">
                              <BarChart3 className="w-4 h-4 text-gray-400" />
                              <span className="font-semibold text-[#26318c]">
                                {analysis.final_score}
                                <span className="font-normal text-gray-400 text-xs ml-0.5">/100</span>
                              </span>
                              <span className="text-gray-400 text-xs truncate flex-1">
                                — {analysis.insight}
                              </span>
                            </div>
                          )}

                          {/* Pending notice */}
                          {!loading && !analysis && (
                            <div className="flex items-center gap-2 text-gray-400 mt-1">
                              <AlertCircle className="w-4 h-4 shrink-0" />
                              <span className="text-xs">ยังไม่ได้วิเคราะห์</span>
                            </div>
                          )}
                        </div>
                      </CardContent>

                      {/* Footer buttons */}
                      <CardFooter
                        className="pt-4 border-t border-gray-100 mt-auto flex gap-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {/*toggle */}
                        <Button
                          variant="ghost"
                          className="flex-1 text-gray-600 rounded-xl hover:bg-blue-50/50 hover:text-[#26318c]"
                          disabled={!analysis}
                          onClick={(e) => toggleExpand(project._id, e)}
                        >
                          {isExpanded ? (
                            <>
                              <ChevronUp className="w-4 h-4 mr-1" /> ย่อ
                            </>
                          ) : (
                            <>
                              <ChevronDown className="w-4 h-4 mr-1" /> รายละเอียด
                            </>
                          )}
                        </Button> {/* }

                        {/* Analyze */}
                        <Button
                          className="flex-1 bg-[#26318c] hover:bg-[#1a2366] rounded-xl"
                          disabled={analyzing || loading}
                          onClick={(e) => handleAnalyze(project._id, e)}
                        >
                          {analyzing ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                              Analysing...
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4 mr-2" />
                              {analysis ? "Re-Analyze" : "Analyze AI"}
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>


                    {isExpanded && analysis && (
                      <div className="mt-2 p-5 bg-slate-50 border border-gray-200 rounded-2xl">

                        {/* Score breakdown */}
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                          Score Breakdown
                        </p>
                        <div className="grid grid-cols-1 gap-y-3 mb-5">
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

                        {/* Detailed stat chips */}
                        {analysis.detailed_stats && (
                          <>
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                              Detailed Stats
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {analysis.detailed_stats.hardcodedSecrets !== undefined && (
                                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                                  analysis.detailed_stats.hardcodedSecrets > 0
                                    ? "bg-red-50 text-red-600"
                                    : "bg-green-50 text-green-600"
                                }`}>
                                  <ShieldCheck className="w-3 h-3" />
                                  Secrets: {analysis.detailed_stats.hardcodedSecrets}
                                </span>
                              )}
                              {analysis.detailed_stats.nestedLoopsO2 !== undefined && (
                                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                                  (analysis.detailed_stats.nestedLoopsO2 ?? 0) > 3
                                    ? "bg-yellow-50 text-yellow-700"
                                    : "bg-green-50 text-green-600"
                                }`}>
                                  <Zap className="w-3 h-3" />
                                  Nested loops: {analysis.detailed_stats.nestedLoopsO2}
                                </span>
                              )}
                              {analysis.detailed_stats.leftoverLogs !== undefined && (
                                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                                  (analysis.detailed_stats.leftoverLogs ?? 0) > 5
                                    ? "bg-orange-50 text-orange-600"
                                    : "bg-green-50 text-green-600"
                                }`}>
                                  <FileCode2 className="w-3 h-3" />
                                  Logs: {analysis.detailed_stats.leftoverLogs}
                                </span>
                              )}
                              {analysis.detailed_stats.commentRatioPercent !== undefined && (
                                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium bg-blue-50 text-blue-600">
                                  <BookOpen className="w-3 h-3" />
                                  Comments: {analysis.detailed_stats.commentRatioPercent}%
                                </span>
                              )}
                              {analysis.detailed_stats.massiveFiles !== undefined && (
                                <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
                                  (analysis.detailed_stats.massiveFiles ?? 0) > 0
                                    ? "bg-orange-50 text-orange-600"
                                    : "bg-green-50 text-green-600"
                                }`}>
                                  <FolderGit2 className="w-3 h-3" />
                                  Large files: {analysis.detailed_stats.massiveFiles}
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
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