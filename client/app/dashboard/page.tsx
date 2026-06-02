"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Star, Code2, CheckCircle2, RefreshCw } from "lucide-react";
import { CreateProjectModal } from "@/component/modals/CreateProjectModal";

interface RepoData {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  language: string;
  defaultBranch: string;
  stars: number;
  updatedAt: string;
}

export default function Dashboard() {
  const router = useRouter();

  // Auth States
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);
  const [isLoginGithub, setIsLoginGithub] = useState<boolean>(false);

  // Data States
  const [repoList, setRepoList] = useState<RepoData[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const handleFetchRepo = useCallback(async (forceRefresh = false) => {
    const CACHE_KEY = "dashboard_repos_cache";
    setLoading(true);

    try {
      if (!forceRefresh) {
        const cachedData = sessionStorage.getItem(CACHE_KEY);
        if (cachedData) {
          setRepoList(JSON.parse(cachedData));
          setLoading(false);
          return;
        }
      }

      // ถ้าไม่มี Cache หรือกดบังคับ Refresh ให้ยิง API
      const res = await axios.get(`http://localhost:8000/repo`, {
        withCredentials: true,
      });

      const fetchedData = res.data.data || res.data;
      setRepoList(fetchedData);

      // บันทึกข้อมูลลง Cache
      sessionStorage.setItem(CACHE_KEY, JSON.stringify(fetchedData));

      setCurrentPage(1);
      setSelectedIds([]);
    } catch (err: any) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

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
        setIsLoginGithub(false);
        setCurrentUserId(null);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (isLoginGithub && currentUserId !== null) {
      handleFetchRepo(false);
    }
  }, [isLoginGithub, currentUserId, handleFetchRepo]);

  const handleAuthGithub = async (e: React.MouseEvent<HTMLButtonElement>) => {
    window.location.href = "http://localhost:8000/auth/github";
  };

  const toggleSelection = (id: number) => {
    setSelectedIds((prevSelected) => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter((selectedId) => selectedId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  };

  const handleProjectCreatedSuccess = () => {
    setSelectedIds([]);
    router.push("/dashboard/project");
  };

  const totalPages = Math.ceil(repoList.length / itemsPerPage);

  const currentItems = useMemo(() => {
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    return repoList.slice(firstIndex, lastIndex);
  }, [currentPage, repoList]);

  const selectedReposData = useMemo(() => {
    return repoList.filter((repo) => selectedIds.includes(repo.id));
  }, [repoList, selectedIds]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <header className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#26318c]">
          Dashboard Overview
        </h1>
        <p className="text-sm sm:text-base text-gray-500 mt-1 sm:mt-2">
          Manage and analyze your GitHub repositories with AI.
        </p>
      </header>

      <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-[#eaeaea] shadow-sm min-h-[60vh] flex flex-col">
        {isCheckingAuth ? (
          // สถานะกำลังเช็ค Auth
          <div className="flex flex-col items-center justify-center m-auto py-20">
            <RefreshCw className="h-10 w-10 text-[#26318c] animate-spin mb-4" />
            <p className="text-gray-500 font-medium">
              กำลังตรวจสอบการเชื่อมต่อ...
            </p>
          </div>
        ) : !isLoginGithub ? (
          // ยังไม่ได้ Login
          <div className="flex flex-col items-center py-20 text-center m-auto animate-in fade-in duration-500">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">🔗</span>
            </div>
            <h2 className="text-xl font-semibold mb-2">Connect your GitHub</h2>
            <p className="text-gray-500 mb-6 max-w-sm">
              To start summarizing your repositories, please connect your GitHub
              account first.
            </p>
            <button
              onClick={handleAuthGithub}
              className="bg-[#26318c] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#1a2366] transition-all shadow-md active:scale-95"
            >
              Connect GitHub Account
            </button>
          </div>
        ) : (
          // Login แล้ว
          <div className="flex-1 flex flex-col animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b gap-4">
              <div>
                <h2 className="text-lg sm:text-xl font-semibold text-slate-800">
                  Your Repositories
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  {repoList.length > 0
                    ? `พบทั้งหมด ${repoList.length} รายการ`
                    : "กด Sync เพื่อดึงข้อมูลโปรเจกต์ของคุณ"}
                  {selectedIds.length > 0 && (
                    <span className="ml-2 text-[#26318c] font-medium">
                      (เลือกแล้ว {selectedIds.length} รายการ)
                    </span>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 sm:gap-3 w-full md:w-auto">
                {selectedIds.length > 0 && (
                  <>
                    <button
                      onClick={() => setSelectedIds([])}
                      className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-sm transition-colors"
                    >
                      สร้าง Project ({selectedIds.length})
                    </button>
                  </>
                )}
                <button
                  onClick={() => handleFetchRepo(true)} // ส่ง true เพื่อบังคับโหลดข้าม Cache
                  disabled={loading}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base flex items-center bg-[#26318c] hover:bg-[#1a2366] text-white rounded-xl shadow-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  <RefreshCw
                    className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
                  />
                  {loading ? "Syncing..." : "Sync GitHub"}
                </button>
              </div>
            </div>

            {/* Loading Indicator for Repos */}
            {loading && repoList.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#26318c] mb-4"></div>
                <p className="text-sm text-gray-500">
                  กำลังดึงข้อมูล Repositories...
                </p>
              </div>
            ) : repoList.length === 0 ? (
              // Empty State กรณีไม่มี Repo
              <div className="flex-1 flex flex-col items-center justify-center py-20 text-center">
                <Code2 className="w-12 h-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-700">
                  No repositories found
                </h3>
                <p className="text-gray-500 text-sm mt-1 max-w-sm">
                  Click the Sync GitHub button above to fetch your repositories
                  and start building your project.
                </p>
              </div>
            ) : (
              <>
                {/* Repository Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-10">
                  {currentItems.map((repo) => {
                    const isSelected = selectedIds.includes(repo.id);

                    return (
                      <div
                        key={repo.id}
                        onClick={() => toggleSelection(repo.id)}
                        className={`p-5 sm:p-6 border bg-white rounded-2xl cursor-pointer transition-all relative ${
                          isSelected
                            ? "border-[#26318c] ring-1 ring-[#26318c] bg-[#26318c]/5 shadow-sm"
                            : "border-gray-200 hover:border-[#26318c]/40 hover:shadow-md"
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-4 right-4 text-[#26318c] animate-in zoom-in duration-200">
                            <CheckCircle2 className="h-5 w-5 fill-white" />
                          </div>
                        )}

                        <div className="pb-3">
                          <h3
                            className="text-base sm:text-lg font-semibold truncate pr-6 text-slate-800"
                            title={repo.name}
                          >
                            {repo.name}
                          </h3>
                          <p className="line-clamp-2 h-10 text-xs sm:text-sm mt-1 text-gray-500">
                            {repo.description || "No description provided."}
                          </p>
                        </div>

                        <div className="pt-2 flex items-center gap-4 text-xs sm:text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Code2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span className="font-medium truncate max-w-25">
                              {repo.language || "Unknown"}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" />
                            <span className="text-gray-600 font-medium">
                              {repo.stars}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {repoList.length > itemsPerPage && (
                  <div className="mt-auto pt-4 sm:pt-6 border-t flex flex-wrap justify-center gap-1.5 sm:gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage > 1) setCurrentPage(currentPage - 1);
                      }}
                      disabled={currentPage === 1}
                      className="px-2 sm:px-3 py-1 text-sm border rounded-md disabled:opacity-50"
                    >
                      Previous
                    </button>

                    {[...Array(totalPages)].map((_, i) => (
                      <button
                        key={i}
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(i + 1);
                        }}
                        className={`px-2.5 sm:px-3 py-1 text-sm rounded-md ${
                          currentPage === i + 1
                            ? "bg-[#26318c] text-white"
                            : "border hover:bg-gray-50"
                        }`}
                      >
                        {i + 1}
                      </button>
                    ))}

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (currentPage < totalPages)
                          setCurrentPage(currentPage + 1);
                      }}
                      disabled={currentPage === totalPages}
                      className="px-2 sm:px-3 py-1 text-sm border rounded-md disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        selectedRepos={selectedReposData}
        userId={currentUserId?.toString() || ""}
        onSuccess={handleProjectCreatedSuccess}
      />
    </div>
  );
}
