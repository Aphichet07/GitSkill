import axios from "axios";
import { prisma } from "../lib/prisma.js";

const RepoService = {
  async findUser(userId: number) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { githubAccessToken: true },
    });

    if (!user){
        throw Error("ไม่มี user นี้ในระบบ")
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
};

export default RepoService;
