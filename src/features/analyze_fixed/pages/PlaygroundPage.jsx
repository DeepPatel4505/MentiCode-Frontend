import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { cn } from "../../../lib/utils.js";
import { createPlayground, getPlaygrounds, deletePlayground } from "../services/analyze.api.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { languageToSymbolMap } from "../utils/languageTosymbolmap.js";
import DeletePlaygroundDialog from "../components/createPlayground/DeletePlaygroundDialog.jsx";
import CardOptionsMenu from "../components/createPlayground/CardOptionsMenu.jsx";

const staticPlaygrounds = [
    {
        id: "auth-service-v2",
        name: "auth-service-v2",
        language: "JS",
        createdAt: "2 days ago",
        lastModified: "Today",
    },
    {
        id: "frontend-ui-v3",
        name: "frontend-ui-v3",
        language: "TS",
        createdAt: "5 days ago",
        lastModified: "3 hours ago",
    },
    {
        id: "menticode-engine",
        name: "menticode-engine",
        language: "JS",
        createdAt: "1 week ago",
        lastModified: "Yesterday",
    },
];

const PLAYGROUND_LIMIT = 5;

function PlaygroundPage() {
    const navigate = useNavigate();
    const { accessToken } = useAuth();
    const [playgrounds, setPlaygrounds] = useState([]);
    const [isCreating, setIsCreating] = useState(false);
    const [activeMenu, setActiveMenu] = useState(null);
    const [deleteConfirmation, setDeleteConfirmation] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [notification, setNotification] = useState(null);

    const [activeCount, setActiveCount] = useState(0);
    const slotUsage = `${activeCount}/${PLAYGROUND_LIMIT}`;
    const isLimitReached = activeCount >= PLAYGROUND_LIMIT;

    const fetchPlaygrounds = async () => {
        try {
            const data = await getPlaygrounds();
            console.log("Fetched playgrounds:", data);
            //set language based on files in playground (for display purposes only)
            setPlaygrounds(data);
            setActiveCount(data.length);
            //set lanaguage based on files in playground (for display purposes only)
            setPlaygrounds((prev) =>
                prev.map((pg) => {
                    const languageCount = pg.fileCounts;
                    const mostUsedLanguage = Object.keys(languageCount).reduce(
                        (a, b) => (languageCount[a] > languageCount[b] ? a : b),
                        Object.keys(languageCount)[0],
                    );
                    return {
                        ...pg,
                        language:
                            languageToSymbolMap[mostUsedLanguage.toLowerCase()],
                    };
                }),
            );
        } catch (err) {
            console.error("Failed to fetch playgrounds:", err);
        }
    };

    const handleStartNew = async () => {
        navigate("/analyze/playground/new?from=playgrounds", {
            state: { from: "/analyze/playground" },
        });
    };

    const handleEnterPlayground = (playgroundId) => {
        navigate(`/analyze/playground/${playgroundId}`);
    };

    const handleDeleteClick = (playground) => {
        setDeleteConfirmation(playground);
        setActiveMenu(null);
    };

    const handleConfirmDelete = async () => {
        if (!deleteConfirmation) return;
        
        setIsDeleting(true);
        try {
            await deletePlayground(deleteConfirmation.id);
            
            // Remove from UI optimistically
            setPlaygrounds((prev) =>
                prev.filter((pg) => pg.id !== deleteConfirmation.id)
            );
            setActiveCount((prev) => prev - 1);
            
            setNotification({
                type: "success",
                message: `"${deleteConfirmation.name}" deleted successfully`,
            });
            
            setDeleteConfirmation(null);
            
            // Clear notification after 3 seconds
            setTimeout(() => setNotification(null), 3000);
        } catch (err) {
            console.error("Failed to delete playground:", err);
            setNotification({
                type: "error",
                message: err.message || "Failed to delete playground",
            });
            
            // Clear error after 4 seconds
            setTimeout(() => setNotification(null), 4000);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCancelDelete = () => {
        setDeleteConfirmation(null);
    };

    useEffect(() => {
        if (accessToken) {
            fetchPlaygrounds();
        }
    }, [accessToken]);

    return (
        <section className="w-full max-w-7xl mx-auto px-6 pb-12">
            {/* Header Section */}
            <div className="flex items-center justify-between mb-12 pt-6">
                <div>
                    <h1 className="m-0 text-4xl font-bold text-white font-heading">
                        My Playgrounds
                    </h1>
                </div>

                <div className="flex items-center gap-8">
                    {/* Slot Usage */}
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-[#b0c4de]">
                                Slot Usage:
                            </span>
                            <span
                                className={cn(
                                    "text-sm font-bold",
                                    isLimitReached
                                        ? "text-red-400"
                                        : "text-[#87ceeb]",
                                )}
                            >
                                {slotUsage}
                            </span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-32 h-1.5 bg-[#2a3f52] rounded-full overflow-hidden">
                            <div
                                className={cn(
                                    "h-full rounded-full transition-all duration-300",
                                    isLimitReached
                                        ? "bg-red-500"
                                        : "bg-[#87ceeb]",
                                )}
                                style={{
                                    width: `${(activeCount / PLAYGROUND_LIMIT) * 100}%`,
                                }}
                            />
                        </div>
                    </div>

                    {/* Profile Icon */}
                    <button
                        type="button"
                        className="w-10 h-10 rounded-full border-2 border-white bg-[rgba(255,255,255,0.1)] flex items-center justify-center text-white font-bold text-sm hover:bg-[rgba(255,255,255,0.2)] transition-colors"
                        aria-label="Profile"
                    >
                        MC
                    </button>
                </div>
            </div>

            {/* Your Active Playground Section */}
            <div className="mb-8">
                <h2 className="m-0 text-2xl font-bold text-white font-heading mb-1">
                    Your Active Playground
                </h2>
                <p className="m-0 text-[#a8b8d0] text-sm">
                    Manage your playgrounds.
                </p>
            </div>

            {/* Playground Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {/* Start New Playground Card */}
                <button
                    type="button"
                    onClick={handleStartNew}
                    disabled={isLimitReached || isCreating}
                    className={cn(
                        "relative h-72 rounded-3xl overflow-hidden",
                        "border-2 border-dashed border-white",
                        "bg-[#141414] backdrop-blur-sm",
                        "flex flex-col items-center justify-center gap-4 p-6",
                        "text-center cursor-pointer",
                        "transition-all duration-300 ease-out",
                        "hover:not-disabled:border-amber-400 hover:not-disabled:bg-[#1a1a1a] hover:not-disabled:shadow-lg",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        "group",
                    )}
                >
                    <div className="absolute inset-0 opacity-0 group-hover:not-disabled:opacity-100 transition-opacity duration-300 bg-linear-to-br from-amber-400/5 to-transparent pointer-events-none" />

                    <div className="relative z-10 flex flex-col items-center gap-4">
                        <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-2xl font-light text-white group-hover:not-disabled:border-amber-400 group-hover:not-disabled:text-amber-400 transition-colors">
                            +
                        </div>
                        <span className="text-sm font-semibold text-white group-hover:not-disabled:text-amber-400 transition-colors">
                            {isCreating
                                ? "Creating Playground..."
                                : "Start New Playground"}
                        </span>
                    </div>

                    {isLimitReached && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <span className="text-xs font-semibold text-red-400">
                                Limit Reached
                            </span>
                        </div>
                    )}
                </button>

                {/* Existing Playground Cards */}
                {playgrounds.map((playground) => (
                    <div
                        key={playground.id}
                        className={cn(
                            "relative h-72 rounded-3xl overflow-hidden",
                            "border-2 border-white",
                            "bg-[#141414] backdrop-blur-sm",
                            "flex flex-col",
                            "transition-all duration-300 ease-out",
                            "hover:border-amber-400 hover:bg-[#1a1a1a] hover:shadow-[0_12px_30px_rgba(0,0,0,0.4),0_0_20px_rgba(251,191,36,0.15)] hover:-translate-y-1",
                            "group",
                        )}
                    >
                        {/* Top Section - Badge & Title */}
                        <div className="px-5 pt-4 pb-3 shrink-0 border-b border-white/10 flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                                <span className="inline-block px-2 py-1 rounded border border-white text-xs font-bold text-white bg-white/10 group-hover:border-amber-400 group-hover:text-amber-400 group-hover:bg-amber-400/10 transition-colors">
                                    {playground.language}
                                </span>
                                <h3 className="mt-3 text-sm font-semibold text-white line-clamp-2 leading-snug">
                                    {playground.name}
                                </h3>
                            </div>
                            {/* Options Menu Button */}
                            <div className="relative shrink-0">
                                <button
                                    type="button"
                                    onClick={() =>
                                        setActiveMenu(
                                            activeMenu === playground.id
                                                ? null
                                                : playground.id
                                        )
                                    }
                                    className="p-1 text-white/60 hover:text-white transition-colors rounded hover:bg-white/10"
                                    aria-label="Options"
                                >
                                    ⋮
                                </button>
                                <CardOptionsMenu
                                    isOpen={activeMenu === playground.id}
                                    onClose={() => setActiveMenu(null)}
                                    onDelete={() => handleDeleteClick(playground)}
                                    isLoading={
                                        isDeleting &&
                                        deleteConfirmation?.id === playground.id
                                    }
                                />
                            </div>
                        </div>

                        {/* Middle Section - Image Placeholder */}
                        <div className="flex-1 mx-4 my-3 rounded-lg bg-[rgba(255,255,255,0.05)] border border-white/10 flex items-center justify-center">
                            <span className="text-xs text-[#888] font-semibold">
                                Image
                            </span>
                        </div>

                        {/* Bottom Section - Action Button */}
                        <div className="px-5 pb-4 pt-3 shrink-0 border-t border-white/10">
                            <button
                                type="button"
                                onClick={() =>
                                    handleEnterPlayground(playground.id)
                                }
                                className="w-full px-3 py-2 rounded-full border-2 border-white text-xs font-semibold text-white bg-transparent transition-all duration-200 group-hover:border-amber-400 group-hover:text-black group-hover:bg-amber-400 hover:cursor-pointer"
                            >
                                Enter Playground →
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {playgrounds.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20">
                    <p className="text-[#a8b8d0] text-sm">No playgrounds yet</p>
                    <p className="text-[#666] text-xs mt-1">
                        Click the "Start New Playground" card to create one
                    </p>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {deleteConfirmation && (
                <DeletePlaygroundDialog
                    playgroundName={deleteConfirmation.name}
                    isLoading={isDeleting}
                    onConfirm={handleConfirmDelete}
                    onDismiss={handleCancelDelete}
                />
            )}

            {/* Notifications */}
            {notification && (
                <div
                    className={cn(
                        "fixed bottom-6 right-6 px-4 py-3 rounded-lg text-sm font-medium max-w-sm z-40",
                        notification.type === "success"
                            ? "bg-green-500/20 border border-green-500 text-green-300"
                            : "bg-red-500/20 border border-red-500 text-red-300"
                    )}
                >
                    {notification.message}
                </div>
            )}
        </section>
    );
}

export default PlaygroundPage;
