import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, MoreVertical, Layers } from "lucide-react";
import { cn } from "../../../lib/utils.js";
import {
    createPlayground,
    getPlaygrounds,
    deletePlayground,
} from "../services/analyze.api.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { languageToSymbolMap } from "../utils/languageTosymbolmap.js";
import DeletePlaygroundDialog from "../components/createPlayground/DeletePlaygroundDialog.jsx";
import CardOptionsMenu from "../components/createPlayground/CardOptionsMenu.jsx";
import { useSelector } from "react-redux";
import { selectIsPro } from "../../../app/store/slices/authSlice.js";

function PlaygroundPage() {
    const { isPro } = useSelector(selectIsPro);
    const PLAYGROUND_LIMIT = isPro ? 20 : 5;
    const navigate = useNavigate();
    const { accessToken } = useAuth();
    const [playgrounds, setPlaygrounds] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [notification, setNotification] = useState(null);
    const [activeCount, setActiveCount] = useState(0);

    const isLimitReached = activeCount >= PLAYGROUND_LIMIT;
    const getStaticPreview = (pg) => {
        const lang = pg.language?.toLowerCase();

        if (lang === "c++" || lang === "cpp") {
            return `#include <iostream>

int main() {
    // ${pg.name}
    return 0;
}`;
        }

        if (lang === "js") {
            return `// ${pg.name}

function main() {
    console.log("Hello World");
}`;
        }

        if (lang === "plaintext") {
            return `// ${pg.name}\n\n// Text file`;
        }

        // fallback
        return `// ${pg.name}\n// ${pg.fileCounts ? Object.keys(pg.fileCounts).join(", ") : "code"}`;
    };
    const getPrismLang = (lang) => {
        if (!lang) return "javascript";

        const l = lang.toLowerCase();

        if (l === "c++") return "cpp";
        if (l === "js") return "javascript";

        return l;
    };
    const fetchPlaygrounds = async () => {
        try {
            const data = await getPlaygrounds();
            setPlaygrounds(data);
            setActiveCount(data.length);
            setPlaygrounds((prev) =>
                prev.map((pg) => {
                    const languageCount = pg.fileCounts || {};
                    const keys = Object.keys(languageCount);

                    const mostUsed = keys.length
                        ? keys.reduce((a, b) =>
                              languageCount[a] > languageCount[b] ? a : b,
                          )
                        : null;

                    // 👇 NEW: preview extraction
                    let preview = "";
                    console.log("Files for playground", pg); // Debug log

                    if (pg.files && pg.files.length > 0) {
                        const firstFile = pg.files[0];
                        const content = firstFile.content || "";

                        preview = content.split("\n").slice(0, 5).join("\n");
                    }

                    return {
                        ...pg,
                        language: mostUsed
                            ? (languageToSymbolMap[mostUsed.toLowerCase()] ??
                              mostUsed.toUpperCase())
                            : "--",
                        preview, // 👈 ADD THIS
                    };
                }),
            );
        } catch (err) {
            console.error("Failed to fetch playgrounds:", err);
        }
    };

    const handleStartNew = () => {
        navigate("/analyze/playground/new?from=playgrounds", {
            state: { from: "/analyze/playground" },
        });
    };

    const handleEnterPlayground = (id) => navigate(`/analyze/playground/${id}`);

    const handleDeleteClick = (playground) => {
        setDeleteConfirmation(playground);
        setActiveMenu(null);
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirmation) return;
        setIsDeleting(true);
        try {
            await deletePlayground(deleteConfirmation.id);
            setPlaygrounds((prev) =>
                prev.filter((pg) => pg.id !== deleteConfirmation.id),
            );
            setActiveCount((prev) => prev - 1);
            setNotification({
                type: "success",
                message: `"${deleteConfirmation.name}" deleted`,
            });
            setDeleteConfirmation(null);
            setTimeout(() => setNotification(null), 3000);
        } catch (err) {
            setNotification({
                type: "error",
                message: err.message || "Failed to delete",
            });
            setTimeout(() => setNotification(null), 4000);
        } finally {
            setIsDeleting(false);
        }
    };

    useEffect(() => {
        if (accessToken) fetchPlaygrounds();
    }, [accessToken]);

    return (
        <section className="w-full max-w-full p-6 mx-auto pb-12">
            {/* Page Header */}
            <div className="flex items-start justify-between mb-8">
                <div>
                    <h1 className="text-xl font-semibold text-white tracking-tight">
                        My Playgrounds
                    </h1>
                    <p className="mt-1 text-sm text-neutral-500">
                        Manage and open your code analysis sessions.
                    </p>
                </div>

                {/* Slot usage */}
                <div className="flex flex-col items-end gap-1.5">
                    <div className="flex items-center gap-2 text-xs">
                        <Layers className="w-3.5 h-3.5 text-neutral-600" />
                        <span className="text-neutral-500">Slots</span>
                        <span
                            className={cn(
                                "font-semibold",
                                isLimitReached
                                    ? "text-red-400"
                                    : "text-neutral-300",
                            )}
                        >
                            {activeCount}/{PLAYGROUND_LIMIT}
                        </span>
                    </div>
                    <div className="w-28 h-1 bg-neutral-800 rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full transition-all duration-300",
                                isLimitReached ? "bg-red-500" : "bg-violet-500",
                            )}
                            style={{
                                width: `${(activeCount / PLAYGROUND_LIMIT) * 100}%`,
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="max-w-5xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {/* New Playground Card */}
                <button
                    type="button"
                    onClick={handleStartNew}
                    disabled={isLimitReached || isCreating}
                    className={cn(
                        "h-56 rounded-lg border border-dashed border-neutral-700 bg-neutral-900/50",
                        "flex flex-col items-center justify-center gap-3",
                        "cursor-pointer transition-all duration-150",
                        "hover:border-violet-500/50 hover:bg-neutral-800/50",
                        "disabled:opacity-40 disabled:cursor-not-allowed",
                        "group",
                    )}
                >
                    <span className="w-9 h-9 rounded-md border border-neutral-700 flex items-center justify-center text-neutral-500 group-hover:border-violet-500/50 group-hover:text-violet-400 transition-colors">
                        <Plus className="w-4 h-4" />
                    </span>
                    <span className="text-sm font-medium text-neutral-500 group-hover:text-violet-400 transition-colors">
                        {isCreating ? "Creating…" : "New Playground"}
                    </span>
                    {isLimitReached && (
                        <span className="text-xs text-red-400">
                            Limit reached
                        </span>
                    )}
                </button>

                {/* Playground Cards */}
                {playgrounds.map((playground) => (
                    <div
                        key={playground.id}
                        className={cn(
                            "relative h-56 rounded-lg border border-neutral-800 bg-neutral-900/80",
                            "flex flex-col overflow-hidden",
                            "transition-all duration-150",
                            "hover:border-neutral-700 hover:bg-neutral-900",
                            "group",
                        )}
                    >
                        {/* Card Header */}
                        <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-2 shrink-0">
                            <div className="flex-1 min-w-0">
                                <span className="inline-block px-1.5 py-0.5 rounded border border-neutral-700 text-[10px] font-bold text-neutral-400 bg-neutral-800 group-hover:border-violet-500/40 group-hover:text-violet-400 transition-colors">
                                    {playground.language}
                                </span>
                                <h3 className="mt-2.5 text-sm font-medium text-neutral-200 line-clamp-2 leading-snug">
                                    {playground.name}
                                </h3>
                            </div>
                            <div className="relative shrink-0">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveMenu(
                                            activeMenu === playground.id
                                                ? null
                                                : playground.id,
                                        )
                                    }
                                    className="p-1 text-neutral-600 hover:text-neutral-300 transition-colors rounded hover:bg-white/5"
                                    aria-label="Options"
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </button>
                                <CardOptionsMenu
                                    isOpen={activeMenu === playground.id}
                                    onClose={() => setActiveMenu(null)}
                                    onDelete={() =>
                                        handleDeleteClick(playground)
                                    }
                                    isLoading={
                                        isDeleting &&
                                        deleteConfirmation?.id === playground.id
                                    }
                                />
                            </div>
                        </div>

                        {/* Preview area */}
                        <div className="flex-1 mx-4 mb-1 rounded-md bg-[#0d1117] border border-neutral-800 overflow-hidden relative group-hover:scale-[1.02] transition-transform">

                            <SyntaxHighlighter
                                language={getPrismLang(playground.language)}
                                style={vscDarkPlus}
                                customStyle={{
                                    margin: 0,
                                    padding: "12px",
                                    fontSize: "6px",
                                    background: "transparent",
                                }}
                                codeTagProps={{
                                    style: {
                                        fontFamily: "monospace",
                                    },
                                }}
                            >
                                {getStaticPreview(playground)}
                            </SyntaxHighlighter>

                            {/* Fade */}
                            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-[#0d1117] to-transparent" />
                        </div>
                        <div className="px-3 pb-2 text-[10px] text-neutral-600">
                            {Object.entries(playground.fileCounts || {})
                                .map(([k, v]) => `${v} ${k}`)
                                .join(" • ")}
                        </div>

                        {/* Footer */}
                        <div className="px-4 pb-4 shrink-0">
                            <button
                                type="button"
                                onClick={() =>
                                    handleEnterPlayground(playground.id)
                                }
                                className="w-full h-8 rounded-md border border-neutral-700 text-xs font-medium text-neutral-300 bg-transparent transition-all duration-150 hover:border-violet-500/50 hover:text-violet-300 hover:bg-violet-500/5"
                            >
                                Open Playground
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty state */}
            {playgrounds.length === 0 && (
                <div className="mt-8 text-center py-12">
                    <p className="text-sm text-neutral-500">
                        No playgrounds yet.
                    </p>
                    <p className="text-xs text-neutral-700 mt-1">
                        Click "New Playground" to create one.
                    </p>
                </div>
            )}

            {/* Delete Dialog */}
            {deleteConfirmation && (
                <DeletePlaygroundDialog
                    playgroundName={deleteConfirmation.name}
                    isLoading={isDeleting}
                    onConfirm={handleConfirmDelete}
                    onDismiss={() => setDeleteConfirmation(null)}
                />
            )}

            {/* Toast */}
            {notification && (
                <div
                    className={cn(
                        "fixed bottom-6 right-6 px-4 py-3 rounded-lg text-sm font-medium max-w-sm z-50 border",
                        notification.type === "success"
                            ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                            : "bg-red-500/10 border-red-500/30 text-red-300",
                    )}
                >
                    {notification.message}
                </div>
            )}
        </section>
    );
}

export default PlaygroundPage;
