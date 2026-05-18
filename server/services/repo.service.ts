import axios from "axios";
import { prisma } from "../lib/prisma.js";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";
import AdmZip from "adm-zip";

const RepoService = {
  async getusername(accessToken: string) {
    const res = await axios.get("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });
    return res.data.login;
  },

  async findUser(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { githubAccessToken: true },
    });

    if (!user) {
      throw Error("ไม่มี user นี้ในระบบ");
    }
    return user;
  },

  async getUserRepos(accessToken: string) {
    try {
      const response = await axios.get("https://api.github.com/user/repos", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github.v3+json",
        },
        params: {
          sort: "updated",
          per_page: 100,
        },
      });
      const repos = response.data.map((repo: any) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        url: repo.html_url,
        language: repo.language,
        stars: repo.stargazers_count,
        updatedAt: repo.updated_at,
      }));

      return repos;
    } catch (error) {
      console.error("Error fetching GitHub repos:", error);
      throw new Error("Failed to fetch repositories from GitHub");
    }
  },

  async InformRepo(accessToken: string, repo: string) {
    const owner = await this.getusername(accessToken);

    try {
      const res = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github.v3+json",
          },
        },
      );
      const d = res.data;
      return {
        id: d.id,
        name: d.name,
        fullName: d.full_name,
        owner: d.owner.login,
        description: d.description,
        isPrivate: d.private,
        url: d.html_url,
        language: d.language,
        topics: d.topics,
        stars: d.stargazers_count,
        forks: d.forks_count,
        defaultBranch: d.default_branch,
        updatedAt: d.updated_at,
        createdAt: d.created_at,
        license: d.license?.name,
        size: d.size,
      };
    } catch (err: any) {
      console.log(err);
      throw Error(err);
    }
  },

  async RepoTree(accessToken: string, repo: string) {
    const owner = await this.getusername(accessToken);

    try {
      const repoInfo = await this.InformRepo(accessToken, repo);
      const branch = repoInfo.defaultBranch;

      const res = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/vnd.github+v3+json",
          },
        },
      );

      const d = res.data;

      return {
        sha: d.sha,
        tree: d.tree.map((file: any) => ({
          path: file.path, // path/to/file.ts
          type: file.type, // 'blob' (ไฟล์) หรือ 'tree' (โฟลเดอร์)
          size: file.size, // ขนาดไฟล์
          url: file.url, // URL สำหรับดึงเนื้อหาไฟล์
        })),
      };
    } catch (err: any) {
      console.error("RepoTree Error:", err.response?.data || err.message);
      throw err;
    }
  },
  async fetchFileContent(
    token: string,
    owner: string,
    repo: string,
    path: string,
  ) {
    try {
      const fullRepoName = repo.includes("/") ? repo : `${owner}/${repo}`;

      const response = await axios.get(
        `https://api.github.com/repos/${fullRepoName}/contents/${path}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        },
      );

      const data = response.data;

      if (data.type === "file" && data.content) {
        const decodedContent = Buffer.from(data.content, "base64").toString(
          "utf-8",
        );

        return {
          fileName: data.name,
          path: data.path,
          size: data.size,
          content: decodedContent,
        };
      }

      throw new Error("Target is not a file or content is empty");
    } catch (error) {
      throw error;
    }
  },
  async getFullRepoCode(token: string, owner: string, repo: string) {
    try {
      const treeData = await this.RepoTree(token, repo);

      const files = treeData.tree.filter(
        (file: any) =>
          file.type === "blob" &&
          (file.path.endsWith(".ts") ||
            file.path.endsWith(".js") ||
            file.path.endsWith(".tsx")) &&
          !file.path.includes("node_modules") &&
          !file.path.includes("dist"),
      );

      const topFiles = files.slice(0, 10);

      const contents = await Promise.all(
        topFiles.map(async (file: any) => {
          const content = await this.fetchFileContent(
            token,
            owner,
            repo,
            file.path,
          );

          return `--- File: ${file.path} ---\n${content.content}\n`;
        }),
      );

      return contents.join("\n");
    } catch (error: any) {
      console.error("Error in getFullRepoCode:", error.message);
      throw error;
    }
  },
  async fetchRawFileContent(
    token: string,
    owner: string,
    repo: string,
    branch: string,
    filePath: string,
  ) {
    try {
      const url = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${filePath}`;
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3.raw",
        },
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async downloadRepoForAnalysis(token: string, owner: string, repo: string) {
    try {
      // ดึงข้อมูล Repo โดยใช้ owner จาก Parameter โดยตรง 
      const infoRes = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );
      const branch = infoRes.data.default_branch;

      // สร้างโฟลเดอร์ชั่วคราว
      const tempDir = path.join(os.tmpdir(), `wallet-${randomUUID()}`);
      const zipFilePath = path.join(tempDir, `${repo}.zip`);
      const extractPath = path.join(tempDir, "extracted");

      await fs.mkdir(tempDir, { recursive: true });

      // โหลด .zip ของโค้ดทั้งโปรเจกต์
      const zipUrl = `https://api.github.com/repos/${owner}/${repo}/zipball/${branch}`;
      const response = await axios.get(zipUrl, {
        responseType: "arraybuffer",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.v3+json",
        },
      });

      await fs.writeFile(zipFilePath, response.data);

      // แตกไฟล์
      const zip = new AdmZip(zipFilePath);
      zip.extractAllTo(extractPath, true);

      // หาโฟลเดอร์ชั้นในสุดที่แตกออกมา
      const extractedFolders = await fs.readdir(extractPath);
      if (!extractedFolders[0]) {
        throw new Error("Repository is empty");
      }
      const sourceCodePath = path.join(extractPath, extractedFolders[0]);

      return {
        repoInfo: infoRes.data, // คืนค่าข้อมูล Repo กลับไปด้วย
        sourceCodePath, 
        tempDirToCleanUp: tempDir, 
      };
    } catch (error: any) {
      console.error("Download Repo Error:", error.message);
      throw error;
    }
  }
};

export default RepoService;
