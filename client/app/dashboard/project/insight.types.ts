import {
  BookOpen,
  GitMerge,
  TestTube2,
  FileCode2,
  Zap,
  ShieldCheck,
  Wrench,
} from "lucide-react";

export interface ProjectData {
  _id: string;
  groupName: string;
  repos: any[];
  createdAt: string;
  isAnalyzed: boolean;
  grade?: string;
}

export interface DetailedStats {
  massiveFiles?: number;
  nestedLoopsO2?: number;
  hardcodedSecrets?: number;
  sqlInjections?: number;
  leftoverLogs?: number;
  commentRatioPercent?: number;
}

export interface ScoreAnalysis {
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
  detailed_stats: DetailedStats;
}

export interface ProjectInsight {
  project: ProjectData;
  analysis: ScoreAnalysis | null;
  loading: boolean;
  analyzing: boolean;
}


export const SCORE_METRICS = [
  { key: "doc_score",        label: "Documentation", max: 10,  icon: BookOpen,    color: "bg-blue-400"   },
  { key: "arch_score",       label: "Architecture",  max: 10,  icon: GitMerge,    color: "bg-indigo-400" },
  { key: "test_ci_score",    label: "Testing & CI",  max: 15,  icon: TestTube2,   color: "bg-cyan-400"   },
  { key: "clean_code_score", label: "Clean Code",    max: 15,  icon: FileCode2,   color: "bg-teal-400"   },
  { key: "efficiency_score", label: "Efficiency",    max: 20,  icon: Zap,         color: "bg-yellow-400" },
  { key: "security_score",   label: "Security",      max: 15,  icon: ShieldCheck, color: "bg-red-400"    },
  { key: "habit_score",      label: "Good Habits",   max: 15,  icon: Wrench,      color: "bg-purple-400" },
] as const;