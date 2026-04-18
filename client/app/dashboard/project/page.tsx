"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  FolderGit2,
  Calendar,
  GitPullRequestDraft,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectAnalysisModal } from "@/component/modals/ProjectAnalysisModal";

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
  analysisResult?: any;
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

  useEffect(() => {
    fetchProjects();
  }, []);

  const currentUserId = 2;

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

  const handleAnalyze = async (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log("projectId --> ", projectId);
    setAnalyzingId(projectId);

    try {
      const res = await axios.post(
        `http://localhost:8000/analysis/${projectId}/analyze`,
        { userId: currentUserId },
        { withCredentials: true },
      );

      setAnalyzeData(res.data.data);

      alert("วิเคราะห์เสร็จสิ้น! (สามารถนำ data ไปแสดงผลต่อได้)");

      await fetchProjects();
    } catch (err: any) {
      console.error("Analyze Error:", err);
      alert(
        err.response?.data?.message || "เกิดข้อผิดพลาดในการวิเคราะห์ข้อมูล",
      );
    } finally {
      setAnalyzingId(null);
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

  return (
    <div className="max-w-8xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-[#26318c]">My Projects</h1>
        <p className="text-gray-500 mt-2">
          จัดการและดูภาพรวมโปรเจกต์ทั้งหมดที่คุณสร้างไว้จาก GitHub Repositories
        </p>
      </header>

      <div className="bg-white p-8 rounded-3xl border border-[#eaeaea] shadow-sm min-h-125 flex flex-col">
        {/* Loading */}
        {loading && (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#26318c] mb-4"></div>
            <p className="text-gray-500">กำลังโหลดข้อมูลโปรเจกต์ของคุณ...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <div className="text-red-500 mb-4 bg-red-50 p-4 rounded-full">
              <FolderGit2 className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-medium text-gray-800">
              เกิดข้อผิดพลาด
            </h3>
            <p className="text-gray-500 mt-2">{error}</p>
            <Button
              onClick={fetchProjects}
              className="mt-4 bg-[#26318c] hover:bg-[#1a2366]"
            >
              ลองใหม่อีกครั้ง
            </Button>
          </div>
        )}

        {/* ไม่มีโปรเจกต์ */}
        {!loading && !error && projects.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <FolderGit2 className="w-10 h-10 text-[#26318c]" />
            </div>
            <h2 className="text-xl font-semibold mb-2 text-slate-800">
              ยังไม่มีโปรเจกต์
            </h2>
            <p className="text-gray-500 mb-6 max-w-md">
              คุณยังไม่ได้สร้างโปรเจกต์ใดๆ กลับไปที่หน้า Dashboard เพื่อเลือก
              Repository และเริ่มสร้างโปรเจกต์แรกของคุณได้เลย
            </p>
            <Button
              onClick={() => router.push("/dashboard")}
              className="bg-[#26318c] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#1a2366] transition-all shadow-md"
            >
              ไปที่ Dashboard
            </Button>
          </div>
        )}

        {/* Data Loaded */}
        {!loading && !error && projects.length > 0 && (
          <>
            <div className="flex justify-between items-end mb-6 pb-4 border-b">
              <h2 className="text-xl font-semibold text-slate-800">
                All Projects{" "}
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({projects.length})
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card
                  key={project._id}
                  className="hover:border-[#26318c]/40 hover:shadow-md transition-all rounded-2xl border-gray-200 flex flex-col cursor-pointer relative"
                  onClick={() => router.push(`/project/${project._id}`)}
                >
                  <div className="absolute top-4 right-4 z-10">
                    {project.isAnalyzed ? (
                      <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none px-2 py-1">
                        <CheckCircle2 className="w-3 h-3 mr-1" />
                        Analyzed
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-gray-500 px-2 py-1"
                      >
                        Pending
                      </Badge>
                    )}
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-[#26318c] mb-3">
                        <FolderGit2 className="w-5 h-5" />
                      </div>
                    </div>
                    <CardTitle
                      className="text-xl font-bold text-slate-800 truncate pr-16"
                      title={project.groupName}
                    >
                      {project.groupName}
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="pb-4 flex-1">
                    <div className="flex flex-col gap-3 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <GitPullRequestDraft className="w-4 h-4 text-gray-400" />
                        <span>
                          รวม {project.repos?.length || 0} Repositories
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>สร้างเมื่อ: {formatDate(project.createdAt)}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-4 border-t border-gray-100 mt-auto flex gap-2">
                    <Button
                      variant="ghost"
                      className="flex-1 text-gray-600 rounded-xl hover:bg-blue-50/50 hover:text-[#26318c]"
                      onClick={(e) => openProjectDetails(project, e)}
                    >
                      ดูรายละเอียด
                    </Button>

                    <Button
                      className="flex-1 bg-[#26318c] hover:bg-[#1a2366] rounded-xl"
                      disabled={analyzingId === project._id}
                      onClick={(e) => handleAnalyze(project._id, e)}
                    >
                      {analyzingId === project._id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Analysing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" /> Analyze AI
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
    </div>
  );
}

export default ProjectPage;
