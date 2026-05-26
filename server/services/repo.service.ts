import axios from "axios";
import { prisma } from "../lib/prisma.js";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { randomUUID } from "crypto";
import AdmZip from "adm-zip";
import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";
import { Worker } from "worker_threads";

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
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
    };

    const axiosInstance = axios.create({ timeout: 30_000 }); // ① timeout กลาง

    try {
      // ② สร้าง tempDir พร้อมกับดึง repo info แทนที่จะรอทีละขั้น
      const [infoRes, tempDir] = await Promise.all([
        axiosInstance.get(`https://api.github.com/repos/${owner}/${repo}`, {
          headers,
        }),
        fs.mkdtemp(path.join(os.tmpdir(), "wallet-")), // ③ mkdtemp ปลอดภัยกว่า mkdir
      ]);

      const branch = infoRes.data.default_branch;
      const zipFilePath = path.join(tempDir, `${repo}.zip`);
      const extractPath = path.join(tempDir, "extracted");

      await fs.mkdir(extractPath, { recursive: true });

      // ④ Stream แทน arraybuffer — ไม่โหลดทั้งก้อนเข้า RAM
      const zipUrl = `https://api.github.com/repos/${owner}/${repo}/zipball/${branch}`;
      const response = await axiosInstance.get(zipUrl, {
        responseType: "stream",
        headers,
      });

      await pipeline(response.data, createWriteStream(zipFilePath));

      await new Promise<void>((resolve, reject) => {
        const worker = new Worker(
          `
        const { workerData } = require('worker_threads');
        const AdmZip = require('adm-zip');
        try {
          const zip = new AdmZip(workerData.zipFilePath);
          zip.extractAllTo(workerData.extractPath, true);
          process.exit(0);
        } catch (e) {
          process.exit(1);
        }
        `,
          {
            eval: true,
            workerData: { zipFilePath, extractPath },
          },
        );
        worker.on("exit", (code) =>
          code === 0
            ? resolve()
            : reject(new Error(`Extraction failed: ${code}`)),
        );
      });

      const extractedFolders = await fs.readdir(extractPath);
      if (!extractedFolders[0]) throw new Error("Repository is empty");

      await fs.unlink(zipFilePath).catch(() => {});

      return {
        repoInfo: infoRes.data,
        sourceCodePath: path.join(extractPath, extractedFolders[0]),
        tempDirToCleanUp: tempDir,
      };
    } catch (error: any) {
      console.error("Download Repo Error:", error.message);
      throw error;
    }
  },
};

export default RepoService;
