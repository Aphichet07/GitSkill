"use client";

import { useState, useEffect } from "react";
import axios from "axios";

function Test() {
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  const [token, setToken] = useState("");
  const [owner, setOwner] = useState("facebook");
  const [repo, setRepo] = useState("react");
  const [filePath, setFilePath] = useState("README.md");

  const [resultJSON, setResultJSON] = useState<any>(null);
  const [sourceCode, setSourceCode] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [currentAction, setCurrentAction] = useState("");

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const res : any = await axios.get("http://localhost:8000/auth/status", {
          withCredentials: true,
        });

        if (res.data.isAuthenticated) {
          setIsAuthenticated(true);
          setUserData(res.data.user);
          console.log("data: ", res.data);

          if (res.data.user?.githubAccessToken) {
            setToken(res.data.user.githubAccessToken);
          }
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth Status Error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, []);

  const getHeaders = () => ({
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      Accept: "application/vnd.github.v3+json",
    },
  });

  const clearScreen = () => {
    setResultJSON(null);
    setSourceCode(null);
  };

  const handleFetchUser = async () => {
    try {
      clearScreen();
      setLoading(true);
      setCurrentAction("Fetching User Profile (/user)");
      const res = await axios.get("https://api.github.com/user", getHeaders());
      setResultJSON(res.data);
    } catch (err: any) {
      setResultJSON(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchAllRepos = async () => {
    try {
      clearScreen();
      setLoading(true);
      setCurrentAction("Fetching All Repos (/user/repos)");
      const res = await axios.get("https://api.github.com/user/repos", {
        ...getHeaders(),
        params: { sort: "updated", per_page: 5 },
      });
      setResultJSON(res.data);
    } catch (err: any) {
      setResultJSON(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchRepoInfo = async () => {
    try {
      clearScreen();
      setLoading(true);
      setCurrentAction(`Fetching Repo Info (/repos/${owner}/${repo})`);
      const res = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}`,
        getHeaders(),
      );
      setResultJSON(res.data);
    } catch (err: any) {
      setResultJSON(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchTree = async () => {
    try {
      clearScreen();
      setLoading(true);
      setCurrentAction("Fetching Repo Tree (Git Trees)");
      const repoInfo = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}`,
        getHeaders(),
      );
      const branch = repoInfo.data.default_branch;

      const res = await axios.get(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`,
        getHeaders(),
      );
      setResultJSON(res.data);
    } catch (err: any) {
      setResultJSON(err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleAnalyzeScore = async () => {
    try {
      clearScreen();
      setLoading(true);
      setCurrentAction(
        `Analyzing & Scoring (${owner}/${repo}) ...อาจใช้เวลาสักครู่`,
      );

      const url = `http://localhost:8000/api/score/analyze/${owner}/${repo}`;

      const res = await axios.post(
        url,
        {},
        {
          withCredentials: true,
        },
      );

      setResultJSON(res.data);
    } catch (err: any) {
      setResultJSON(err.response?.data || "Error analyzing project.");
    } finally {
      setLoading(false);
    }
  };

  const handleFetchSourceCode = async () => {
    try {
      clearScreen();
      setLoading(true);
      setCurrentAction(`Fetching Source Code (${filePath})`);

      const url = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

      const res = await axios.get(url, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
          Accept: "application/vnd.github.v3.raw",
        },
        responseType: "text",
      });

      setSourceCode(res.data);
    } catch (err: any) {
      console.error("Fetch Source Error:", err.response || err);
      setResultJSON(
        err.response?.data ||
          "Error: File not found, is binary, or CORS blocked.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div style={centerStyle}>
        <h2>⏳ กำลังตรวจสอบสิทธิ์การเข้าใช้งาน...</h2>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div style={centerStyle}>
        <h2>คุณต้องเข้าสู่ระบบก่อนใช้งาน API Tester</h2>
        <p>
          เพื่อดึงข้อมูล Repository ระบบจำเป็นต้องใช้สิทธิ์จาก GitHub ของคุณ
        </p>

        <button
          onClick={() => {
            window.location.href = "http://localhost:8000/auth/github";
          }}
          style={{
            ...btnStyle,
            backgroundColor: "#24292e",
            fontSize: "16px",
            marginTop: "20px",
          }}
        >
          Login with GitHub
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "sans-serif",
        maxWidth: "1200px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>🛠️ GitHub API Tester</h2>
        <div>
          <span>
            👤 เข้าสู่ระบบโดย:{" "}
            <strong>{userData?.email || userData?.username || "User"}</strong>
          </span>
          <button
            onClick={async () => {
              await axios.post(
                "http://localhost:8000/auth/logout",
                {},
                { withCredentials: true },
              );
              window.location.reload();
            }}
            style={{
              ...btnStyle,
              backgroundColor: "#dc3545",
              marginLeft: "15px",
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <hr style={{ marginBottom: "20px" }} />

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="GitHub Token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          style={{ padding: "8px", width: "250px" }}
        />
        <input
          type="text"
          placeholder="Owner"
          value={owner}
          onChange={(e) => setOwner(e.target.value)}
          style={{ padding: "8px" }}
        />
        <input
          type="text"
          placeholder="Repo"
          value={repo}
          onChange={(e) => setRepo(e.target.value)}
          style={{ padding: "8px" }}
        />
        <input
          type="text"
          placeholder="File Path"
          value={filePath}
          onChange={(e) => setFilePath(e.target.value)}
          style={{ padding: "8px" }}
        />
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <button onClick={handleFetchUser} style={btnStyle}>
          Get User Profile
        </button>
        <button onClick={handleFetchAllRepos} style={btnStyle}>
          Get All Repos
        </button>
        <button onClick={handleFetchRepoInfo} style={btnStyle}>
          Get Repo Info
        </button>
        <button onClick={handleFetchTree} style={btnStyle}>
          Get Repo Tree
        </button>
        <button
          onClick={handleFetchSourceCode}
          style={{ ...btnStyle, backgroundColor: "#28a745" }}
        >
          Show Source Code
        </button>
        <button
          onClick={handleAnalyzeScore}
          style={{
            ...btnStyle,
            backgroundColor: "#ffc107",
            color: "#000",
            fontWeight: "bold",
          }}
        >
          Analyze Score
        </button>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      >
        <div
          style={{ backgroundColor: "#333", color: "white", padding: "10px" }}
        >
          <strong>Status:</strong> {loading ? "⏳ Loading..." : "✅ Ready"} |{" "}
          <strong>Action:</strong> {currentAction || "None"}
        </div>
        <pre
          style={{
            backgroundColor: "#1e1e1e",
            color: sourceCode ? "#e6e6e6" : "#00ff00",
            padding: "20px",
            margin: 0,
            height: "60vh",
            overflowY: "auto",
            fontSize: "14px",
            fontFamily: "'Courier New', Courier, monospace",
          }}
        >
          {sourceCode !== null
            ? sourceCode
            : resultJSON
              ? JSON.stringify(resultJSON, null, 2)
              : "// ผลลัพธ์ API หรือโค้ด จะแสดงที่นี่..."}
        </pre>
      </div>
    </div>
  );
}

const btnStyle = {
  padding: "10px 15px",
  color: "white",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
  backgroundColor: "#007bff",
};
const centerStyle = {
  display: "flex",
  flexDirection: "column" as const,
  alignItems: "center",
  justifyContent: "center",
  height: "80vh",
  textAlign: "center" as const,
};

export default Test;
