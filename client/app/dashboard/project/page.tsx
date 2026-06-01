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


// Imports Components และ Types ที่แยกออกไป
import StatCard from "./Statcard";
import ProjectDetailModal from "./projectdetail";
import { ProjectData, AnalysisData } from "./type";

export default function ProjectPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(null);
  const [analyzeData, setAnalyzeData] = useState<AnalysisData | null>(null);
  const [isFetchingDetail, setIsFetchingDetail] = useState(false);

  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const { addToast } = useNotification();

  // ── Derived stats ──
  const totalRepos = projects.reduce((s, p) => s + (p.repos?.length ?? 0), 0);
  const analyzedCount = projects.filter((p) => p.isAnalyzed).length;
  const pendingCount = projects.length - analyzedCount;

  const avgScore = (() => {
    const analyzedWithScore = projects.filter((p) => p.isAnalyzed && p.finalScore !== undefined);
    if (!analyzedWithScore.length) return null;
    const total = analyzedWithScore.reduce((sum, p) => sum + (p.finalScore || 0), 0);
    return Math.round(total / analyzedWithScore.length);
  })();

  const gradeDistribution = ["S", "A", "B", "C"].map((g) => ({
    grade: g,
    count: projects.filter((p) => p.grade === g).length,
  }));

  const GRADE_COLOR_MAP: Record<string, string> = {
    S: "text-amber-600 bg-amber-50",
    A: "text-emerald-600 bg-emerald-50",
    B: "text-blue-600 bg-blue-50",
    C: "text-orange-600 bg-orange-50",
  };

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res: any = await axios.get("http://localhost:8000/auth/status", { withCredentials: true });
        if (res.data.isAuthenticated) {
          const userId = res.data.user?.id || res.data.userId || res.data.user?.userId;
          setCurrentUserId(userId);
        } else {
          setCurrentUserId(null);
        }
      } catch {
        setCurrentUserId(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (!isCheckingAuth && currentUserId !== null) {
      fetchProjects();
    } else if (!isCheckingAuth && currentUserId === null) {
      setProjects([]);
      setLoading(false);
    }
  }, [currentUserId, isCheckingAuth]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:8000/project/", { params: { userId: currentUserId }, withCredentials: true });
      setProjects(res.data.data);
    } catch {
      setError("ไม่สามารถดึงข้อมูลโปรเจกต์ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };


const pollAnalysisStatus = (projectId: string, projectName: string) => {
    let attempts = 0;
    const maxAttempts = 60;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        setAnalyzingId(null);
        addToast(
          `ใช้เวลาวิเคราะห์นานผิดปกติ กรุณารีเฟรชเพื่อตรวจสอบ`,
          "error",
        );
        return;
      }
      try {
        const res = await axios.get(
          `http://localhost:8000/score/projects/${projectId}/status`,
          { params: { userId: currentUserId }, withCredentials: true },
        );
        if (res.data.status === "completed") {
          clearInterval(interval);
          setAnalyzingId(null);
          addToast(
            `ประมวลผลโปรเจกต์ ${projectName} เสร็จสิ้นแล้ว!`,
            "success",
          );
          fetchProjects();
        } else if (["error", "failed"].includes(res.data.status)) {
          clearInterval(interval);
          setAnalyzingId(null);
          addToast(
            `เกิดข้อผิดพลาดในการวิเคราะห์โปรเจกต์ ${projectName}`,
            "error",
          );
        }
      } catch {
      }
    }, 5000);
  };

  const handleAnalyze = async (
    projectId: string,
    projectName: string,
    e: React.MouseEvent,
  ) => {
    e.stopPropagation();
    setAnalyzingId(projectId);
    try {
      await axios.post(
        `http://localhost:8000/score/group/${projectId}`,
        { userId: currentUserId },
        { withCredentials: true },
      );
      addToast(
        `ส่งโปรเจกต์ ${projectName} เข้าสู่คิววิเคราะห์แล้ว ระบบกำลังทำงานเบื้องหลัง`,
        "info",
      );
      await fetchProjects();
      pollAnalysisStatus(projectId, projectName);
    } catch (err: any) {
      setAnalyzingId(null);
      addToast(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "เกิดข้อผิดพลาดในการส่งข้อมูลเข้าคิว",
        "error",
      );
    }
  };

  const fetchAnalyze = async (projectId: string) => {
    setIsFetchingDetail(true);
    try {
      const res = await axios.get(
        `http://localhost:8000/score/projects/${projectId}/status`,
        { params: { userId: currentUserId }, withCredentials: true },
      );
      setAnalyzeData(
        res.data.status === "completed"
          ? res.data.data
          : { status: res.data.status },
      );
    } catch {
      setAnalyzeData(null);
    } finally {
      setIsFetchingDetail(false);
    }
  };

  const handleDetailClick = async (project: ProjectData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProject(project);
    setAnalyzeData(null);
    setIsDetailOpen(true);
    if (project.isAnalyzed) {
      await fetchAnalyze(project._id);
    }
  };

  const handleDeleteClick = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(projectId);
    setIsDeleteModalOpen(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;
    try {
      await axios.delete(`http://localhost:8000/project/${projectToDelete}`, {
        withCredentials: true,
      });
      fetchProjects();
      addToast("ลบโปรเจกต์เรียบร้อยแล้ว", "success");
    } catch {
      addToast("เกิดข้อผิดพลาดในการลบโปรเจกต์", "error");
    } finally {
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  // ... กรุณา Copy ฟังก์ชันเหล่านี้มาวางจุดนี้ ...

  const getGradeBadge = (project: ProjectData) => {
    if (!project.isAnalyzed) {
      return <Badge variant="secondary" className="text-gray-500 px-2.5 py-0.5 text-xs font-medium">Pending</Badge>;
    }
    const configs: Record<string, { className: string; label: string }> = {
      S: { className: "bg-gradient-to-r from-yellow-400 to-amber-500 text-white", label: "Tier S" },
      A: { className: "bg-emerald-100 text-emerald-700", label: "✅ Tier A" },
      B: { className: "bg-blue-100 text-blue-700", label: "Tier B" },
      C: { className: "bg-orange-100 text-orange-700", label: "Tier C" },
    };
    const cfg = project.grade ? configs[project.grade] : null;
    return cfg ? <Badge className={`${cfg.className} px-2.5 py-0.5 text-xs font-bold`}>{cfg.label}</Badge> : <Badge className="bg-emerald-100 text-emerald-700 px-2.5 py-0.5 text-xs"><CheckCircle2 className="w-3 h-3 mr-1" /> Analyzed</Badge>;
  };

  return (
    <div className="max-w-8xl mx-auto p-4 sm:p-6 lg:p-8 relative">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#26318c]">My Projects</h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">จัดการและดูภาพรวมโปรเจกต์ทั้งหมดที่คุณสร้างไว้จาก GitHub Repositories</p>
      </header>

      {!loading && !error && projects.length > 0 && (
        <div className="mb-6 space-y-3">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <StatCard title="โปรเจกต์ทั้งหมด" value={projects.length} subtitle={`${totalRepos} repositories รวม`} icon={FolderGit2} colorClass="bg-blue-50 text-[#26318c]" />
            <StatCard title="Repository ทั้งหมด" value={totalRepos} subtitle="รวมใน ทุก Portfolio" icon={GitBranch} colorClass="bg-purple-50 text-purple-600" />
            <StatCard title="วิเคราะห์แล้ว" value={`${analyzedCount}/${projects.length}`} subtitle={pendingCount > 0 ? `เหลืออีก ${pendingCount} โปรเจกต์` : "ครบทุกโปรเจกต์แล้ว 🎉"} icon={CheckCircle2} colorClass="bg-emerald-50 text-emerald-600" />
            <StatCard title="คะแนนเฉลี่ย" value={avgScore !== null ? `${avgScore}/100` : "—"} subtitle={avgScore !== null ? "จากคะแนนจริง" : "ยังไม่มีข้อมูล"} icon={TrendingUp} colorClass="bg-amber-50 text-amber-600" />
          </div>
        </div>
      )}

      {/* Main Grid Content ... โค้ด Grid การ์ดโปรเจกต์เดิม ... */}

      <ProjectDetailModal
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setAnalyzeData(null); setSelectedProject(null); }}
        project={selectedProject}
        analysisData={analyzeData}
        isLoading={isFetchingDetail}
      />

      {/* Delete Modal โค้ดเดิม */}
    </div>
  );
}