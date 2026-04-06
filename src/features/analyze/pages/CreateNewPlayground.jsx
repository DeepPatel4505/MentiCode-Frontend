import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { createPlayground, getPlaygrounds } from "../services/analyze.api.js";
import CreatePlaygroundOptionCard from "../components/createPlayground/CreatePlaygroundOptionCard.jsx";
import CreatePlaygroundCapacityMeter from "../components/createPlayground/CreatePlaygroundCapacityMeter.jsx";
import CreatePlaygroundUploadPreview from "../components/createPlayground/CreatePlaygroundUploadPreview.jsx";

const PLAYGROUND_LIMIT = 5;
const DEFAULT_PLAYGROUND_NAME = "Untitled Playground";
const YIELD_EVERY_FILES = 25;
const KNOWN_BINARY_EXTENSIONS = new Set([
    "exe",
    "dll",
    "bin",
    "so",
    "dylib",
    "class",
    "jar",
    "war",
    "zip",
    "tar",
    "gz",
    "7z",
    "rar",
    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp",
    "pdf",
    "mp3",
    "mp4",
    "mov",
]);

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

function getLanguageFromFileName(name) {
    const extension = name.split(".").pop()?.toLowerCase();
    return languageByExtension[extension] || "plaintext";
}

function getFileExtension(name = "") {
    return name.includes(".") ? name.split(".").pop()?.toLowerCase() : "";
}

function isSupportedUploadFile(file) {
    const relativePath = (file.webkitRelativePath || file.name || "").replace(/\\/g, "/");
    const extension = getFileExtension(relativePath);

    if (!extension) {
        return false;
    }

    if (KNOWN_BINARY_EXTENSIONS.has(extension)) {
        return false;
    }

    return allowedExtensions.has(extension);
}

function getPlaygroundNameFromFirstFile(firstFile) {
    if (!firstFile) {
        return DEFAULT_PLAYGROUND_NAME;
    }

    const relativePath = (firstFile.webkitRelativePath || "").replace(/\\/g, "/");
    if (relativePath.includes("/")) {
        const [rootFolderName] = relativePath.split("/");
        return rootFolderName || DEFAULT_PLAYGROUND_NAME;
    }

    return DEFAULT_PLAYGROUND_NAME;
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            resolve(typeof reader.result === "string" ? reader.result : "");
        };

        reader.onerror = () => {
            reject(reader.error || new Error("Failed to read file"));
        };

        reader.readAsText(file);
    });
}

