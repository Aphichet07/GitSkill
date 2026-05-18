"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Trophy,
  Activity,
  FileText,
  Layers,
  TestTube,
  Code,
  Zap,
  ShieldCheck,
  Brain,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProjectAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  analysisData: any;
}

export function ProjectAnalysisModal({
  isOpen,
  onClose,
  project,
  analysisData,
}: ProjectAnalysisModalProps) {
  if (!project) return null;

  type ColorTheme = {
    text: string;
    bg: string;
    lightBg: string;
    border: string;
  };
  const themes = {
    blue: {
      text: "text-blue-600",
      bg: "bg-blue-500",
      lightBg: "bg-blue-50",
      border: "hover:border-blue-300",
    },
    purple: {
      text: "text-purple-600",
      bg: "bg-purple-500",
      lightBg: "bg-purple-50",
      border: "hover:border-purple-300",
    },
    pink: {
      text: "text-pink-600",
      bg: "bg-pink-500",
      lightBg: "bg-pink-50",
      border: "hover:border-pink-300",
    },
    emerald: {
      text: "text-emerald-600",
      bg: "bg-emerald-500",
      lightBg: "bg-emerald-50",
      border: "hover:border-emerald-300",
    },
    amber: {
      text: "text-amber-600",
      bg: "bg-amber-500",
      lightBg: "bg-amber-50",
      border: "hover:border-amber-300",
    },
    red: {
      text: "text-rose-600",
      bg: "bg-rose-500",
      lightBg: "bg-rose-50",
      border: "hover:border-rose-300",
    },
    indigo: {
      text: "text-indigo-600",
      bg: "bg-indigo-500",
      lightBg: "bg-indigo-50",
      border: "hover:border-indigo-300",
    },
  };

  const getGradeStyle = (grade: string) => {
    switch (grade) {
      case "S":
        return "bg-gradient-to-br from-yellow-300 to-yellow-500 text-yellow-950 shadow-[0_0_40px_rgba(250,204,21,0.4)] border-yellow-200";
      case "A":
        return "bg-gradient-to-br from-green-400 to-emerald-600 text-white shadow-[0_0_40px_rgba(16,185,129,0.3)] border-emerald-400";
      case "B":
        return "bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-[0_0_30px_rgba(59,130,246,0.3)] border-blue-400";
      case "C":
        return "bg-gradient-to-br from-orange-400 to-orange-600 text-white shadow-[0_0_30px_rgba(249,115,22,0.3)] border-orange-400";
      case "F":
        return "bg-gradient-to-br from-red-500 to-rose-700 text-white shadow-[0_0_30px_rgba(225,29,72,0.3)] border-rose-500";
      default:
        return "bg-slate-200 text-slate-700";
    }
  };

  const renderMetricCard = (
    label: string,
    score: number,
    maxScore: number,
    desc: string,
    Icon: any,
    theme: ColorTheme,
  ) => {
    const percentage = Math.min(((score || 0) / maxScore) * 100, 100);

    return (
      <div
        className={`group relative bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 hover:shadow-md ${theme.border}`}
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl ${theme.lightBg} ${theme.text} transition-transform group-hover:scale-110`}
            >
              <Icon className="w-5 h-5" />
            </div>
            <div className="pt-1">
              <h4 className="font-bold text-slate-800 leading-none">{label}</h4>
              <p className="text-[11px] font-medium text-slate-400 mt-2 uppercase tracking-wider">
                {desc}
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className={`font-black text-2xl leading-none ${theme.text}`}>
              {score || 0}
            </div>
            <div className="text-[10px] uppercase font-bold text-slate-400 mt-1">
              / {maxScore}
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${theme.bg} rounded-full transition-all duration-1000 ease-out relative`}
            style={{ width: `${percentage}%` }}
          >
            <div className="absolute top-0 right-0 bottom-0 w-8 bg-linear-to-r from-transparent to-white/30 rounded-full" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl! w-[90vw] bg-slate-50/80 backdrop-blur-xl rounded-[2rem] overflow-hidden p-0 border border-white/40 shadow-2xl">
        <DialogHeader className="px-8 pt-8 pb-4 bg-white/50 border-b border-slate-200/50">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#26318c]/10 text-[#26318c] rounded-2xl flex items-center justify-center"></div>
              <div>
                <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                  {project.groupName}
                </DialogTitle>
                <DialogDescription className="mt-1 font-medium text-slate-500 flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Analyzed from {project.repos?.length || 0} Repositories
                </DialogDescription>
              </div>
            </div>
            <Badge
              variant="outline"
              className="px-3 py-1 bg-white border-slate-200 text-slate-600 rounded-full flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> AI
              Verified
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh] p-8 pt-6">
          {!analysisData ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-dashed border-slate-200 shadow-sm">
              <div className="relative">
                <div className="absolute inset-0 bg-[#26318c] rounded-full blur-xl opacity-20 animate-pulse"></div>
                <Activity className="w-14 h-14 text-[#26318c] relative z-10 animate-bounce" />
              </div>
              <p className="mt-6 text-slate-500 font-medium">
                กำลังโหลดผลการวิเคราะห์
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Overall Score & Grade */}
              <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-8 shadow-xl flex items-center justify-between border border-slate-800">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-72 h-72 bg-[#26318c] opacity-40 blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500 opacity-20 blur-[60px] rounded-full -translate-x-1/2 translate-y-1/2"></div>

                <div className="relative z-10">
                  <div className="flex items-center gap-2 text-blue-200 font-semibold tracking-wide text-xs mb-3 uppercase">
                    <Trophy className="w-4 h-4 text-yellow-400" />
                    Overall GitSkill Score
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-7xl font-black text-white tracking-tighter">
                      {analysisData.final_score || analysisData.finalScore || 0}
                    </span>
                    <span className="text-xl text-slate-400 font-bold">
                      / 100
                    </span>
                  </div>
                </div>

                {/* Grade Badge */}
                {analysisData.grade && (
                  <div className="relative z-10 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] mb-2">
                      FINAL GRADE
                    </span>
                    <div
                      className={`w-24 h-24 rounded-full flex items-center justify-center text-5xl font-black border-4 ${getGradeStyle(analysisData.grade)}`}
                    >
                      {analysisData.grade}
                    </div>
                  </div>
                )}
              </div>

              {/* Metrics Grid  */}
              <div>
                <div className="flex items-center gap-2 mb-4 px-1">
                  <div className="w-1.5 h-5 bg-[#26318c] rounded-full"></div>
                  <h3 className="text-lg font-bold text-slate-800">
                    การประเมิน 7 มิติ
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {renderMetricCard(
                    "Documentation",
                    analysisData.doc_score,
                    10,
                    "README, License",
                    FileText,
                    themes.blue,
                  )}
                  {renderMetricCard(
                    "Architecture",
                    analysisData.arch_score,
                    10,
                    "โครงสร้าง, Lock files",
                    Layers,
                    themes.purple,
                  )}
                  {renderMetricCard(
                    "Test & CI/CD",
                    analysisData.test_ci_score,
                    15,
                    "การเขียนเทสต์และระบบออโต้",
                    TestTube,
                    themes.pink,
                  )}
                  {renderMetricCard(
                    "Clean Code",
                    analysisData.clean_code_score,
                    15,
                    "ความซ้ำซ้อนของโค้ด (JSCPD)",
                    Code,
                    themes.emerald,
                  )}
                  {renderMetricCard(
                    "Code Efficiency",
                    analysisData.efficiency_score,
                    20,
                    "ลูปซ้อนลูป O(n²), ไฟล์ยาว",
                    Zap,
                    themes.amber,
                  )}
                  {renderMetricCard(
                    "Security",
                    analysisData.security_score,
                    15,
                    "ดักรหัสผ่านหลุด, โค้ดเสี่ยง SQL Injection",
                    ShieldCheck,
                    themes.red,
                  )}

                  <div className="md:col-span-2">
                    {renderMetricCard(
                      "Developer Habits",
                      analysisData.habit_score,
                      15,
                      "สัดส่วน Comment, ลืมลบ Console.log",
                      Brain,
                      themes.indigo,
                    )}
                  </div>
                </div>
              </div>

              {/* Insight*/}
              {analysisData.insight && (
                <div className="mt-8 bg-slate-900 rounded-2xl p-1 shadow-md border border-slate-800">
                  <div className="bg-slate-800/50 rounded-t-xl px-4 py-2 flex items-center gap-2 border-b border-slate-700/50">
                    <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <span className="ml-2 text-xs font-mono text-slate-400 flex items-center gap-2">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />{" "}
                      AI_Insight.log
                    </span>
                  </div>
                  <div className="p-5">
                    <p className="text-sm font-mono text-emerald-400/90 whitespace-pre-wrap leading-relaxed">
                      <span className="text-slate-500">{">"} </span>
                      {analysisData.insight}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
