import axios from "axios";
import { prisma } from "../lib/prisma.js";

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
      // ตรวจสอบว่า repo มี owner ติดมาด้วยหรือไม่ (เช่น "Aphichet/GitSkill")
      // ถ้ามีแล้ว ให้ใช้ repo เลย แต่ถ้ามีแค่ชื่อ repo ให้เอา owner มาต่อ
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
          !file.path.includes("dist")
      );

      const topFiles = files.slice(0, 10);

      const contents = await Promise.all(
        topFiles.map(async (file: any) => {
          const content = await this.fetchFileContent(
            token,
            owner, 
            repo,
            file.path
          );
          
          return `--- File: ${file.path} ---\n${content.content}\n`;
        })
      );

      return contents.join("\n");
      
    } catch (error: any) {
      console.error("Error in getFullRepoCode:", error.message);
      throw error;
    }
  }
};

export default RepoService;
