import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
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
            if (!accessToken) {
                return;
            }

            setIsLoading(true);
            try {
                const data = await getPlaygrounds();
                const mapped = data.map((pg) => {
                    const languageCount = pg?.fileCounts || {};
                    const languageKeys = Object.keys(languageCount);
                    const mostUsedLanguage = languageKeys.length
                        ? languageKeys.reduce((a, b) =>
                              languageCount[a] > languageCount[b] ? a : b,
                          )
                        : null;

                    return {
                        id: pg.id,
                        name: pg.name,
                        language: mostUsedLanguage
                            ? (languageToSymbolMap[
                                  mostUsedLanguage.toLowerCase()
                              ] ?? mostUsedLanguage.toUpperCase())
                            : "--",
                    };
                });
                setSessions(mapped);
            } catch (error) {
                console.error("Failed to fetch playgrounds:", error);
                setSessions([]);
            } finally {
                setIsLoading(false);
            }
        };

        loadPlaygrounds();
    }, [accessToken]);

    const handleStartNew = () => {
        navigate("/analyze/playground/new?from=dashboard", {
            state: { from: "/analyze" },
        });
    };

    const handleResumeSession = (sessionId) => {
        navigate(`/analyze/playground/${sessionId}`);
    };

    return (
        <section className="mb-8" aria-label="Active Playground">
            {/* Section Header */}
            <div className="mb-8">
                <h2 className="m-0 text-heading-2xl font-heading font-bold tracking-tight text-text-primary">
                    Active Playground
                </h2>
                <p className="mt-3 text-lg-text text-text-muted max-w-full">
                    Continue where you left off in your ephemeral coding
                    session.
                </p>
            </div>

            {/* Cards Container */}
            <div
                className="
                    flex gap-4 overflow-x-auto overflow-y-visible py-2 my-2
                    scrollbar-thin scrollbar-thumb-[#5a6f8d] scrollbar-track-transparent
                "
                role="list"
                aria-label="Recent playground sessions"
            >
                {/* Start New Button */}
                <button
                    type="button"
                    className={cn(
                        "w-60 shrink-0 h-40 ",
                        "border-2 border-dashed border-white rounded-3xl ",
                        "bg-[#141414] ",
                        "flex flex-col items-center justify-center gap-4 p-4 ",
                        "text-left cursor-pointer ",
                        "transition-all duration-300 ease-out ",
                        "hover:border-accent-amber hover:bg-[#1a1a1a] hover:shadow-lg group",
                    )}
                    onClick={handleStartNew}
                >
                    <span
                        className="
                        w-7 h-7 rounded-full border border-white 
                        flex items-center justify-center 
                        text-lg leading-none 
                        text-white font-bold
                        transition-all duration-200
                        group-hover:border-accent-amber group-hover:text-accent-amber group-hover:shadow-[0_0_12px_rgba(243,164,45,0.3)]
                    "
                    >
                        +
                    </span>
                    <span className="text-sm font-semibold text-[#f0f0f0] text-center transition-colors group-hover:text-accent-amber">
                        Start New Playground
                    </span>
                </button>

                {/* Session Cards */}
                {isLoading && (
                    <div className="w-60 shrink-0 h-40 border-2 border-white/20 rounded-3xl bg-[#141414] p-4 text-sm text-[#a8b8d0] flex items-center justify-center">
                        Loading playgrounds...
                    </div>
                )}

                {sessions.map((session) => (
                    <button
                        key={session.id}
                        type="button"
                        className={cn(
                            "w-60 shrink-0 h-40 ",
                            "border-2 border-white rounded-3xl ",
                            "bg-[#141414] ",
                            "backdrop-blur-sm ",
                            "flex flex-col items-start justify-between gap-3 ",
                            "p-4 text-left cursor-pointer ",
                            "transition-all duration-300 ease-out ",
                            "shadow-[0_4px_12px_rgba(0,0,0,0.2)] ",
                            "hover:border-accent-amber hover:bg-[#1a1a1a] hover:shadow-[0_12px_28px_rgba(0,0,0,0.3),0_0_20px_rgba(243,164,45,0.15)] hover:-translate-y-0.5 group",
                        )}
                        onClick={() => handleResumeSession(session.id)}
                        role="listitem"
                    >
                        {/* Badge */}
                        <span
                            className="
                            border border-white rounded-sm px-2 py-1 
                            text-xs font-bold text-white
                            bg-white/10
                            group-hover:border-accent-amber group-hover:text-accent-amber group-hover:bg-accent-amber/10 transition-colors
                        "
                        >
                            {session.language}
                        </span>

                        {/* Content */}
                        <div className="flex-1 w-full">
                            <span
                                className="
                                    text-sm font-semibold leading-snug
                                    font-heading w-full 
                                    line-clamp-2
                                    text-[#f0f4fb]
                                "
                                title={session.name}
                            >
                                {session.name}
                            </span>
                        </div>

                        {/* Action Button */}
                        <span
                            className="
                            w-full 
                            border-2 border-white rounded-full 
                            px-2 py-2 
                            text-center text-xs font-semibold 
                            text-white 
                            bg-transparent
                            transition-all duration-200
                            group-hover:border-accent-amber group-hover:text-black group-hover:bg-accent-amber
                        "
                        >
                            Open Playground
                        </span>
                    </button>
                ))}

                {!isLoading && sessions.length === 0 && (
                    <div className="w-60 shrink-0 h-40 border-2 border-white/20 rounded-3xl bg-[#141414] p-4 text-sm text-[#a8b8d0] flex items-center justify-center text-center">
                        No playgrounds yet. Create one to get started.
                    </div>
                )}
            </div>
        </section>
    );
}

export default ActivePlayground;
