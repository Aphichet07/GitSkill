"use client";
import axios from "axios";
import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Star, Code2, FolderGit2 } from "lucide-react";

interface RepoData {
  id: number;
  name: string;
  fullName: string;
  description: string;
  language: string;
  defaultBranch: string;
  stars: number;
}

function ProjectPage() {
  const [repoList, setRepoList] = useState<RepoData[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const handleFetchRepo = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/repo`, {
        withCredentials: true,
      });
      setRepoList(res.data.data);
      setCurrentPage(1); // Reset ไปหน้าแรกเมื่อดึงข้อมูลใหม่
    } catch (err: any) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const totalPages = Math.ceil(repoList.length / itemsPerPage);

  const currentItems = useMemo(() => {
    const lastIndex = currentPage * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    return repoList.slice(firstIndex, lastIndex);
  }, [currentPage, repoList]);

  return (
    <div className="p-8 max-w-7xl mx-auto min-h-screen flex flex-col">
      {/* Header*/}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Repositories</h1>
          <p className="text-muted-foreground">
            มีทั้งหมด {repoList.length} รายการ
          </p>
        </div>
        <Button onClick={handleFetchRepo} disabled={loading}>
          {loading ? "กำลังโหลด..." : "Sync GitHub"}
        </Button>
      </div>

      {/* แสดง Card*/}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {currentItems.map((repo) => (
          <Card
            key={repo.id}
            className="hover:border-primary/50 transition-all cursor-pointer"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl truncate" title={repo.name}>
                  {repo.name}
                </CardTitle>
                <div className="flex items-center text-yellow-500 text-sm">
                  <Star className="h-4 w-4 mr-1 fill-current" />
                  {repo.stars}
                </div>
              </div>
              <CardDescription className="line-clamp-2 h-10">
                {repo.description || "No description provided."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-2">
                <Code2 className="h-4 w-4 text-muted-foreground" />
                <Badge variant="secondary" className="font-medium">
                  {repo.language || "Unknown"}
                </Badge>
              </div>
            </CardContent>

            <CardFooter className="border-t pt-4 flex justify-between items-center">
              <span className="text-xs text-muted-foreground">
                Branch:{" "}
                <code className="bg-slate-100 px-1 rounded">
                  {repo.defaultBranch || "main"}
                </code>
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="group-hover:text-primary"
              >
                Analyze →
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* --- Pagination UI --- */}
      {repoList.length > itemsPerPage && (
        <div className="mt-auto py-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage > 1) setCurrentPage(currentPage - 1);
                  }}
                  className={
                    currentPage === 1
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>

              {/* แสดงเลขหน้า*/}
              {[...Array(totalPages)].map((_, i) => (
                <PaginationItem key={i}>
                  <PaginationLink
                    href="#"
                    isActive={currentPage === i + 1}
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage(i + 1);
                    }}
                  >
                    {i + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    if (currentPage < totalPages)
                      setCurrentPage(currentPage + 1);
                  }}
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : "cursor-pointer"
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {!loading && repoList.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <p className="text-muted-foreground">
            ไม่พบข้อมูล กดปุ่ม Sync เพื่อเริ่มงาน
          </p>
        </div>
      )}
    </div>
  );
}

export default ProjectPage;
