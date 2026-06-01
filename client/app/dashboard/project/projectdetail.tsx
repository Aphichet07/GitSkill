"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
    FolderGit2,
    Calendar,
    GitPullRequestDraft,
    Sparkles,
    CheckCircle2,
    Trash2,
    Trophy,
    X,
    AlertCircle,
    BarChart2,
    Shield,
    FileCode2,
    Zap,
    BookOpen,
    Code2,
    Clock,
    Star,
    ExternalLink,
    Lock,
    RefreshCw,
    AlertTriangle,
    Hash,
    Terminal,
    GitBranch,
    Layers,
    Activity,
    Copy,
    Info,
    TrendingUp,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DeleteCard from "@/component/card/DeleteCard";
import { useNotification } from "@/context/NotificationContext";

import ScoreBar from "./scorebar";
import LanguageBar from "./languagebar";
import { getCodeStatStyle } from "./utils";
import { ProjectData, AnalysisData, ModalTab } from "./type";

const GRADE_CONFIG: Record<string, { from: string; to: string }> = {
  S: { from: "from-yellow-400", to: "to-amber-500" },
  A: { from: "from-emerald-400", to: "to-green-600" },
  B: { from: "from-blue-400", to: "to-blue-600" },
  C: { from: "from-orange-400", to: "to-orange-500" },
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectData | null;
  analysisData: AnalysisData | null;
  isLoading: boolean;
}

