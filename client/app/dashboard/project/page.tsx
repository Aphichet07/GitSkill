"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  FolderGit2,
  Calendar,
  GitPullRequestDraft,
  CheckCircle2,
  Trash2,
  TrendingUp,
  GitBranch,
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
import DeleteCard from "@/component/card/DeleteCard";
import { useNotification } from "@/context/NotificationContext";

import StatCard from "./Statcard";
import ProjectDetailModal from "./projectdetail";
import { ProjectData, AnalysisData } from "./type";

// Base URL สำหรับเรียก API (ดึงจาก env หรือใช้ localhost ตอน dev)
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

  const fetchProjects = async (userIdToUse?: number | null) => {
    const targetUserId = userIdToUse !== undefined ? userIdToUse : currentUserId;
    if (targetUserId === null) return;

    try {
      setLoading(true);
      // เพิ่ม Type ให้ตรงนี้
      const res = await axios.get<{ data: ProjectData[] }>(`${API_BASE_URL}/project/`, { 
        params: { userId: targetUserId }, 
        withCredentials: true 
      });
      setProjects(res.data.data);
    } catch {
      setError("ไม่สามารถดึงข้อมูลโปรเจกต์ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializePage = async () => {
      try {
        setIsCheckingAuth(true);
        setLoading(true);
        
        // เพิ่ม Type ป้องกัน unknown object
        const res = await axios.get<{isAuthenticated: boolean; user?: {id?: number; userId?: number}; userId?: number}>(
          `${API_BASE_URL}/auth/status`, 
          { withCredentials: true }
        );
        
        if (res.data.isAuthenticated) {
          const userId = res.data.user?.id || res.data.userId || res.data.user?.userId;
          setCurrentUserId(userId ?? null);
          await fetchProjects(userId);
        } else {
          setCurrentUserId(null);
          setProjects([]);
          setLoading(false);
        }
      } catch {
        setCurrentUserId(null);
        setProjects([]);
        setLoading(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    initializePage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const pollAnalysisStatus = (projectId: string, projectName: string) => {
    let attempts = 0;
    const maxAttempts = 60;
    const interval = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        clearInterval(interval);
        setAnalyzingId(null);
        addToast(`ใช้เวลาวิเคราะห์นานผิดปกติ กรุณารีเฟรชเพื่อตรวจสอบ`, "error");
        return;
      }
      try {
        const res = await axios.get<{ status: string }>(
          `${API_BASE_URL}/score/projects/${projectId}/status`,
          { params: { userId: currentUserId }, withCredentials: true },
        );
        if (res.data.status === "completed") {
          clearInterval(interval);
          setAnalyzingId(null);
          addToast(`ประมวลผลโปรเจกต์ ${projectName} เสร็จสิ้นแล้ว!`, "success");
          fetchProjects(); 
        } else if (["error", "failed"].includes(res.data.status)) {
          clearInterval(interval);
          setAnalyzingId(null);
          addToast(`เกิดข้อผิดพลาดในการวิเคราะห์โปรเจกต์ ${projectName}`, "error");
        }
      } catch {}
    }, 5000);
  };

  const handleAnalyze = async (projectId: string, projectName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAnalyzingId(projectId);
    try {
      await axios.post(
        `${API_BASE_URL}/score/group/${projectId}`,
        { userId: currentUserId },
        { withCredentials: true },
      );
      addToast(`ส่งโปรเจกต์ ${projectName} เข้าสู่คิววิเคราะห์แล้ว ระบบกำลังทำงานเบื้องหลัง`, "info");
      await fetchProjects(); 
      pollAnalysisStatus(projectId, projectName);
    } catch (err: any) {
      setAnalyzingId(null);
      addToast(
        err.response?.data?.error || err.response?.data?.message || "เกิดข้อผิดพลาดในการส่งข้อมูลเข้าคิว",
        "error"
      );
    }
  };

  const fetchAnalyze = async (projectId: string) => {
    setIsFetchingDetail(true);
    try {
      // เพิ่ม Type สำหรับรองรับ AnalysisData
      const res = await axios.get<{ status: string; data?: AnalysisData }>(
        `${API_BASE_URL}/score/projects/${projectId}/status`,
        { params: { userId: currentUserId }, withCredentials: true },
      );
      setAnalyzeData(
        res.data.status === "completed" && res.data.data ? res.data.data : ({ status: res.data.status } as any)
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
      await axios.delete(`${API_BASE_URL}/project/${projectToDelete}`, { withCredentials: true });
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

      {/* Stats Overview */}
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

      {/*Card Grid*/}
      <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-[#eaeaea] shadow-sm min-h-[60vh] flex flex-col">
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#26318c] mb-4" />
          </div>
        )}

        {!loading && projects.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
            <h2 className="text-lg font-semibold text-slate-800">ยังไม่มีโปรเจกต์</h2>
          </div>
        )}

        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {projects.map((project) => (
              <Card
                key={project._id}
                className="rounded-2xl border border-gray-200 flex flex-col cursor-pointer relative transition-all duration-300 ease-out hover:border-[#26318c]/40 hover:shadow-xl hover:-translate-y-1.5 bg-white"
                onClick={() => router.push(`/project/${project._id}`)}
              >
                {/* Grade + Delete Button */}
                <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
                  {getGradeBadge(project)}
                  <button onClick={(e) => handleDeleteClick(project._id, e)} className="p-1.5 text-gray-400 hover:text-red-500">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <CardHeader className="pb-2 px-4 pt-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-[#26318c] mb-2">
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                  <CardTitle className="text-lg font-bold truncate pr-16">{project.groupName}</CardTitle>
                </CardHeader>

                <CardContent className="pb-3 px-4 flex-1">
                  <div className="flex flex-col gap-2 text-xs text-gray-600">
                    <div className="flex items-center gap-2">
                      <GitPullRequestDraft className="w-3.5 h-3.5 text-gray-400" />
                      <span>{project.repos?.length || 0} Repositories</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>สร้างเมื่อ: {formatDate(project.createdAt)}</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-3 pb-4 px-4 border-t border-gray-100 mt-auto flex gap-2">
                  <Button
                    variant="ghost"
                    className="flex-1 text-xs text-gray-600 hover:bg-blue-50/50 hover:text-[#26318c]"
                    onClick={(e) => handleDetailClick(project, e)}
                  >
                    ดูรายละเอียด
                  </Button>
                  <Button
                    className="flex-1 bg-[#26318c] hover:bg-[#1a2366] text-xs"
                    disabled={analyzingId === project._id}
                    onClick={(e) => handleAnalyze(project._id, project.groupName, e)}
                  >
                    {analyzingId === project._id ? "Analysing..." : "Analyze AI"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ProjectDetailModal
        isOpen={isDetailOpen}
        onClose={() => { setIsDetailOpen(false); setAnalyzeData(null); setSelectedProject(null); }}
        project={selectedProject}
        analysisData={analyzeData}
        isLoading={isFetchingDetail}
      />

      <DeleteCard
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setProjectToDelete(null); }}
        onConfirm={confirmDeleteProject}
        projectName={projects.find((p) => p._id === projectToDelete)?.groupName ?? ""}
      />
    </div>
  );
}