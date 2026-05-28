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
  Info,
  AlertCircle,
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
import { ProjectAnalysisModal } from "@/component/modals/ProjectAnalysisModal";
import DeleteCard from "@/component/card/DeleteCard";
import { useNotification } from "@/context/NotificationContext";
interface RepoData {
  id: number;
  name: string;
  description: string | null;
  url: string;
  language: string;
  stars: number;
  updatedAt: string;
}

interface ProjectData {
  _id: string;
  groupName: string;
  userId: number;
  repos: RepoData[];
  createdAt: string;
  isAnalyzed: boolean;
  grade?: string;
  analysisResult?: any;
}

interface ToastNotification {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

function ProjectPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectData | null>(
    null,
  );
  const [analyzeData, setAnalyzeData] = useState<any | null>(null);

  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [isLoginGithub, setIsLoginGithub] = useState<boolean>(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  // State Notifications
  const { addToast } = useNotification();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res: any = await axios.get("http://localhost:8000/auth/status", {
          withCredentials: true,
        });

        if (res.data.isAuthenticated) {
          setIsLoginGithub(true);
          const userId =
            res.data.user?.id || res.data.userId || res.data.user?.userId;
          setCurrentUserId(userId);
        } else {
          setIsLoginGithub(false);
          setCurrentUserId(null);
        }
      } catch (error) {
        console.error("Auth Status Error:", error);
        setIsLoginGithub(false);
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
      const res = await axios.get("http://localhost:8000/project/", {
        params: { userId: currentUserId },
        withCredentials: true,
      });
      setProjects(res.data.data);
    } catch (err: any) {
      console.error("Fetch Projects Error:", err);
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
          `ใช้เวลาวิเคราะห์โปรเจกต์ ${projectName} นานผิดปกติ กรุณารีเฟรชเพื่อตรวจสอบอีกครั้ง`,
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
            `ประมวลผลโปรเจกต์ ${projectName} เสร็จสิ้นแล้ว! 🎉`,
            "success",
          );
          fetchProjects();
        } else if (
          res.data.status === "error" ||
          res.data.status === "failed"
        ) {
          clearInterval(interval);
          setAnalyzingId(null);
          addToast(
            `เกิดข้อผิดพลาดในการวิเคราะห์โปรเจกต์ ${projectName}`,
            "error",
          );
        }
      } catch (error) {
        console.error("Polling error:", error);
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
        `ส่งโปรเจกต์ ${projectName} เข้าสู่คิววิเคราะห์แล้ว ระบบกำลังทำงานอยู่เบื้องหลัง`,
        "info",
      );
      await fetchProjects();

      pollAnalysisStatus(projectId, projectName);
    } catch (err: any) {
      console.error("Analyze Error:", err);
      setAnalyzingId(null);
      addToast(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "เกิดข้อผิดพลาดในการส่งข้อมูลเข้าคิว",
        "error",
      );
    }
  };

  const fetchAnalyze = async (projectId: string, e: React.MouseEvent) => {
    if (e) e.preventDefault();
    setAnalyzingId(projectId);

    try {
      const res = await axios.get(
        `http://localhost:8000/score/projects/${projectId}/status`,
        { params: { userId: currentUserId }, withCredentials: true },
      );

      if (res.data.status === "completed") {
        setAnalyzeData(res.data.data);
      } else if (res.data.status === "processing") {
        setAnalyzeData({ status: "processing" });
      }
    } catch (error: any) {
      console.error(
        "Analysis Fetch Error:",
        error.response?.data?.error ||
          error.response?.data?.message ||
          error.message,
      );
      setAnalyzeData({ status: "error", message: "ไม่พบผลการวิเคราะห์ในระบบ" });
    } finally {
      setAnalyzingId(null);
    }
  };

  const handleDetailClick = async (project: any, e: React.MouseEvent) => {
    e.preventDefault();
    openProjectDetails(project, e);
    await fetchAnalyze(project._id, e);
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
    } catch (error) {
      console.error("Error deleting project:", error);
      addToast("เกิดข้อผิดพลาดในการลบโปรเจกต์", "error");
    } finally {
      setIsDeleteModalOpen(false);
      setProjectToDelete(null);
    }
  };

  const openProjectDetails = (project: ProjectData, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProject(project);
    setIsViewModalOpen(true);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "short",
      day: "numeric",
    };
    return new Date(dateString).toLocaleDateString("th-TH", options);
  };

  const getGradeBadge = (project: ProjectData) => {
    if (!project.isAnalyzed) {
      return (
        <Badge
          variant="secondary"
          className="text-gray-500 px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium"
        >
          Pending
        </Badge>
      );
    }

    const grade = project.grade || project.analysisResult?.grade;

    switch (grade) {
      case "S":
        return (
          <Badge className="bg-linear-to-r from-yellow-400 to-yellow-600 text-white border-none px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm shadow-sm font-bold">
            <Trophy className="w-3 h-3 mr-1" /> Tier S
          </Badge>
        );
      case "A":
        return (
          <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-none px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Tier A
          </Badge>
        );
      case "B":
        return (
          <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200 border-none px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold">
            Tier B
          </Badge>
        );
      case "C":
        return (
          <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-none px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold">
            Tier C
          </Badge>
        );
      case "F":
        return (
          <Badge className="bg-red-100 text-red-700 hover:bg-red-200 border-none px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-bold">
            Tier F
          </Badge>
        );
      default:
        return (
          <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none px-2 sm:px-3 py-0.5 sm:py-1 text-xs sm:text-sm font-medium">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Analyzed
          </Badge>
        );
    }
  };

  return (
    <div className="max-w-8xl mx-auto p-4 sm:p-6 lg:p-8 relative">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#26318c]">
          My Projects
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">
          จัดการและดูภาพรวมโปรเจกต์ทั้งหมดที่คุณสร้างไว้จาก GitHub Repositories
        </p>
      </header>

      <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-[#eaeaea] shadow-sm min-h-[60vh] flex flex-col">
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 sm:py-20">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-[#26318c] mb-4"></div>
            <p className="text-sm sm:text-base text-gray-500">
              กำลังโหลดข้อมูลโปรเจกต์ของคุณ...
            </p>
          </div>
        )}

        {!loading && error && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 sm:py-20 text-center">
            <div className="text-red-500 mb-4 bg-red-50 p-3 sm:p-4 rounded-full">
              <FolderGit2 className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-gray-800">
              เกิดข้อผิดพลาด
            </h3>
            <p className="text-sm sm:text-base text-gray-500 mt-2">{error}</p>
            <Button
              onClick={fetchProjects}
              className="mt-4 bg-[#26318c] hover:bg-[#1a2366]"
            >
              ลองใหม่อีกครั้ง
            </Button>
          </div>
        )}

        {!loading && !error && projects.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-12 sm:py-20 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 sm:mb-6">
              <FolderGit2 className="w-8 h-8 sm:w-10 sm:h-10 text-[#26318c]" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold mb-2 text-slate-800">
              ยังไม่มีโปรเจกต์
            </h2>
            <p className="text-sm sm:text-base text-gray-500 mb-6 max-w-sm sm:max-w-md mx-auto">
              คุณยังไม่ได้สร้างโปรเจกต์ใดๆ กลับไปที่หน้า Dashboard เพื่อเลือก
              Repository และเริ่มสร้างโปรเจกต์แรกของคุณได้เลย
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-[#26318c] text-white px-6 sm:px-8 py-2.5 sm:py-3 rounded-xl font-medium hover:bg-[#1a2366] transition-all shadow-md text-sm sm:text-base"
            >
              ไปที่ Dashboard
            </Button>
          </div>
        )}

        {!loading && !error && projects.length > 0 && (
          <>
            <div className="flex justify-between items-end mb-4 sm:mb-6 pb-3 sm:pb-4 border-b">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                All Projects{" "}
                <span className="text-xs sm:text-sm font-normal text-muted-foreground ml-1 sm:ml-2">
                  ({projects.length})
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {projects.map((project) => (
                <Card
                  key={project._id}
                  className="hover:border-[#26318c]/40 hover:shadow-md transition-all rounded-2xl border-gray-200 flex flex-col cursor-pointer relative"
                  onClick={() => router.push(`/project/${project._id}`)}
                >
                  <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 flex items-center gap-1.5 sm:gap-2">
                    {getGradeBadge(project)}

                    <button
                      onClick={(e) => handleDeleteClick(project._id, e)}
                      className="p-1.5 sm:p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Project"
                    >
                      <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>

                  <CardHeader className="pb-2 sm:pb-3 px-4 sm:px-6 pt-4 sm:pt-6">
                    <div className="flex justify-between items-start">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#26318c] mb-2 sm:mb-3">
                        <FolderGit2 className="w-4 h-4 sm:w-5 sm:h-5" />
                      </div>
                    </div>
                    <CardTitle
                      className="text-lg sm:text-xl font-bold text-slate-800 truncate pr-16 sm:pr-20"
                      title={project.groupName}
                    >
                      {project.groupName}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pb-3 sm:pb-4 px-4 sm:px-6 flex-1">
                    <div className="flex flex-col gap-2 sm:gap-3 text-xs sm:text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <GitPullRequestDraft className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
                        <span className="truncate">
                          รวม {project.repos?.length || 0} Repositories
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 shrink-0" />
                        <span className="truncate">
                          สร้างเมื่อ: {formatDate(project.createdAt)}
                        </span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-3 sm:pt-4 pb-4 sm:pb-6 px-4 sm:px-6 border-t border-gray-100 mt-auto flex flex-col sm:flex-row gap-2 sm:gap-2">
                    <Button
                      variant="ghost"
                      className="w-full sm:flex-1 text-xs sm:text-sm text-gray-600 rounded-xl hover:bg-blue-50/50 hover:text-[#26318c] h-9 sm:h-10"
                      onClick={(e) => handleDetailClick(project, e)}
                    >
                      ดูรายละเอียด
                    </Button>

                    <Button
                      className="w-full sm:flex-1 bg-[#26318c] hover:bg-[#1a2366] rounded-xl h-9 sm:h-10 text-xs sm:text-sm"
                      disabled={analyzingId === project._id}
                      onClick={(e) =>
                        handleAnalyze(project._id, project.groupName, e)
                      }
                    >
                      {analyzingId === project._id ? (
                        <>
                          <div className="animate-spin rounded-full h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-white mr-2"></div>
                          Analysing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-2" />{" "}
                          Analyze AI
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>

      <ProjectAnalysisModal
        isOpen={isViewModalOpen}
        onClose={() => {
          setIsViewModalOpen(false);
          setAnalyzeData(null);
        }}
        project={selectedProject}
        analysisData={analyzeData}
      />

      <DeleteCard
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setProjectToDelete(null);
        }}
        onConfirm={confirmDeleteProject}
        projectName={
          projects.find((p) => p._id === projectToDelete)?.groupName || ""
        }
      />
    </div>
  );
}

export default ProjectPage;
