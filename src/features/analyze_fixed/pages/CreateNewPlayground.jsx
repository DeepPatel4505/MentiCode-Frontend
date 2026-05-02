import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router";
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
                    content: content,
                    storagePath: relativePath,
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
            <main className="min-h-screen bg-[#0f131b] px-4 py-8 text-white sm:px-6 lg:px-10">
                <div className="mx-auto w-full max-w-4xl">
                    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-[#9fb1c8]">
                                Playground Setup
                            </p>
                            <h1 className="mt-3 mb-0 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
                                Create a New Playground
                            </h1>
                        </div>

                        <div className="self-start sm:self-auto">
                            {isLoadingUsage ? (
                                <div className="rounded-xl border border-white/30 bg-[#141414] px-3 py-2 text-xs text-[#a8b8d0]">
                                    Loading usage...
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

                    <section className="rounded-4xl border-2 border-white bg-[#141414] p-5 shadow-[0_12px_32px_rgba(0,0,0,0.3)] sm:p-7">
                        <div className="rounded-2xl border border-white bg-[#141414] p-4">
                            <label
                                htmlFor="playground-name"
                                className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9fb1c8]"
                            >
                                Playground Name
                            </label>
                            <input
                                id="playground-name"
                                type="text"
                                value={playgroundName}
                                onChange={(event) => {
                                    setPlaygroundName(event.target.value);
                                    if (error) {
                                        setError("");
                                    }
                                }}
                                placeholder="Enter a name"
                                maxLength={80}
                                className="mt-2 h-11 w-full rounded-full border border-white/40 bg-[#1a1a1a] px-4 text-sm text-white placeholder:text-[#8fa1ba] outline-none transition-colors duration-200 focus:border-accent-amber"
                            />
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-[30%_1fr]">
                            <aside className="grid h-fit grid-cols-1 gap-3">
                                <CreatePlaygroundOptionCard
                                    title="Upload Local Files"
                                    description="Select local files to seed your playground workspace."
                                    value="upload"
                                    selectedValue="upload"
                                    onSelect={() => {}}
                                />

                                <CreatePlaygroundOptionCard
                                    title="Import GitHub Repo"
                                    description="GitHub import is coming next. For now use local file upload."
                                    value="github"
                                    selectedValue="upload"
                                    onSelect={() => {}}
                                />
                            </aside>

                            <div className="rounded-2xl border border-white bg-[#141414] p-4">
                                <label
                                    htmlFor="playground-upload"
                                    className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md border border-accent-amber bg-accent-amber px-4 text-xs font-semibold text-black transition-all duration-200 hover:bg-[#ffb95e]"
                                >
                                    Choose Files/Folder
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

                                <p className="mt-3 mb-0 text-xs text-[#9fb1c8]">
                                    Supported: text-based source/code/config files.
                                </p>

                                {!!detectedFolderName && (
                                    <p className="mt-2 mb-0 text-xs text-[#e9f0ff]">
                                        Folder detected: <span className="font-semibold">{detectedFolderName}</span>
                                    </p>
                                )}

                                {detectedFileCount > 0 && (
                                    <p className="mt-1 mb-0 text-xs text-[#9fb1c8]">
                                        Files detected: {detectedFileCount}
                                    </p>
                                )}

                                {skippedFileCount > 0 && (
                                    <p className="mt-1 mb-0 text-xs text-amber-300">
                                        Skipped files: {skippedFileCount}
                                    </p>
                                )}

                                {uploadWarning && (
                                    <p className="mt-2 mb-0 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1 text-xs text-amber-200">
                                        {uploadWarning}
                                    </p>
                                )}

                                {isReadingFiles && (
                                    <div className="mt-3 rounded-xl border border-white/20 bg-[#1a1a1a] px-3 py-2">
                                        <p className="m-0 text-xs text-[#d6e2f5]">
                                            Reading files... {readingProgress.processed}/{readingProgress.total}
                                        </p>
                                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                                            <div
                                                className="h-full rounded-full bg-accent-amber transition-all duration-200"
                                                style={{
                                                    width: `${readingProgress.total ? (readingProgress.processed / readingProgress.total) * 100 : 0}%`,
                                                }}
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

                        {error ? (
                            <p className="mt-4 mb-0 rounded-xl border border-red-500/50 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                                {error}
                            </p>
                        ) : null}

                        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="h-11 rounded-full border-2 border-white px-6 text-sm font-semibold text-white transition-all duration-200 hover:border-accent-amber hover:text-accent-amber"
                            >
                                Back
                            </button>

                            <button
                                type="button"
                                onClick={handleCreate}
                                disabled={
                                    !hasCapacity ||
                                    isLoadingUsage ||
                                    isSubmitting ||
                                    isReadingFiles ||
                                    !uploadedFiles.length
                                }
                                className="h-11 rounded-full border-2 border-[#ffb95e] bg-accent-amber px-6 text-sm font-semibold text-black transition-all duration-200 hover:bg-[#ffb95e] disabled:cursor-not-allowed disabled:border-white/40 disabled:bg-white/20 disabled:text-white/60"
                            >
                                {isSubmitting
                                    ? "Creating Playground..."
                                    : "Continue to Editor"}
                            </button>
                        </div>
                    </section>
                </div>
            </main>

    );
}
