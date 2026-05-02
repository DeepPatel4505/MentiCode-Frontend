import api, { getApiAuthToken, getWsUrl } from "../../../lib/api";

const GITHUB_API_BASE = "https://api.github.com";
const MAX_IMPORTED_FILES = 60;
const MAX_FILE_BYTES = 80_000;
const MAX_TOTAL_BYTES = 2_500_000;

const languageByExtension = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    py: "python",
    java: "java",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    go: "go",
    rs: "rust",
    php: "php",
    rb: "ruby",
    swift: "swift",
    kt: "kotlin",
    html: "html",
    css: "css",
    scss: "scss",
    json: "json",
    yml: "yaml",
    yaml: "yaml",
    md: "markdown",
    sql: "sql",
    sh: "bash",
};

const allowedExtensions = new Set(Object.keys(languageByExtension));

function isBinaryContent(decoded) {
    // Heuristic: presence of null byte OR too many non-printable chars
    let nonPrintable = 0;

    for (let i = 0; i < decoded.length; i++) {
        const code = decoded.charCodeAt(i);

        if (code === 0) return true; // null byte = binary

        if (code < 32 && code !== 9 && code !== 10 && code !== 13) {
            nonPrintable++;
        }
    }

    return nonPrintable / decoded.length > 0.3;
}

function getFileExtension(path = "") {
    const normalized = String(path).toLowerCase();
    if (!normalized.includes(".")) {
        return "";
    }

    return normalized.split(".").pop() || "";
}

function getLanguageFromFileName(name = "") {
    const ext = getFileExtension(name);
    return languageByExtension[ext] || "plaintext";
}

function sanitizeRepoName(name = "") {
    const trimmed = String(name).trim();
    if (!trimmed) {
        return "GitHub Playground";
    }

    return trimmed.slice(0, 80);
}

let cachedGithubToken = null;

async function getGithubToken() {
    if (cachedGithubToken) {
        console.log("✅ Using cached GitHub token");
        return cachedGithubToken;
    }
    
    try {
        const userRes = await api.get("/auth/me");
        cachedGithubToken = userRes?.data?.user?.githubAccessToken || null;
        
        if (cachedGithubToken) {
            console.log("✅ Fetched GitHub token from /auth/me (authenticated request)");
            return cachedGithubToken;
        }

        // Token is missing - try to refresh it
        console.warn("⚠️ GitHub token is missing. Attempting to refresh...");
        try {
            const refreshRes = await api.get("/auth/github/token/refresh");
            if (refreshRes?.data?.data?.token) {
                cachedGithubToken = refreshRes.data.data.token;
                console.log("✅ Refreshed GitHub token");
                return cachedGithubToken;
            }
        } catch (refreshError) {
            console.error("❌ Failed to refresh token. You must RE-LOGIN with GitHub:");
            console.error("   1. Click your profile avatar");
            console.error("   2. Click 'Logout'");
            console.error("   3. Click 'Sign in with GitHub'");
            console.error("   4. Complete GitHub authentication");
            console.error("   5. Try again");
            throw new Error("GitHub token missing. Please re-login with GitHub to save your access token.");
        }
    } catch (error) {
        console.error("Error getting GitHub token:", error.message);
        throw error;
    }
}

async function githubGetJson(pathname) {
    let githubToken;
    try {
        githubToken = await getGithubToken();
    } catch (error) {
        console.error("Cannot fetch GitHub data:", error.message);
        throw error;
    }

    const headers = {
        Accept: "application/vnd.github+json",
    };

    // Add GitHub token if available (for authenticated requests)
    if (githubToken) {
        headers.Authorization = `Bearer ${githubToken}`;
        console.log(`📡 GitHub API request WITH auth: ${pathname}`);
    } else {
        console.error(`❌ GitHub API request WITHOUT auth (rate limited): ${pathname}`);
    }

    const response = await fetch(`${GITHUB_API_BASE}${pathname}`, {
        headers,
    });

    if (!response.ok) {
        const payload = await response.text();
        let errorMsg = payload;
        try {
            const parsed = JSON.parse(payload);
            errorMsg = parsed.message || payload;
        } catch (e) {
            // payload is not JSON
        }
        console.error(`❌ GitHub API Error (${response.status}): ${errorMsg}`);
        throw new Error(errorMsg || `GitHub request failed (${response.status})`);
    }

    return response.json();
}

function decodeBase64Utf8(base64Value = "") {
    const binary = atob(String(base64Value || "").replace(/\n/g, ""));
    const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));

    return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

export const createPlayground = async (payload) => {
    try {
        const res = await api.post(`/analysis/playgrounds`, payload);
        return res.data;
    } catch (error) {
        throw new Error(
            error?.error || error?.message || "Failed to create playground",
        );
    }
};

export const getPlaygrounds = async () => {
    try {
        const res = await api.get(`/analysis/playgrounds`);
        return res.data;
    } catch (error) {
        throw new Error(
            error?.error || error?.message || "Failed to fetch playgrounds",
        );
    }
};

