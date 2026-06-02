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
  FileText,
  Layers,
  TestTube,
  Code,
  Zap,
  ShieldCheck,
  Brain,
  Sparkles,
  Loader2,
} from "lucide-react";

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

  const getGradeTextColor = (grade: string) => {
    switch (grade) {
      case "S":
        return "text-yellow-600";
      case "A":
        return "text-emerald-600";
      case "B":
        return "text-[#26318c]";
      case "C":
        return "text-orange-500";
      case "F":
        return "text-rose-500";
      default:
        return "text-gray-900";
    }
  };

  const renderMetricRow = (
    label: string,
    score: number,
    maxScore: number,
    desc: string,
    Icon: any,
  ) => {
    const percentage = Math.min(((score || 0) / maxScore) * 100, 100);

    return (
      <div className="flex flex-col sm:flex-row sm:items-center py-4 border-b border-gray-100 last:border-0 gap-3 sm:gap-6 group">
        {/* ไอคอนและชื่อ */}
        <div className="flex items-start sm:items-center gap-4 sm:w-1/3 shrink-0">
          <div className="p-2 bg-gray-50 text-gray-500 rounded-lg group-hover:text-[#26318c] group-hover:bg-blue-50/50 transition-colors">
            <Icon className="w-5 h-5" strokeWidth={1.5} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">{label}</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">{desc}</p>
          </div>
        </div>

        {/* แถบ Progress Bar */}
        <div className="flex-1 flex items-center gap-4">
          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-1000 ease-out bg-[#26318c]"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>

          {/* ตัวเลขคะแนน */}
          <div className="w-12 text-right shrink-0 flex items-baseline justify-end gap-0.5">
            <span className="text-sm font-bold text-gray-900">
              {score || 0}
            </span>
            <span className="text-[10px] text-gray-400 font-medium">
              /{maxScore}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl! w-[95vw]! md:w-[90vw]! bg-white rounded-3xl overflow-hidden p-0 border border-gray-200 shadow-xl focus:outline-none">
        {/* Header - เรียบง่าย ไม่มีสีพื้นหลังเยอะ */}
        <DialogHeader className="px-6 sm:px-8 py-6 border-b border-gray-100">
          <div className="flex justify-between items-start gap-4">
            <div className="text-left">
              <DialogTitle className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">
                {project.groupName}
              </DialogTitle>
              <DialogDescription className="mt-1.5 text-sm text-gray-500 flex items-center gap-1.5">
                <Layers className="w-4 h-4" />
                วิเคราะห์จาก {project.repos?.length || 0} Repositories
              </DialogDescription>
            </div>
            {analysisData && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-gray-50 border border-gray-200 text-gray-600 rounded-full text-xs font-medium">
                <Sparkles className="w-3.5 h-3.5" /> AI Analyzed
              </div>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[75vh] md:max-h-[80vh] px-6 sm:px-8 py-6">
          {!analysisData ? (
            // Loading State
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-gray-300" />
              <p className="text-sm font-medium">กำลังประมวลผลข้อมูล...</p>
            </div>
          ) : (
            <div className="space-y-8 pb-8">
              {/* Overall Score */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6">
                {/* Score Box */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col items-center sm:items-start justify-center">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                    Overall Score
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-5xl sm:text-6xl font-light text-gray-900 tracking-tight">
                      {analysisData.final_score || analysisData.finalScore || 0}
                    </span>
                    <span className="text-lg text-gray-400 font-medium">
                      /100
                    </span>
                  </div>
                </div>

                {/* Grade Box */}
                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 flex flex-col items-center sm:items-start justify-center">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-2">
                    Final Grade
                  </span>
                  <span
                    className={`text-5xl sm:text-6xl font-medium tracking-tight`}
                  >
                    {analysisData.grade || "-"}
                  </span>
                </div>
              </div>

              {/* Metrics List */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest mb-4">
                  Assessment Details
                </h3>
                <div className="bg-white border border-gray-100 rounded-2xl px-5 sm:px-6 shadow-sm">
                  {renderMetricRow(
                    "Documentation",
                    analysisData.doc_score,
                    10,
                    "ความสมบูรณ์ของเอกสาร (README, License)",
                    FileText,
                  )}
                  {renderMetricRow(
                    "Architecture",
                    analysisData.arch_score,
                    10,
                    "ความชัดเจนของโครงสร้างโปรเจกต์",
                    Layers,
                  )}
                  {renderMetricRow(
                    "Test & CI/CD",
                    analysisData.test_ci_score,
                    15,
                    "ระบบทดสอบอัตโนมัติ",
                    TestTube,
                  )}
                  {renderMetricRow(
                    "Clean Code",
                    analysisData.clean_code_score,
                    15,
                    "ความซ้ำซ้อนและการจัดรูปแบบโค้ด",
                    Code,
                  )}
                  {renderMetricRow(
                    "Code Efficiency",
                    analysisData.efficiency_score,
                    20,
                    "ประสิทธิภาพการประมวลผล (Algorithm)",
                    Zap,
                  )}
                  {renderMetricRow(
                    "Security",
                    analysisData.security_score,
                    15,
                    "ความปลอดภัยของโค้ดและข้อมูล",
                    ShieldCheck,
                  )}
                  {renderMetricRow(
                    "Developer Habits",
                    analysisData.habit_score,
                    15,
                    "วินัยในการเขียนโค้ดและคอมมิต",
                    Brain,
                  )}
                </div>
              </div>

              {/* AI Insight - Plain text style */}
              {analysisData.insight && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-gray-400" /> AI Insight
                  </h3>
                  <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                    <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
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
