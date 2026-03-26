import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router";
import { cn } from "../../../lib/utils.js";

const staticRepositories = [
    {
        id: "frontend-ui-kit",
        name: "Frontend - ui - kit",
        primaryLanguage: "JS",
        totalFiles: 289,
        securityScore: 87,
        logicScore: 82,
    },
    {
        id: "menticode-engine",
        name: "Menticode-engine",
        primaryLanguage: "JS",
        totalFiles: 289,
        securityScore: 90,
        logicScore: 88,
    },
    {
        id: "landing-page-v3",
        name: "landing page - v3",
        primaryLanguage: "HTML",
        totalFiles: 74,
        securityScore: 84,
        logicScore: 79,
    },
    {
        id: "analysis-api",
        name: "analysis-api",
        primaryLanguage: "TS",
        totalFiles: 412,
        securityScore: 91,
        logicScore: 86,
    },
    {
        id: "design-system",
        name: "design-system",
        primaryLanguage: "CSS",
        totalFiles: 138,
        securityScore: 92,
        logicScore: 80,
    },
];

function MyRepositories({ repositories = staticRepositories }) {
    const navigate = useNavigate();
    const refreshTimerRef = useRef(null);

    const [searchTerm, setSearchTerm] = useState("");
    const [repoSource, setRepoSource] = useState(repositories);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedRepositoryId, setExpandedRepositoryId] = useState(null);

    useEffect(() => {
        setRepoSource(repositories);

        setExpandedRepositoryId((previousId) =>
            repositories.some((repo) => repo.id === previousId)
                ? previousId
                : null
        );
    }, [repositories]);

    useEffect(
        () => () => {
            if (refreshTimerRef.current) {
                window.clearTimeout(refreshTimerRef.current);
            }
        },
        []
    );

    const filteredRepositories = useMemo(() => {
        const normalizedSearchTerm = searchTerm.trim().toLowerCase();

        if (!normalizedSearchTerm) {
            return repoSource;
        }

        return repoSource.filter((repository) =>
            repository.name.toLowerCase().includes(normalizedSearchTerm)
        );
    }, [repoSource, searchTerm]);

    useEffect(() => {
        setExpandedRepositoryId((previousId) =>
            filteredRepositories.some((repo) => repo.id === previousId)
                ? previousId
                : null
        );
    }, [filteredRepositories]);

    const handleRefreshSources = () => {
        setIsLoading(true);

        if (refreshTimerRef.current) {
            window.clearTimeout(refreshTimerRef.current);
        }

        refreshTimerRef.current = window.setTimeout(() => {
            setRepoSource([...repositories]);
            setIsLoading(false);
        }, 700);
    };

    const handleToggleExpand = (repositoryId) => {
        setExpandedRepositoryId((previousId) =>
            previousId === repositoryId ? null : repositoryId
        );
    };

    const handleSendToPlayground = (repositoryName) => {
        navigate(`/analyze/playground?repo=${encodeURIComponent(repositoryName)}`);
    };

    const showEmptyState = !isLoading && repoSource.length === 0;
    const showNoMatches =
        !isLoading && repoSource.length > 0 && filteredRepositories.length === 0;

    return (
        <section className="w-full" aria-label="My Repositories">
            {/* Section Header */}
            <div className="mb-8">
                <h2 className="m-0 text-heading-3xl font-heading font-bold tracking-tight text-text-primary">
                    My Repositories
                </h2>
                <p className="mt-3 text-lg-text text-text-muted">
                    Your connected github repositories ready for deep analysis.
                </p>
            </div>

            {/* Controls - Search + Refresh Button */}
            <div className="flex gap-3 items-center mb-8">
                <input
                    type="search"
                    className={cn(
                        "flex-1 min-w-0 h-11 ",
                        "border-2 border-white rounded-full ",
                        "bg-[#141414] backdrop-blur-sm text-[#eef3fb] text-base ",
                        "px-4 py-2 placeholder:text-[#888] ",
                        "focus:outline-none focus:border-accent-amber focus:shadow-[0_0_0_3px_rgba(243,164,45,0.15)] focus:bg-[#1f1f1f] ",
                        "transition-all duration-300"
                    )}
                    placeholder="Search your repositories"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    aria-label="Search repositories"
                />

                <button
                    type="button"
                    className={cn(
                        "shrink-0 h-11 px-5 ",
                        "border-2 border-white rounded-full ",
                        "bg-[#141414] backdrop-blur-sm text-[#edf3fb] ",
                        "text-sm font-semibold ",
                        "cursor-pointer transition-all duration-300 ",
                        "hover:not-disabled:border-accent-amber hover:not-disabled:bg-[#1f1f1f] hover:not-disabled:shadow-[0_4px_12px_rgba(0,0,0,0.15)] ",
                        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-amber focus-visible:outline-offset-2",
                        "disabled:opacity-60 disabled:cursor-wait",
                        "shadow-[0_2px_8px_rgba(0,0,0,0.1)]"
                    )}
                    onClick={handleRefreshSources}
                    disabled={isLoading}
                >
                    {isLoading ? "Refreshing..." : "Refresh Sources"}
                </button>
            </div>

            {/* Loading Skeleton */}
            {isLoading ? (
                <div className="grid gap-3" aria-label="Loading repositories">
                    {[0, 1, 2].map((item) => (
                        <div
                            key={item}
                            className="h-16 border-2 border-[#444] rounded-full bg-skeleton-shimmer bg-skeleton animate-repo-skeleton"
                        />
                    ))}
                </div>
            ) : null}

            {/* Empty State */}
            {showEmptyState ? (
                <div className="border border-[#50607a] rounded-md-radius p-6 bg-[rgba(14,18,25,0.6)] backdrop-blur-sm">
                    <p className="m-0 text-[#dce6f5] text-sm">
                        No repositories found. Connect your GitHub account to continue.
                    </p>
                    <Link
                        to="/analyze/profile"
                        className="mt-4 inline-flex no-underline border border-[#5a7a99] rounded-sm-radius px-4 py-2 text-[#eef3fb] text-sm font-semibold hover:bg-white/5 hover:border-[#7a9ab8] transition-all duration-200"
                    >
                        Connect GitHub
                    </Link>
                </div>
            ) : null}

            {/* No Matches */}
            {showNoMatches ? (
                <div className="border border-[#50607a] rounded-md-radius p-6 bg-[rgba(14,18,25,0.9)]">
                    <p className="m-0 text-[#dce6f5] text-sm">
                        No repositories match your current search.
                    </p>
                </div>
            ) : null}

            {/* Repository List */}
            {!isLoading && !showEmptyState && !showNoMatches ? (
                <div className="grid gap-3" role="list" aria-label="Repository list">
                    {filteredRepositories.map((repository) => {
                        const isExpanded = expandedRepositoryId === repository.id;

                        return (
                            <article
                                key={repository.id}
                                className={cn(
                                    "border-2 rounded-[32px] overflow-hidden transition-all duration-300 ease-out",
                                    isExpanded
                                        ? "border-white bg-[#141414] shadow-[0_8px_24px_rgba(0,0,0,0.3)]"
                                        : "border-white bg-[#141414] backdrop-blur-sm shadow-[0_4px_12px_rgba(0,0,0,0.2)] hover:border-accent-amber hover:bg-[#1a1a1a] hover:-translate-y-0.5"
                                )}
                                role="listitem"
                            >
                                {/* Card Trigger/Header */}
                                <button
                                    type="button"
                                    className="w-full border-none bg-transparent text-inherit cursor-pointer px-5 py-4 min-h-16 flex items-center justify-between gap-4 hover:bg-white/2 transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8aa5cb] focus-visible:outline-offset-2"
                                    onClick={() => handleToggleExpand(repository.id)}
                                    aria-expanded={isExpanded}
                                >
                                    <span className="flex items-center gap-4 min-w-0 flex-1">
                                        {/* Language Badge */}
                                        <span
                                            className="
                                                shrink-0 w-8 h-8
                                                border border-transparent bg-white rounded-sm
                                                text-black 
                                                flex items-center justify-center 
                                                text-xs font-bold tracking-04
                                                shadow-[0_2px_6px_rgba(0,0,0,0.15)]
                                            "
                                            aria-hidden="true"
                                        >
                                            JS
                                        </span>

                                        {/* Title */}
                                        <span
                                            className="text-base font-bold text-[#eef3fb] overflow-hidden text-overflow-ellipsis whitespace-nowrap"
                                            title={repository.name}
                                        >
                                            {repository.name}
                                        </span>
                                    </span>

                                    {/* Expand Icon */}
                                    <span
                                        className={cn(
                                            "shrink-0 w-6 h-6 flex items-center justify-center text-[#b7c7db] transition-all duration-300 ease-out",
                                            isExpanded && "rotate-180 text-[#e6eefb]"
                                        )}
                                        aria-hidden="true"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                        </svg>
                                    </span>
                                </button>

                                        {/* Expandable Panel */}
                                        {isExpanded && (
                                            <div className="border-t-2 border-white bg-[#1a1a1a] p-5 grid gap-4 animate-in fade-in duration-300">
                                                {/* Meta Grid */}
                                                <div className="grid grid-cols-2 gap-4">
                                                    {/* Basic Details */}
                                                    <section className="border border-white rounded-[16px] bg-[#1a1a1a] backdrop-blur-sm p-4">
                                                        <h4 className="m-0 mb-3 text-xs uppercase tracking-uppercase text-[#a7bbd4] font-semibold underline">
                                                            Basic Details
                                                        </h4>
                                                        <ul className="m-0 p-0 list-none flex flex-col gap-3">
                                                            <li className="flex items-center justify-between gap-3">
                                                                <span className="text-sm text-[#e0e0e0] font-medium">Primary Language : </span>
                                                                <span className="text-sm font-semibold text-[#ecf3fc]">
                                                                    {repository.primaryLanguage}
                                                                </span>
                                                            </li>
                                                            <li className="flex items-center justify-between gap-3">
                                                                <span className="text-sm text-[#e0e0e0] font-medium">Total Files : </span>
                                                                <span className="text-sm font-semibold text-[#ecf3fc]">
                                                                    {repository.totalFiles}
                                                                </span>
                                                            </li>
                                                        </ul>
                                                    </section>
        
                                                    {/* Health Summary */}
                                                    <section className="border border-white rounded-[16px] bg-[#1a1a1a] backdrop-blur-sm p-4">
                                                        <h4 className="m-0 mb-3 text-xs uppercase tracking-uppercase text-[#a7bbd4] font-semibold underline">
                                                            Health Summary
                                                        </h4>
                                                        <div className="flex gap-3">
                                                            <div className="px-1 py-1 flex items-center gap-1">
                                                                <span className="text-sm text-[#e0e0e0] font-medium">Security :</span>
                                                                <span className="text-sm font-semibold text-[#ecf3fc]">
                                                                    {repository.securityScore}%
                                                                </span>
                                                            </div>
                                                            <div className="px-1 py-1 flex items-center gap-1">
                                                                <span className="text-sm text-[#e0e0e0] font-medium">Logic :</span>
                                                                <span className="text-sm font-semibold text-[#ecf3fc]">
                                                                    {repository.logicScore}%
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </section>
                                                </div>

                                        {/* Send to Playground Button */}
                                        <button
                                            type="button"
                                            className="
                                                w-full h-11 
                                                border border-[#5a7a99] rounded-sm-radius 
                                                bg-[rgba(34,45,59,0.5)] backdrop-blur-sm
                                                text-[#f4f8ff] text-sm font-bold 
                                                cursor-pointer transition-all duration-200 
                                                hover:border-[#8aa5cb] hover:bg-[rgba(40,52,69,0.7)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.15),0_0_16px_rgba(138,165,203,0.1)]
                                                focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#8aa5cb] focus-visible:outline-offset-2
                                                shadow-[0_2px_8px_rgba(0,0,0,0.1)]
                                            "
                                            onClick={() => handleSendToPlayground(repository.name)}
                                        >
                                            Send to Playground
                                        </button>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            ) : null}
        </section>
    );
}

export default MyRepositories;