export const deletePlayground = async (playgroundId) => {
    try {
        const res = await api.delete(`/analysis/playgrounds/${playgroundId}`);
        return res.data;
    } catch (error) {
        throw new Error(
            error?.error || error?.message || "Failed to delete playground",
        );
    }
};

export const getFiles = async (playgroundId) => {
    try {
        const res = await api.get(
            `/analysis/playgrounds/${playgroundId}/files`,
        );
        return res.data;
    } catch (error) {
        throw new Error(
            error?.error || error?.message || "Failed to fetch files",
        );
    }
};

export const startAnalysis = async (playgroundId, fileId) => {
    try {
        const res = await api.post(
            `/analysis/playgrounds/${playgroundId}/files/${fileId}/analyze`,
        );
        return res.data;
    } catch (error) {
        throw new Error(
            error?.error || error?.message || "Failed to start analysis",
        );
    }
};

export const getJobResult = async (jobId) => {
    try {
        const res = await api.get(`/analysis/jobs/${jobId}/result`);
        return res.data;
    } catch (error) {
        throw new Error(
            error?.error || error?.message || "Failed to fetch result",
        );
    }
};

export const getJobStatus = async (jobId) => {
    try {
        const res = await api.get(`/analysis/jobs/${jobId}`);
        return res.data;
    } catch (error) {
        throw new Error(
            error?.error || error?.message || "Failed to fetch job status",
        );
    }
};

export const createWS = () => {
    const token = getApiAuthToken();
    return new WebSocket(`${getWsUrl("/ws")}?token=${token || ""}`);
};

export const getGithubPublicRepos = async (usernameOrGithubId) => {
    const rawIdentifier = String(usernameOrGithubId || "").trim();
    if (!rawIdentifier) {
        return [];
    }

    let normalizedUsername = rawIdentifier;

    if (/^\d+$/.test(rawIdentifier)) {
        const githubUser = await githubGetJson(`/user/${rawIdentifier}`);
        normalizedUsername = String(githubUser?.login || "").trim();
    }

    if (!normalizedUsername) {
        return [];
    }

    const repos = await githubGetJson(
        `/users/${encodeURIComponent(normalizedUsername)}/repos?sort=updated&per_page=30&type=owner`,
    );

    return Array.isArray(repos)
        ? repos.map((repo) => ({
              id: String(repo.id),
              name: repo.name,
              fullName: repo.full_name,
              owner: repo.owner?.login || normalizedUsername,
              primaryLanguage: repo.language || "Unknown",
              stars: Number(repo.stargazers_count || 0),
              forks: Number(repo.forks_count || 0),
              openIssues: Number(repo.open_issues_count || 0),
              defaultBranch: repo.default_branch || "main",
              visibility: repo.private ? "private" : "public",
              updatedAt: repo.updated_at,
              htmlUrl: repo.html_url,
              sizeKb: Number(repo.size || 0),
          }))
        : [];
};

export const sendGithubRepoToPlayground = async ({
    owner,
    repoName,
    defaultBranch,
}) => {
    if (!owner || !repoName) {
        throw new Error("Owner and repository name are required.");
    }

    const treeResult = await githubGetJson(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/git/trees/${encodeURIComponent(defaultBranch || "main")}?recursive=1`,
    );

    const entries = Array.isArray(treeResult?.tree) ? treeResult.tree : [];
    const sortedCandidates = entries
        .filter((entry) => entry?.type === "blob")
        .filter(
            (entry) =>
                Number(entry.size || 0) > 0 &&
                Number(entry.size || 0) <= MAX_FILE_BYTES,
        )
        .sort((a, b) => Number(a.size || 0) - Number(b.size || 0));

    const candidates = [];
    let totalBytes = 0;

    for (const entry of sortedCandidates) {
        if (candidates.length >= MAX_IMPORTED_FILES) {
            break;
        }

        const size = Number(entry.size || 0);
        if (totalBytes + size > MAX_TOTAL_BYTES) {
            continue;
        }

        candidates.push(entry);
        totalBytes += size;
    }

    if (candidates.length === 0) {
        throw new Error(
            "No supported text/code files found in this repository.",
        );
    }

    const files = await Promise.all(
        candidates.map(async (entry) => {
            const blob = await githubGetJson(
                `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/git/blobs/${encodeURIComponent(entry.sha)}`,
            );

            const decoded = decodeBase64Utf8(blob.content || "");
            if (isBinaryContent(decoded)) {
                return null;
            }
            return {
                name: entry.path,
                language: getLanguageFromFileName(entry.path),
                content: decoded,
            };
        }),
    );

    const payload = {
        name: sanitizeRepoName(repoName),
        sourceType: "upload",
        files,
    };

    return createPlayground(payload);
};


export async function fetchFileContent(fileId) {
    const res = await api.get(`/analysis/files/${fileId}/content`, {
        credentials: "include",
    });

    if (res.statusText != "OK") {
        throw new Error("Failed to fetch file content");
    }

    return res.data;
}