export default function ProjectDetailModal({ isOpen, onClose, project, analysisData, isLoading }: Props) {
  const [activeTab, setActiveTab] = useState<ModalTab>("overview");

  useEffect(() => {
    if (isOpen) setActiveTab("overview");
  }, [isOpen, project?._id]);

  if (!isOpen || !project) return null;

  const isProcessing = analysisData?.status === "processing";
  const isCompleted = !!analysisData && !isProcessing && analysisData.final_score !== undefined;
  const gradeConf = GRADE_CONFIG[analysisData?.grade ?? ""] ?? null;

  const metrics = [
    { label: "Documentation", score: analysisData?.doc_score ?? 0, max: 10, icon: BookOpen },
    { label: "Architecture", score: analysisData?.arch_score ?? 0, max: 10, icon: Layers },
    { label: "Testing & CI/CD", score: analysisData?.test_ci_score ?? 0, max: 15, icon: CheckCircle2 },
    { label: "Clean Code", score: analysisData?.clean_code_score ?? 0, max: 15, icon: Code2 },
    { label: "Efficiency", score: analysisData?.efficiency_score ?? 0, max: 20, icon: Zap },
    { label: "Security", score: analysisData?.security_score ?? 0, max: 15, icon: Shield },
    { label: "Good Habits", score: analysisData?.habit_score ?? 0, max: 15, icon: Activity },
  ];

  const stats = analysisData?.detailed_stats;
  const languages = stats?.languages ?? {};
  const duplicatePercent = stats?.duplicatePercent ?? 0;

  const getInsightConfig = (insight?: string) => {
    if (!insight) return { container: "bg-blue-50 border-blue-100", icon: Info, iconColor: "text-blue-500", textColor: "text-blue-800" };
    if (insight.includes("อันตราย") || insight.includes("ระวัง")) return { container: "bg-red-50 border-red-100", icon: AlertTriangle, iconColor: "text-red-500", textColor: "text-red-800" };
    if (insight.includes("ลืม") || insight.includes("ควร") || insight.includes("น้อยกว่า") || insight.includes("อ่านยาก")) return { container: "bg-amber-50 border-amber-100", icon: AlertCircle, iconColor: "text-amber-500", textColor: "text-amber-800" };
    return { container: "bg-emerald-50 border-emerald-100", icon: CheckCircle2, iconColor: "text-emerald-500", textColor: "text-emerald-800" };
  };

  const insightCfg = getInsightConfig(analysisData?.insight);
  const InsightIcon = insightCfg.icon;

  const TABS: { key: ModalTab; label: string }[] = [
    { key: "overview", label: "ภาพรวม" },
    { key: "code", label: "คุณภาพโค้ด" },
    { key: "repos", label: `Repos (${project.repos?.length ?? 0})` },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 pt-5 sm:pt-6 pb-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <FolderGit2 className="w-5 h-5 text-[#26318c]" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-800 truncate">{project.groupName}</h2>
              <p className="text-xs sm:text-sm text-gray-500">{project.repos?.length ?? 0} repositories</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors ml-2 shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Score Banner */}
        {isCompleted && (
          <div className="shrink-0 px-5 sm:px-6 py-4 bg-gradient-to-r from-slate-50 to-gray-50 border-b border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-4">
                {gradeConf ? (
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradeConf.from} ${gradeConf.to} flex items-center justify-center shadow-md`}>
                    <span className="text-2xl font-black text-white">{analysisData?.grade}</span>
                  </div>
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <span className="text-2xl font-black text-gray-400">?</span>
                  </div>
                )}
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black text-slate-800">{analysisData?.final_score}</span>
                    <span className="text-sm text-gray-400 font-normal">/100</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">คะแนนรวม Portfolio</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0 px-5 sm:px-6 pt-3 shrink-0 bg-white border-b border-gray-100">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`px-3 sm:px-5 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === key ? "text-[#26318c] border-[#26318c]" : "text-gray-400 border-transparent hover:text-gray-600"}`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#26318c] mb-4" />
              <p className="text-sm text-gray-500">กำลังดึงข้อมูลการวิเคราะห์...</p>
            </div>
          )}

          {!isLoading && isProcessing && (
            <div className="flex flex-col items-center justify-center py-16">
              <RefreshCw className="w-8 h-8 text-[#26318c] animate-spin mb-4" />
              <h3 className="text-base font-semibold text-slate-800 mb-2">กำลังวิเคราะห์โปรเจกต์</h3>
            </div>
          )}

          {!isLoading && isCompleted && (
            <>
              {activeTab === "overview" && (
                <div className="space-y-5">
                  {analysisData?.insight && (
                    <div className={`flex gap-3 p-4 rounded-2xl border ${insightCfg.container}`}>
                      <InsightIcon className={`w-5 h-5 shrink-0 mt-0.5 ${insightCfg.iconColor}`} />
                      <p className={`text-sm leading-relaxed ${insightCfg.textColor}`}>{analysisData.insight}</p>
                    </div>
                  )}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-[#26318c]" /> คะแนนแต่ละด้าน</h3>
                    <div className="space-y-3.5">{metrics.map(m => <ScoreBar key={m.label} {...m} />)}</div>
                  </div>
                  {Object.keys(languages).length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2"><Code2 className="w-4 h-4 text-[#26318c]" /> ภาษาที่ใช้</h3>
                      <div className="bg-gray-50 rounded-2xl p-4"><LanguageBar languages={languages} /></div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "code" && (
                <div className="space-y-5">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-[#26318c]" /> สถิติคุณภาพโค้ด</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      <div className={`rounded-2xl border p-3.5 ${duplicatePercent > 10 ? "bg-red-50 border-red-100 text-red-700" : "bg-emerald-50 border-emerald-100 text-emerald-700"}`}>
                        <div className="flex items-center gap-1.5 mb-1.5"><Copy className="w-3.5 h-3.5 opacity-70" /><span className="text-xs font-medium opacity-80">โค้ดซ้ำซ้อน</span></div>
                        <div className="text-2xl font-black">{duplicatePercent}%</div>
                      </div>
                      <div className={`rounded-2xl border p-3.5 ${getCodeStatStyle(stats?.massiveFiles ?? 0, 2, 5)}`}>
                        <div className="flex items-center gap-1.5 mb-1.5"><FileCode2 className="w-3.5 h-3.5 opacity-70" /><span className="text-xs font-medium opacity-80">ไฟล์ใหญ่</span></div>
                        <div className="text-2xl font-black">{stats?.massiveFiles ?? 0}</div>
                      </div>
                      <div className={`rounded-2xl border p-3.5 ${getCodeStatStyle(stats?.nestedLoopsO2 ?? 0, 2, 5)}`}>
                        <div className="flex items-center gap-1.5 mb-1.5"><RefreshCw className="w-3.5 h-3.5 opacity-70" /><span className="text-xs font-medium opacity-80">ลูปซ้อนลูป</span></div>
                        <div className="text-2xl font-black">{stats?.nestedLoopsO2 ?? 0}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "repos" && (
                <div className="space-y-3">
                  {project.repos?.map(repo => (
                    <a key={repo.id} href={repo.url} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3.5 p-4 bg-gray-50 hover:bg-blue-50 border border-transparent rounded-2xl group">
                      <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shrink-0"><GitBranch className="w-4 h-4 text-gray-400" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2"><h4 className="text-sm font-semibold truncate">{repo.name}</h4><ExternalLink className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100" /></div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}