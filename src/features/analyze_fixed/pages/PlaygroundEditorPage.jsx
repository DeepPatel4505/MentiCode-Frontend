import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ShieldCheck, ArrowLeft, PanelLeft, PanelRight } from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { getNodeByPath, updateFileNode } from "../utils/fileTree";
import { createWS } from "../services/analyze.api";
import { useAuth } from "../../auth/hooks/useAuth";
import {
    analysisQueryKeys,
    getStoredJobIdForFile,
    useJobResultQuery,
    useJobStatusQuery,
    usePlaygroundFilesQuery,
    useStartAnalysisMutation,
} from "../queries/analysisQueries";

// Component imports
import FileTree from "../components/FileTree.jsx";
import { EditorPanel } from "../components/EditorPanel.jsx";
import AuditPanel from "../components/AuditPanel.jsx";

const AUDIT_TABS = ["All", "Critical", "Major", "Minor"];

export const DEFAULT_FILE_MESSAGE = "// Select a file to view its content";

const DEFAULT_NEW_FILE_MESSAGE = "// File content is not available yet";

function decodeInlineStoragePath(storagePath) {
    if (
        typeof storagePath !== "string" ||
        !storagePath.startsWith("inline://")
    ) {
        return DEFAULT_NEW_FILE_MESSAGE;
    }

    const encodedContent = storagePath.slice("inline://".length);

    try {
        return decodeURIComponent(encodedContent);
    } catch {
        return DEFAULT_NEW_FILE_MESSAGE;
    }
}

function buildTreeFromApiFiles(files) {
    const tree = {};
    const pathToId = {};

    files.forEach((file, index) => {
        const fallbackName = file?.name || `file-${index + 1}.txt`;
        const parts = fallbackName.split("/").filter(Boolean);

        if (!parts.length) {
            return;
        }

        let cursor = tree;
        for (let i = 0; i < parts.length - 1; i += 1) {
            const folder = parts[i];
            if (!cursor[folder] || typeof cursor[folder] !== "object") {
                cursor[folder] = {};
            }
            cursor = cursor[folder];
        }

        const fileName = parts[parts.length - 1];
        cursor[fileName] = decodeInlineStoragePath(file?.storagePath);

        const fullPath = parts.join("/");
        if (file?.id) {
            pathToId[fullPath] = file.id;
        }
    });

    return { tree, pathToId };
}

function getFirstFilePath(node, path = "") {
    if (!node || typeof node !== "object") {
        return null;
    }

    const sortedEntries = Object.entries(node).sort(([leftName, leftValue], [rightName, rightValue]) => {
        const leftIsFolder = leftValue !== null && typeof leftValue === "object";
        const rightIsFolder = rightValue !== null && typeof rightValue === "object";
        const leftRank = leftIsFolder ? 0 : 1;
        const rightRank = rightIsFolder ? 0 : 1;

        if (leftRank !== rightRank) {
            return leftRank - rightRank;
        }

        return leftName.localeCompare(rightName, undefined, {
            sensitivity: "base",
            numeric: true,
        });
    });

    for (const [key, value] of sortedEntries) {
        const currentPath = path ? `${path}/${key}` : key;
        if (typeof value === "string") {
            return currentPath;
        }

        const nestedPath = getFirstFilePath(value, currentPath);
        if (nestedPath) {
            return nestedPath;
        }
    }

    return null;
}

function getExpandedFolderMap(path) {
    const updates = {};
    let currentPath = "";

    path.split("/").forEach((part) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        updates[currentPath] = true;
    });

    return updates;
}

function handleEditorDidMount(editor, monaco) {
    monaco.editor.defineTheme("menticode-dark", {
        base: "vs-dark",
        inherit: true,
        rules: [],
        colors: {
            "editor.background": "#0d1117",
            "editorLineNumber.foreground": "#475569",
        },
    });

    monaco.editor.setTheme("menticode-dark");
}

function getErrorMessage(error) {
    if (!error) {
        return null;
    }

    if (typeof error === "string") {
        return error;
    }

    return error.message || "Something went wrong";
}

