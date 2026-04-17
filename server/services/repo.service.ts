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
          per_page: 10,
        },
      });

      const repos = response.data.map((repo: any) => ({
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
    console.log("owner -- >", owner);
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
};

export default RepoService;
