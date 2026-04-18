import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button"; 

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

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRepos: RepoData[];
  userId: string;
  onSuccess: () => void;
}

export function CreateProjectModal({
  isOpen,
  onClose,
  selectedRepos,
  userId,
  onSuccess,
}: CreateProjectModalProps) {
  const [groupName, setGroupName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim()) {
      setError("กรุณากรอกชื่อโปรเจกต์");
      return;
    }

    setIsCreating(true);
    setError("");

    try {
      const payload = {
        groupName: groupName.trim(),
        selectedRepos,
        userId,
      };

      await axios.post(`http://localhost:8000/project/`, payload, {
        withCredentials: true,
      });

      onSuccess();
      
      setGroupName("");
      onClose();
    } catch (err: any) {
      console.error("Create Project Error:", err);
      setError("เกิดข้อผิดพลาดในการสร้างโปรเจกต์ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-background w-full max-w-md rounded-xl shadow-lg border p-6 animate-in zoom-in-95 duration-200">
        <h2 className="text-xl font-bold mb-2">สร้าง Project ใหม่</h2>
        <p className="text-sm text-muted-foreground mb-6">
          คุณกำลังเลือก {selectedRepos.length} Repositories เพื่อรวมเป็นโปรเจกต์เดียวกัน
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="groupName" className="block text-sm font-medium mb-2">
              ชื่อโปรเจกต์ (Group Name) <span className="text-red-500">*</span>
            </label>
            <input
              id="groupName"
              type="text"
              autoFocus
              className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="เช่น My Awesome Project"
              value={groupName}
              onChange={(e) => {
                setGroupName(e.target.value);
                if (error) setError(""); 
              }}
              disabled={isCreating}
            />
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>

          <div className="flex justify-end gap-3 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isCreating}
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isCreating}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isCreating ? "กำลังสร้าง..." : "ยืนยันการสร้าง"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}