const PlaygroundEditorPage = () => {
    const { id: playgroundId } = useParams();
    const [searchParams] = useSearchParams();
    const { accessToken } = useAuth();
    const queryClient = useQueryClient();
    const targetFileId = searchParams.get("fileId");

    const [auditTab, setAuditTab] = useState("All");
    const [filetree, setFiletree] = useState({});
    const [filePathToIdMap, setFilePathToIdMap] = useState({});
    const [isExplorerOpen, setIsExplorerOpen] = useState(true);
    const [isAuditOpen, setIsAuditOpen] = useState(true);
    const [activeFile, setActiveFile] = useState(null);
    const [expandedFolders, setExpandedFolders] = useState({});
    const [fileId, setFileId] = useState(null);
    const [currentJobId, setCurrentJobId] = useState(null);
    const [wsError, setWsError] = useState(null);

    const playgroundFilesQuery = usePlaygroundFilesQuery(
        playgroundId,
        Boolean(accessToken),
    );

    const startAnalysisMutation = useStartAnalysisMutation(
        playgroundId,
        fileId,
        (nextJobId) => {
            setWsError(null);
            setCurrentJobId(nextJobId);
        },
    );

    const jobStatusQuery = useJobStatusQuery(currentJobId, Boolean(accessToken));
    const jobStatus = (jobStatusQuery.data?.status || "").toLowerCase();

    const resultQuery = useJobResultQuery(
        currentJobId,
        Boolean(accessToken && jobStatus === "completed"),
    );

    const analysis = resultQuery.data;
    const playground = playgroundFilesQuery.data?.playground || null;

    const isJobRunning =
        startAnalysisMutation.isPending ||
        ["queued", "pending", "running", "processing"].includes(jobStatus) ||
        (Boolean(currentJobId) && !jobStatus && jobStatusQuery.isFetching);

    const queryError =
        startAnalysisMutation.error ||
        playgroundFilesQuery.error ||
        jobStatusQuery.error ||
        resultQuery.error;

    const errorMessage =
        wsError ||
        (jobStatus === "failed" ? "Analysis failed" : getErrorMessage(queryError));

    const summary = analysis?.summary || {
        risk_level: "low",
        overall_quality: 0,
    };

    const findings = analysis?.findings || [];

    const editorRef = React.useRef(null);
    const monacoRef = React.useRef(null);
    const highlightDecorationIdsRef = React.useRef([]);
    const editorChangeDisposableRef = React.useRef(null);

    const clearJumpHighlight = () => {
        if (!editorRef.current) {
            return;
        }

        highlightDecorationIdsRef.current = editorRef.current.deltaDecorations(
            highlightDecorationIdsRef.current,
            [],
        );
    };

    const filteredFindings = findings.filter((f) => {
        if (auditTab === "All") return true;
        return f.severity?.toLowerCase() === auditTab.toLowerCase();
    });

    const toggleFolder = (path) => {
        setExpandedFolders((prev) => ({
            ...prev,
            [path]: !prev[path],
        }));
    };

    const getFileContent = (path) => {
        const fileContent = getNodeByPath(filetree, path);
        return typeof fileContent === "string"
            ? fileContent
            : DEFAULT_FILE_MESSAGE;
    };

    const getLanguageFromFileName = (fileName) => {
        const extension = fileName?.split(".").pop()?.toLowerCase();
        const extensionToLanguageMap = {
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
        return extensionToLanguageMap[extension] || "plaintext";
    };

    const activeLanguage = getLanguageFromFileName(activeFile);

    const analyzeCode = async () => {
        if (isJobRunning || startAnalysisMutation.isPending) {
            return;
        }

        if (!accessToken) {
            setWsError("Authentication required");
            return;
        }

        if (!playgroundId || !fileId) {
            setWsError("Playground file is not ready yet");
            return;
        }

        setWsError(null);
        startAnalysisMutation.mutate();
    };

    const handleEditorChange = (value) => {
        setFiletree((prev) => updateFileNode(prev, activeFile, value ?? ""));
    };

    const handleEditorMount = (editor, monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;

        editorChangeDisposableRef.current?.dispose();
        editorChangeDisposableRef.current = editor.onDidChangeModelContent(
            (event) => {
                if (!event.isFlush) {
                    clearJumpHighlight();
                }
            },
        );

        handleEditorDidMount(editor, monaco);
    };

    const handleJumpToLine = (finding) => {
        if (!editorRef.current || !monacoRef.current) {
            return;
        }

        const [start, end] = finding?.line_range || [];

        const lineNumber = Number(start);
        if (!Number.isInteger(lineNumber) || lineNumber < 1) {
            return;
        }

        const parsedEnd = Number(end);
        const endLine =
            Number.isInteger(parsedEnd) && parsedEnd >= lineNumber
                ? parsedEnd
                : lineNumber;
        const severity = (finding?.severity || "minor").toLowerCase();
        const severityColorMap = {
            critical: "rgba(248, 113, 113, 0.8)",
            major: "rgba(250, 204, 21, 0.85)",
            minor: "rgba(96, 165, 250, 0.8)",
        };
        const safeSeverity = severityColorMap[severity] ? severity : "minor";

        editorRef.current.revealLineInCenter(lineNumber);

        highlightDecorationIdsRef.current = editorRef.current.deltaDecorations(
            highlightDecorationIdsRef.current,
            [
                {
                    range: new monacoRef.current.Range(
                        lineNumber,
                        1,
                        endLine,
                        1,
                    ),
                    options: {
                        isWholeLine: true,
                        className: `lint-highlight lint-highlight--${safeSeverity}`,
                        linesDecorationsClassName: `lint-gutter lint-gutter--${safeSeverity}`,
                        overviewRuler: {
                            color: severityColorMap[safeSeverity],
                            position:
                                monacoRef.current.editor.OverviewRulerLane
                                    .Right,
                        },
                    },
                },
            ],
        );

        editorRef.current.setPosition({ lineNumber, column: 1 });
        editorRef.current.focus();
    };

    useEffect(() => {
        if (!editorRef.current || !monacoRef.current || !activeFile) {
            return;
        }

        const model = editorRef.current.getModel();
        if (!model) {
            return;
        }

        monacoRef.current.editor.setModelLanguage(model, activeLanguage);
    }, [activeFile, activeLanguage]);

    useEffect(() => {
        return () => {
            editorChangeDisposableRef.current?.dispose();
        };
    }, []);

    useEffect(() => {
        if (!activeFile) {
            return;
        }

        clearJumpHighlight();

        const updates = getExpandedFolderMap(activeFile);
        setExpandedFolders((prev) => ({ ...prev, ...updates }));
    }, [activeFile]);

    useEffect(() => {
        if (!activeFile) {
            setFileId(null);
            return;
        }

        setFileId(filePathToIdMap[activeFile] ?? null);
    }, [activeFile, filePathToIdMap]);

    useEffect(() => {
        const files = playgroundFilesQuery.data?.files;
        if (!Array.isArray(files)) {
            return;
        }

        if (files.length > 0) {
            const { tree, pathToId } = buildTreeFromApiFiles(files);
            setFiletree((prev) => (Object.keys(prev).length ? prev : tree));
            setFilePathToIdMap(pathToId);
            setActiveFile((prev) => prev ?? getFirstFilePath(tree));
        } else {
            setFiletree({});
            setFilePathToIdMap({});
            setActiveFile(null);
        }
    }, [playgroundFilesQuery.data]);

    useEffect(() => {
        if (!targetFileId || !filePathToIdMap || Object.keys(filePathToIdMap).length === 0) {
            return;
        }

        const targetEntry = Object.entries(filePathToIdMap).find(
            ([, mappedFileId]) => mappedFileId === targetFileId,
        );

        if (!targetEntry) {
            return;
        }

        const [targetPath] = targetEntry;
        setActiveFile(targetPath);
    }, [targetFileId, filePathToIdMap]);

    useEffect(() => {
        if (!fileId) {
            setCurrentJobId(null);
            return;
        }

        const storedJobId = getStoredJobIdForFile(fileId);
        setCurrentJobId(storedJobId);
    }, [fileId]);

    useEffect(() => {
        if (!currentJobId || !accessToken) {
            return;
        }

        const ws = createWS();

        ws.onopen = () => {
            ws.send(
                JSON.stringify({
                    type: "subscribe",
                    jobId: currentJobId,
                }),
            );
        };

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === "job.completed" && data.jobId === currentJobId) {
                setWsError(null);
                queryClient.invalidateQueries({
                    queryKey: analysisQueryKeys.jobStatus(currentJobId),
                });
                queryClient.invalidateQueries({
                    queryKey: analysisQueryKeys.jobResult(currentJobId),
                });
            }

            if (data.type === "job.failed" && data.jobId === currentJobId) {
                setWsError("Analysis failed");
                queryClient.invalidateQueries({
                    queryKey: analysisQueryKeys.jobStatus(currentJobId),
                });
            }
        };

        ws.onerror = (err) => {
            console.error("WS error", err);
        };

        return () => ws.close();
    }, [currentJobId, accessToken, queryClient]);

    return (
        <div className="h-screen flex flex-col bg-[#0d1117] text-white overflow-hidden">
            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex overflow-hidden">
                {/* LEFT SIDEBAR - EXPLORER */}
                <div
                    className={`transition-all duration-300 ease-out border-r border-white/10 overflow-hidden h-full ${
                        isExplorerOpen
                            ? "w-60 opacity-100"
                            : "w-0 opacity-0"
                    }`}
                    style={{
                        minWidth: isExplorerOpen ? "240px" : "0px",
                        maxWidth: isExplorerOpen ? "260px" : "0px",
                    }}
                >
                    {isExplorerOpen && (
                        <div className="h-full flex flex-col">
                            <div className="px-4 py-3 border-b border-white/10 bg-[#0d1117] shrink-0">
                                <p className="text-[11px] uppercase tracking-wide text-[#64748b]">
                                    Playground
                                </p>
                                <div className="mt-1 flex items-center gap-2 min-w-0">
                                    <Link
                                        to="/analyze/playground"
                                        className="shrink-0 text-[#94a3b8] hover:text-white transition-colors p-1 -ml-1"
                                        title="Back to Playgrounds"
                                        aria-label="Back to Playgrounds"
                                    >
                                        <ArrowLeft size={16} />
                                    </Link>
                                    <h2 className="text-sm font-semibold text-white truncate" title={playground?.name || "Playground"}>
                                        {playground?.name || "Playground"}
                                    </h2>
                                </div>
                            </div>
                            <div className="flex-1 min-h-0">
                                <FileTree
                                    filetree={filetree}
                                    activeFile={activeFile}
                                    expandedFolders={expandedFolders}
                                    onToggleFolder={toggleFolder}
                                    onSelectFile={setActiveFile}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* CENTER AREA - EDITOR WITH TAB */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* FILE TAB/HEADER */}
                    <div className="flex items-center h-10 border-b border-white/10 bg-[#0d1117] px-4 gap-3">
                        <div className="flex-1 min-w-0 overflow-x-auto">
                            {activeFile ? (
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-t bg-white/5 border border-white/10 whitespace-nowrap">
                                    <span className="text-xs font-medium text-[#94a3b8]">
                                        {activeFile.split("/").pop()}
                                    </span>
                                </div>
                            ) : (
                                <span className="text-xs text-[#475569]">
                                    No file selected
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => setIsExplorerOpen(!isExplorerOpen)}
                                className={`p-1.5 rounded transition-colors ${
                                    isExplorerOpen
                                        ? "bg-white/10 text-white"
                                        : "text-[#94a3b8] hover:text-white"
                                }`}
                                title={isExplorerOpen ? "Hide Explorer" : "Show Explorer"}
                            >
                                <PanelLeft size={16} />
                            </button>

                            <button
                                onClick={() => setIsAuditOpen(!isAuditOpen)}
                                className={`p-1.5 rounded transition-colors ${
                                    isAuditOpen
                                        ? "bg-white/10 text-white"
                                        : "text-[#94a3b8] hover:text-white"
                                }`}
                                title={isAuditOpen ? "Hide Audit Panel" : "Show Audit Panel"}
                            >
                                <PanelRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* EDITOR */}
                    <div className="flex-1 overflow-hidden">
                        <EditorPanel
                            editorKey={activeFile ?? "no-file-selected"}
                            language={activeLanguage}
                            value={getFileContent(activeFile)}
                            beforeMount={(monaco) => {
                                monaco.languages.register({ id: "cpp" });
                            }}
                            onChange={handleEditorChange}
                            onMount={handleEditorMount}
                        />
                    </div>
                </div>

                {/* RIGHT SIDEBAR - AUDIT PANEL */}
                <div
                    className={`transition-all duration-300 ease-out border-l border-white/10 overflow-hidden h-full ${
                        isAuditOpen
                            ? "w-76 opacity-100"
                            : "w-0 opacity-0"
                    }`}
                    style={{
                        minWidth: isAuditOpen ? "304px" : "0px",
                        maxWidth: isAuditOpen ? "320px" : "0px",
                    }}
                >
                    {isAuditOpen && (
                        <AuditPanel
                            isAuditOpen={isAuditOpen}
                            setIsAuditOpen={setIsAuditOpen}
                            auditTab={auditTab}
                            setAuditTab={setAuditTab}
                            tabs={AUDIT_TABS}
                            filteredFindings={filteredFindings}
                            handleJumpToLine={handleJumpToLine}
                            loading={isJobRunning}
                            error={errorMessage}
                            summary={summary}
                            analyzeCode={analyzeCode}
                        />
                    )}
                </div>
            </div>

            {/* FOOTER */}
            <footer className="flex justify-between items-center px-4 py-2 border-t border-white/10 text-xs text-[#64748b] h-6">
                <div className="flex gap-4">
                    <span className="flex items-center gap-1">
                        <ShieldCheck size={14} className="text-green-400" />
                        Standard
                    </span>
                </div>

                <span className="text-amber-400 font-medium">
                    Menti Engine v3.0
                </span>
            </footer>
        </div>
    );
};

export default PlaygroundEditorPage;