export default function CreateNewPlayground() {
    const navigate = useNavigate();
    const location = useLocation();
    const { accessToken, loading } = useAuth();

    const [activeCount, setActiveCount] = useState(0);
    const [isLoadingUsage, setIsLoadingUsage] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [detectedFileCount, setDetectedFileCount] = useState(0);
    const [skippedFileCount, setSkippedFileCount] = useState(0);
    const [detectedFolderName, setDetectedFolderName] = useState("");
    const [isReadingFiles, setIsReadingFiles] = useState(false);
    const [readingProgress, setReadingProgress] = useState({
        processed: 0,
        total: 0,
    });
    const [error, setError] = useState("");
    const [uploadWarning, setUploadWarning] = useState("");
    const [playgroundName, setPlaygroundName] = useState("");

    const fromQuery = useMemo(() => {
        const params = new URLSearchParams(location.search);
        return params.get("from");
    }, [location.search]);

    const backPath = useMemo(() => {
        if (location.state?.from) {
            return location.state.from;
        }

        if (fromQuery === "dashboard") {
            return "/analyze";
        }

        return "/analyze/playground";
    }, [location.state, fromQuery]);

    useEffect(() => {
        if (loading) return; // ⛔ WAIT

        const fetchUsage = async () => {
            if (!accessToken) {
                setError("Please login to create a playground.");
                setIsLoadingUsage(false);
                return;
            }

            try {
                setIsLoadingUsage(true);
                const playgrounds = await getPlaygrounds();
                setActiveCount(
                    Array.isArray(playgrounds) ? playgrounds.length : 0,
                );
            } catch (fetchError) {
                setError(
                    fetchError?.message || "Failed to load playground usage.",
                );
            } finally {
                setIsLoadingUsage(false);
            }
        };

        fetchUsage();
    }, [accessToken, loading]);

    const hasCapacity = useMemo(
        () => activeCount < PLAYGROUND_LIMIT,
        [activeCount],
    );

    const handleCancel = () => {
        navigate(backPath);
    };

    const handleSelectFiles = async (event) => {
        const files = Array.from(event.target.files || []);
        const totalFiles = files.length;

        if (!totalFiles) {
            setDetectedFileCount(0);
            setSkippedFileCount(0);
            setDetectedFolderName("");
            setUploadedFiles([]);
            setUploadWarning("");
            setError("No files found in the selected folder.");
            event.target.value = "";
            return;
        }

        try {
            const nextPlaygroundName = getPlaygroundNameFromFirstFile(files[0]);
            setPlaygroundName(nextPlaygroundName);
            setDetectedFolderName(
                nextPlaygroundName === DEFAULT_PLAYGROUND_NAME
                    ? ""
                    : nextPlaygroundName,
            );
            setDetectedFileCount(totalFiles);
            setUploadWarning("");

            const validFiles = files.filter(isSupportedUploadFile);
            const skippedCount = totalFiles - validFiles.length;
            setSkippedFileCount(skippedCount);

            if (skippedCount > 0) {
                setUploadWarning(`Skipped unsupported files: ${skippedCount}`);
            }

            if (!validFiles.length) {
                setUploadedFiles([]);
                setIsReadingFiles(false);
                setReadingProgress({ processed: 0, total: 0 });
                setError("No supported text/code files found in the selected upload.");
                event.target.value = "";
                return;
            }

            setIsReadingFiles(true);
            setReadingProgress({ processed: 0, total: validFiles.length });

            const parsedFiles = [];

            for (let index = 0; index < validFiles.length; index += 1) {
                const file = validFiles[index];
                const relativePath = (
                    file.webkitRelativePath || file.name
                ).replace(/\\/g, "/");
                const content = await readFileAsText(file);

                parsedFiles.push({
                    id: `${relativePath}-${file.size}-${file.lastModified}`,
                    name: relativePath,
                    size: file.size,
                    language: getLanguageFromFileName(relativePath),
                    storagePath: `inline://${encodeURIComponent(content)}`,
                });

                const processed = index + 1;
                setReadingProgress({ processed, total: validFiles.length });

                if (processed % YIELD_EVERY_FILES === 0) {
                    await new Promise((resolve) => setTimeout(resolve, 0));
                }
            }

            setUploadedFiles((previousFiles) => {
                const fileMap = new Map(
                    previousFiles.map((file) => [file.id, file]),
                );

                parsedFiles.forEach((file) => {
                    fileMap.set(file.id, file);
                });

                return Array.from(fileMap.values());
            });

            setError("");
            event.target.value = "";
        } catch {
            setError("Failed to read selected files. Please try again.");
        } finally {
            setIsReadingFiles(false);
        }
    };

    const handleCreate = async () => {
        if (!hasCapacity || isSubmitting) {
            return;
        }

        const trimmedName = playgroundName.trim();

        if (!trimmedName) {
            setError("Enter a playground name before continuing.");
            return;
        }

        if (!uploadedFiles.length) {
            setError("Upload at least one file before creating a playground.");
            return;
        }

        try {
            setIsSubmitting(true);
            setError("");

            const payload = {
                name: trimmedName,
                sourceType: "upload",
                files: uploadedFiles.map((file) => ({
                    name: file.name,
                    language: file.language,
                    storagePath: file.storagePath,
                })),
            };

            const created = await createPlayground(payload);
            navigate(`/analyze/playground/${created.id}`);
        } catch (createError) {
            setError(createError?.message || "Unable to create playground.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-[hsl(240_10%_4%)] px-4 py-8 text-white sm:px-6 lg:px-10">
            <div className="mx-auto w-full max-w-4xl">
                <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                        <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-600">
                            Playground Setup
                        </p>
                        <h1 className="mt-2 mb-0 text-2xl font-semibold tracking-tight text-white">
                            Create a New Playground
                        </h1>
                    </div>

                    <div className="self-start sm:self-auto">
                        {isLoadingUsage ? (
                            <div className="rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2 text-xs text-neutral-500">
                                Loading usage…
                            </div>
                        ) : (
                            <CreatePlaygroundCapacityMeter
                                count={activeCount}
                                limit={PLAYGROUND_LIMIT}
                                compact
                            />
                        )}
                    </div>
                </header>

                <section className="rounded-lg border border-neutral-800 bg-neutral-900/80 p-5 sm:p-6">
                    {/* Name input */}
                    <div className="rounded-md border border-neutral-800 bg-neutral-950/60 p-4 mb-5">
                        <label
                            htmlFor="playground-name"
                            className="text-[10px] font-semibold uppercase tracking-[0.1em] text-neutral-600"
                        >
                            Playground Name
                        </label>
                        <input
                            id="playground-name"
                            type="text"
                            value={playgroundName}
                            onChange={e => {
                                setPlaygroundName(e.target.value);
                                if (error) setError("");
                            }}
                            placeholder="Enter a name"
                            maxLength={80}
                            className="mt-2 h-9 w-full rounded-md border border-neutral-800 bg-neutral-900 px-3 text-sm text-white placeholder:text-neutral-700 outline-none transition-colors focus:border-violet-500/50"
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[28%_1fr]">
                        <aside className="grid h-fit grid-cols-1 gap-2">
                            <CreatePlaygroundOptionCard
                                title="Upload Local Files"
                                description="Select local files to seed your playground workspace."
                                value="upload"
                                selectedValue="upload"
                                onSelect={() => {}}
                            />
                            <CreatePlaygroundOptionCard
                                title="Import GitHub Repo"
                                description="GitHub import is coming soon. Use local upload for now."
                                value="github"
                                selectedValue="upload"
                                onSelect={() => {}}
                            />
                        </aside>

                        <div className="rounded-md border border-neutral-800 bg-neutral-950/60 p-4">
                            <label
                                htmlFor="playground-upload"
                                className="inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-violet-500/50 bg-violet-500/10 px-4 text-xs font-semibold text-violet-300 transition-all hover:bg-violet-500/20 hover:border-violet-500/70"
                            >
                                Choose Files / Folder
                            </label>
                            <input
                                id="playground-upload"
                                type="file"
                                multiple
                                webkitdirectory=""
                                directory=""
                                onChange={handleSelectFiles}
                                className="sr-only"
                            />

                            <p className="mt-3 mb-0 text-xs text-neutral-600">
                                Supported: text-based source, code, and config files.
                            </p>

                            {!!detectedFolderName && (
                                <p className="mt-2 mb-0 text-xs text-neutral-300">
                                    Folder: <span className="font-semibold">{detectedFolderName}</span>
                                </p>
                            )}
                            {detectedFileCount > 0 && (
                                <p className="mt-1 mb-0 text-xs text-neutral-500">
                                    {detectedFileCount} files detected
                                </p>
                            )}
                            {skippedFileCount > 0 && (
                                <p className="mt-1 mb-0 text-xs text-amber-400">
                                    {skippedFileCount} files skipped (unsupported)
                                </p>
                            )}
                            {uploadWarning && (
                                <p className="mt-2 mb-0 rounded-md border border-amber-500/30 bg-amber-500/8 px-2 py-1.5 text-xs text-amber-300">
                                    {uploadWarning}
                                </p>
                            )}

                            {isReadingFiles && (
                                <div className="mt-3 rounded-md border border-neutral-800 bg-neutral-900 px-3 py-2.5">
                                    <p className="m-0 text-xs text-neutral-400">
                                        Reading files… {readingProgress.processed}/{readingProgress.total}
                                    </p>
                                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-neutral-800">
                                        <div
                                            className="h-full rounded-full bg-violet-500 transition-all duration-200"
                                            style={{ width: `${readingProgress.total ? (readingProgress.processed / readingProgress.total) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="mt-4">
                                <CreatePlaygroundUploadPreview
                                    files={uploadedFiles}
                                    isReading={isReadingFiles}
                                    detectedFileCount={detectedFileCount}
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <p className="mt-4 mb-0 rounded-md border border-red-500/30 bg-red-500/8 px-4 py-3 text-sm text-red-400">
                            {error}
                        </p>
                    )}

                    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="h-9 rounded-md border border-neutral-700 px-5 text-sm font-medium text-neutral-400 transition-all hover:border-neutral-600 hover:text-neutral-200"
                        >
                            Back
                        </button>
                        <button
                            type="button"
                            onClick={handleCreate}
                            disabled={!hasCapacity || isLoadingUsage || isSubmitting || isReadingFiles || !uploadedFiles.length}
                            className="h-9 rounded-md border border-violet-500/50 bg-violet-500/10 px-5 text-sm font-semibold text-violet-300 transition-all hover:bg-violet-500/20 hover:border-violet-500/70 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            {isSubmitting ? "Creating…" : "Continue to Editor"}
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
}
