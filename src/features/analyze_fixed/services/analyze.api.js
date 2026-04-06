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

async function githubGetJson(pathname) {
    const response = await fetch(`${GITHUB_API_BASE}${pathname}`, {
        headers: {
            Accept: "application/vnd.github+json",
        },
    });

    if (!response.ok) {
        const payload = await response.text();
        throw new Error(payload || `GitHub request failed (${response.status})`);
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
        throw new Error(error?.error || error?.message || "Failed to create playground");
    }
};

export const getPlaygrounds = async () => {
    try {
        const res = await api.get(`/analysis/playgrounds`);
        return res.data;
    } catch (error) {
        throw new Error(error?.error || error?.message || "Failed to fetch playgrounds");
    }
};

export const deletePlayground = async (playgroundId) => {
    try {
        const res = await api.delete(`/analysis/playgrounds/${playgroundId}`);
        return res.data;
    } catch (error) {
        throw new Error(error?.error || error?.message || "Failed to delete playground");
    }
};

export const getFiles = async (playgroundId) => {
    try {
        const res = await api.get(`/analysis/playgrounds/${playgroundId}/files`);
        console.log("Fetched files:", res.data);
        return res.data;
    } catch (error) {
        throw new Error(error?.error || error?.message || "Failed to fetch files");
    }
};

export const startAnalysis = async (playgroundId, fileId) => {
    try {
        const res = await api.post(
            `/analysis/playgrounds/${playgroundId}/files/${fileId}/analyze`,
        );
        return res.data;
    } catch (error) {
        throw new Error(error?.error || error?.message || "Failed to start analysis");
    }
};

export const getJobResult = async (jobId) => {
    try {
        const res = await api.get(`/analysis/jobs/${jobId}/result`);
        return res.data;
    } catch (error) {
        throw new Error(error?.error || error?.message || "Failed to fetch result");
    }
};

export const getJobStatus = async (jobId) => {
    try {
        const res = await api.get(`/analysis/jobs/${jobId}`);
        return res.data;
    } catch (error) {
        throw new Error(error?.error || error?.message || "Failed to fetch job status");
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

export const sendGithubRepoToPlayground = async ({ owner, repoName, defaultBranch }) => {
    if (!owner || !repoName) {
        throw new Error("Owner and repository name are required.");
    }

    const treeResult = await githubGetJson(
        `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/git/trees/${encodeURIComponent(defaultBranch || "main")}?recursive=1`,
    );

    const entries = Array.isArray(treeResult?.tree) ? treeResult.tree : [];
    const sortedCandidates = entries
        .filter((entry) => entry?.type === "blob")
        .filter((entry) => {
            const ext = getFileExtension(entry.path);
            return allowedExtensions.has(ext);
        })
        .filter((entry) => Number(entry.size || 0) > 0 && Number(entry.size || 0) <= MAX_FILE_BYTES)
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
        throw new Error("No supported text/code files found in this repository.");
    }

    const files = await Promise.all(
        candidates.map(async (entry) => {
            const blob = await githubGetJson(
                `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repoName)}/git/blobs/${encodeURIComponent(entry.sha)}`,
            );

            const decoded = decodeBase64Utf8(blob.content || "");

            return {
                name: entry.path,
                language: getLanguageFromFileName(entry.path),
                storagePath: `inline://${encodeURIComponent(decoded)}`,
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