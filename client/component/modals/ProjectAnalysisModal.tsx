"use client";

import React from "react";
import {
  FolderGit2,
  X,
  CheckCircle2,
  AlertCircle,
  Code2,
  Lightbulb,
  TerminalSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ProjectAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: any;
  analysisData?: any;
}

export function ProjectAnalysisModal({
  isOpen,
  onClose,
  project,
  analysisData,
}: ProjectAnalysisModalProps) {
  console.log("AnalysisData in Modal:", analysisData);
  if (!isOpen || !project) return null;

  const analysis = analysisData || project.analysisResult || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300 p-4">
      <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl border p-0 animate-in zoom-in-95 duration-300 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-[#26318c]">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {project.groupName}
              </h2>
              <p className="text-xs text-gray-500">AI Analysis Result</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content เนื้อหา */}
        <div className="p-8 flex-1">
          {!analysis ? (
            <div className="text-center py-10">
              <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
              <p className="text-gray-600 font-medium">
                โปรเจกต์นี้ยังไม่ได้ผ่านการวิเคราะห์ด้วย AI
              </p>
              <p className="text-sm text-gray-400 mt-1">
                กรุณากดปุ่ม Analyze AI ในหน้าหลัก
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/*Summation */}
              {analysis.summation && (
                <section>
                  <div className="flex items-center gap-2 mb-3 text-[#26318c]">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="font-bold text-lg">Project Summation</h3>
                  </div>
                  <div className="bg-blue-50/50 p-5 rounded-2xl text-slate-700 leading-relaxed text-sm border border-blue-100">
                    {analysis.summation}
                  </div>
                </section>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/*Skills*/}
                {analysis.skills && analysis.skills.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-3 text-blue-600">
                      <Code2 className="w-5 h-5" />
                      <h3 className="font-bold text-lg">Detected Skills</h3>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {analysis.skills.map((skill: any, i: number) => (
                        <Badge
                          key={i}
                          variant="secondary"
                          className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 border-none flex items-center gap-1"
                        >
                          <span>{skill.language}</span>
                          <span className="text-xs text-blue-500 bg-blue-100 px-1.5 py-0.5 rounded-md">
                            {skill.points} pts
                          </span>
                        </Badge>
                      ))}
                    </div>
                  </section>
                )}

                {/* Recommendation*/}
                {analysis.recommendation && (
                  <section>
                    <div className="flex items-center gap-2 mb-3 text-amber-600">
                      <Lightbulb className="w-5 h-5" />
                      <h3 className="font-bold text-lg">Recommendation</h3>
                    </div>
                    <div className="text-sm text-slate-600 bg-amber-50/50 p-4 rounded-2xl border border-amber-100 leading-relaxed">
                      {analysis.recommendation}
                    </div>
                  </section>
                )}
              </div>

              {/* Deep Code*/}
              {analysis.deepcode && (
                <section>
                  <div className="flex items-center gap-2 mb-3 text-emerald-600">
                    <TerminalSquare className="w-5 h-5" />
                    <h3 className="font-bold text-lg">Deep Code Insights</h3>
                  </div>
                  <div className="bg-slate-900 p-5 rounded-2xl text-slate-300 text-sm leading-relaxed font-mono">
                    {analysis.deepcode}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t flex justify-end rounded-b-3xl">
          <Button
            onClick={onClose}
            className="bg-[#26318c] hover:bg-[#1a2366] text-white rounded-xl px-8 shadow-sm"
          >
            ปิดหน้าต่าง
          </Button>
        </div>
      </div>
    </div>
  );
}
