import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, ExternalLink } from "lucide-react";
import { cn } from "../../../lib/utils.js";
import { getPlaygrounds } from "../services/analyze.api.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { languageToSymbolMap } from "../utils/languageTosymbolmap.js";

function ActivePlayground() {
    const navigate = useNavigate();
    const { accessToken } = useAuth();
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const loadPlaygrounds = async () => {
            if (!accessToken) return;
            setIsLoading(true);
            try {
                const data = await getPlaygrounds();
                const mapped = data.map((pg) => {
                    const languageCount = pg?.fileCounts || {};
                    const languageKeys = Object.keys(languageCount);
                    const mostUsedLanguage = languageKeys.length
                        ? languageKeys.reduce((a, b) => languageCount[a] > languageCount[b] ? a : b)
                        : null;
                    return {
                        id: pg.id,
                        name: pg.name,
                        language: mostUsedLanguage
                            ? (languageToSymbolMap[mostUsedLanguage.toLowerCase()] ?? mostUsedLanguage.toUpperCase())
                            : "--",
                    };
                });
                setSessions(mapped);
            } catch {
                setSessions([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadPlaygrounds();
    }, [accessToken]);

    const handleStartNew = () => {
        navigate("/analyze/playground/new?from=dashboard", { state: { from: "/analyze" } });
    };

    const handleResumeSession = (sessionId) => {
        navigate(`/analyze/playground/${sessionId}`);
    };

    return (
        <section className="mb-10" aria-label="Active Playground">
            <div className="mb-5">
                <h2 className="text-xl font-semibold text-white tracking-tight">Active Playground</h2>
                <p className="mt-1 text-sm text-neutral-500">Continue where you left off in your coding session.</p>
            </div>

            <div
                className="flex gap-3 overflow-x-auto overflow-y-visible py-1 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-transparent"
                role="list"
                aria-label="Recent playground sessions"
            >
                {/* Start New */}
                <button
                    type="button"
                    className={cn(
                        "w-52 shrink-0 h-36",
                        "border border-dashed border-neutral-700 rounded-lg",
                        "bg-neutral-900/50",
                        "flex flex-col items-center justify-center gap-3",
                        "cursor-pointer transition-all duration-150",
                        "hover:border-violet-500/50 hover:bg-neutral-800/50 group"
                    )}
                    onClick={handleStartNew}
                >
                    <span className="w-8 h-8 rounded-md border border-neutral-700 flex items-center justify-center text-neutral-500 group-hover:border-violet-500/50 group-hover:text-violet-400 transition-colors">
                        <Plus className="w-4 h-4" />
                    </span>
                    <span className="text-xs font-medium text-neutral-500 group-hover:text-violet-400 transition-colors">
                        New Playground
                    </span>
                </button>

                {/* Loading */}
                {isLoading && (
                    <div className="w-52 shrink-0 h-36 border border-neutral-800 rounded-lg bg-neutral-900/50 flex items-center justify-center text-xs text-neutral-600">
                        Loading…
                    </div>
                )}

                {/* Session Cards */}
                {sessions.map((session) => (
                    <button
                        key={session.id}
                        type="button"
                        className={cn(
                            "w-52 shrink-0 h-36",
                            "border border-neutral-800 rounded-lg",
                            "bg-neutral-900/80",
                            "flex flex-col items-start justify-between",
                            "p-3.5 text-left cursor-pointer",
                            "transition-all duration-150",
                            "hover:border-violet-500/40 hover:bg-neutral-800/80 group"
                        )}
                        onClick={() => handleResumeSession(session.id)}
                        role="listitem"
                    >
                        <span className="px-1.5 py-0.5 rounded border border-neutral-700 text-[10px] font-bold text-neutral-400 bg-neutral-800 group-hover:border-violet-500/40 group-hover:text-violet-400 transition-colors">
                            {session.language}
                        </span>

                        <span className="text-sm font-medium text-neutral-200 line-clamp-2 w-full leading-snug" title={session.name}>
                            {session.name}
                        </span>

                        <span className="w-full flex items-center justify-center gap-1.5 border border-neutral-700 rounded-md py-1.5 text-xs font-medium text-neutral-400 group-hover:border-violet-500/40 group-hover:text-violet-400 transition-colors">
                            <ExternalLink className="w-3 h-3" />
                            Open
                        </span>
                    </button>
                ))}

                {/* Empty */}
                {!isLoading && sessions.length === 0 && (
                    <div className="w-52 shrink-0 h-36 border border-neutral-800 rounded-lg bg-neutral-900/50 p-4 text-xs text-neutral-600 flex items-center justify-center text-center">
                        No playgrounds yet. Create one to get started.
                    </div>
                )}
            </div>
        </section>
    );
}

export default ActivePlayground;
