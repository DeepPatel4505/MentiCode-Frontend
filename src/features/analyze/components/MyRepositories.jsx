import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, RefreshCw, ChevronDown, ArrowRight, Github, Loader2 } from "lucide-react";
import { cn } from "../../../lib/utils.js";
import { useAuth } from "../../auth/hooks/useAuth.js";
import { getGithubPublicRepos, sendGithubRepoToPlayground } from "../services/analyze.api.js";
import { languageToSymbolMap } from "../utils/languageTosymbolmap.js";

function ScorePill({ label, value }) {
    if (value == null) return null;
    return (
        <span className="flex items-center gap-1 text-xs">
            <span className="text-neutral-500">{label}</span>
            <span className="font-semibold text-neutral-300">{value}</span>
        </span>
    );
}

function MyRepositories() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [searchTerm, setSearchTerm] = useState("");
    const [repoSource, setRepoSource] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [expandedRepositoryId, setExpandedRepositoryId] = useState(null);
    const [error, setError] = useState("");
    const [sendingRepoId, setSendingRepoId] = useState("");

    const isGithubUser =
        Boolean(user?.githubId) ||
        (user?.loginProvider || "").toLowerCase() === "github";
    const githubIdentity = user?.githubId || user?.username || "";

    const fetchRepos = async () => {
        if (!isGithubUser || !githubIdentity) {
            setRepoSource([]);
            return;
        }
        try {
            setIsLoading(true);
            setError("");
            const repos = await getGithubPublicRepos(githubIdentity);
            setRepoSource(repos);
        } catch (e) {
            setError(e?.message || "Failed to fetch GitHub repositories.");
            setRepoSource([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchRepos(); }, [isGithubUser, githubIdentity]);

    const filteredRepositories = useMemo(() => {
        const q = searchTerm.trim().toLowerCase();
        return q ? repoSource.filter((r) => r.name.toLowerCase().includes(q)) : repoSource;
    }, [repoSource, searchTerm]);

    useEffect(() => {
        setExpandedRepositoryId((prev) =>
            filteredRepositories.some((r) => r.id === prev) ? prev : null
        );
    }, [filteredRepositories]);

    const handleToggleExpand = (id) => {
        setExpandedRepositoryId((prev) => (prev === id ? null : id));
    };

    const handleSendToPlayground = async (repo) => {
        try {
            setSendingRepoId(repo.id);
            setError("");
            const created = await sendGithubRepoToPlayground({
                owner: repo.owner,
                repoName: repo.name,
                defaultBranch: repo.defaultBranch,
            });
            navigate(`/analyze/playground/${created.id}`);
        } catch (e) {
            setError(e?.message || "Failed to import repository.");
        } finally {
            setSendingRepoId("");
        }
    };

    const showEmptyState = !isLoading && repoSource.length === 0;
    const showNoMatches = !isLoading && repoSource.length > 0 && filteredRepositories.length === 0;

    return (
        <section className="w-full" aria-label="My Repositories">
            <div className="mb-5">
                <h2 className="text-xl font-semibold text-white tracking-tight">My Repositories</h2>
                <p className="mt-1 text-sm text-neutral-500">
                    {isGithubUser
                        ? "Your GitHub repositories ready for analysis."
                        : "Connect GitHub to import repositories for analysis."}
                </p>
            </div>

            {/* GitHub not connected */}
            {!isGithubUser && (
                <div className="border border-neutral-800 rounded-lg p-5 bg-neutral-900/50 flex items-start gap-3">
                    <Github className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm text-neutral-300 font-medium">GitHub account not connected</p>
                        <p className="text-xs text-neutral-500 mt-0.5">Repository analysis requires a GitHub-connected account.</p>
                        <Link
                            to="/profile"
                            className="mt-3 inline-flex items-center gap-1.5 no-underline text-xs font-medium text-violet-400 hover:text-violet-300 transition-colors"
                        >
                            Connect in Profile <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="mb-4 rounded-md border border-red-500/30 bg-red-500/8 px-4 py-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            {isGithubUser && (
                <>
                    {/* Controls */}
                    <div className="flex gap-2 items-center mb-4">
                        <label className="flex-1 flex items-center gap-2 h-9 px-3 rounded-md border border-neutral-800 bg-neutral-900/80 focus-within:border-violet-500/50 transition-colors">
                            <Search className="w-3.5 h-3.5 text-neutral-600 shrink-0" />
                            <input
                                type="search"
                                className="flex-1 bg-transparent text-sm text-neutral-200 placeholder:text-neutral-600 outline-none border-none"
                                placeholder="Search repositories…"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                aria-label="Search repositories"
                            />
                        </label>
                        <button
                            type="button"
                            className={cn(
                                "shrink-0 h-9 px-3 flex items-center gap-1.5",
                                "border border-neutral-800 rounded-md",
                                "bg-neutral-900/80 text-neutral-400 text-sm font-medium",
                                "transition-all duration-150",
                                "hover:border-neutral-700 hover:text-neutral-200 hover:bg-neutral-800",
                                "disabled:opacity-50 disabled:cursor-wait"
                            )}
                            onClick={fetchRepos}
                            disabled={isLoading}
                        >
                            <RefreshCw className={cn("w-3.5 h-3.5", isLoading && "animate-spin")} />
                            {isLoading ? "Loading…" : "Refresh"}
                        </button>
                    </div>

                    {/* Skeleton */}
                    {isLoading && (
                        <div className="grid gap-2">
                            {[0, 1, 2].map((i) => (
                                <div key={i} className="h-14 border border-neutral-800 rounded-lg bg-neutral-900/50 animate-pulse" />
                            ))}
                        </div>
                    )}

                    {/* Empty state */}
                    {showEmptyState && (
                        <div className="border border-neutral-800 rounded-lg p-5 bg-neutral-900/50">
                            <p className="text-sm text-neutral-400">No repositories found.</p>
                        </div>
                    )}

                    {/* No matches */}
                    {showNoMatches && (
                        <div className="border border-neutral-800 rounded-lg p-5 bg-neutral-900/50">
                            <p className="text-sm text-neutral-400">No repositories match your search.</p>
                        </div>
                    )}

                    {/* Repository list */}
                    {!isLoading && !showEmptyState && !showNoMatches && (
                        <div className="grid gap-2" role="list">
                            {filteredRepositories.map((repo) => {
                                const isExpanded = expandedRepositoryId === repo.id;
                                const isSending = sendingRepoId === repo.id;
                                const langSymbol = languageToSymbolMap[(repo.primaryLanguage || "").toLowerCase()] || repo.primaryLanguage?.slice(0, 3) || "--";

                                return (
                                    <article
                                        key={repo.id}
                                        className={cn(
                                            "border rounded-lg overflow-hidden transition-all duration-150",
                                            isExpanded
                                                ? "border-violet-500/30 bg-neutral-900"
                                                : "border-neutral-800 bg-neutral-900/80 hover:border-neutral-700"
                                        )}
                                        role="listitem"
                                    >
                                        <button
                                            type="button"
                                            className="w-full border-none bg-transparent text-inherit cursor-pointer px-4 py-3 min-h-14 flex items-center justify-between gap-3 hover:bg-white/[0.02] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-violet-500/50 focus-visible:outline-offset-[-2px]"
                                            onClick={() => handleToggleExpand(repo.id)}
                                            aria-expanded={isExpanded}
                                        >
                                            <span className="flex items-center gap-3 min-w-0 flex-1">
                                                <span className="shrink-0 w-7 h-7 border border-neutral-700 rounded-md bg-neutral-800 text-neutral-300 flex items-center justify-center text-[9px] font-bold tracking-wide">
                                                    {langSymbol}
                                                </span>
                                                <span className="text-sm font-medium text-neutral-200 truncate" title={repo.name}>
                                                    {repo.name}
                                                </span>
                                            </span>
                                            <span className="flex items-center gap-3 shrink-0">
                                                <span className="text-xs text-neutral-600 hidden sm:block capitalize">{repo.visibility}</span>
                                                <ChevronDown className={cn("w-4 h-4 text-neutral-600 transition-transform duration-200", isExpanded && "rotate-180 text-violet-400")} />
                                            </span>
                                        </button>

                                        {isExpanded && (
                                            <div className="border-t border-neutral-800 bg-neutral-950/50 p-4 grid gap-3 animate-in fade-in duration-200">
                                                <div className="grid grid-cols-2 gap-3">
                                                    {/* Details */}
                                                    <div className="border border-neutral-800 rounded-md bg-neutral-900/60 p-3">
                                                        <h4 className="m-0 mb-2.5 text-[10px] uppercase tracking-[0.08em] text-neutral-600 font-semibold">Details</h4>
                                                        <ul className="m-0 p-0 list-none flex flex-col gap-2">
                                                            <li className="flex items-center justify-between">
                                                                <span className="text-xs text-neutral-500">Language</span>
                                                                <span className="text-xs font-semibold text-neutral-200">{repo.primaryLanguage || "—"}</span>
                                                            </li>
                                                            <li className="flex items-center justify-between">
                                                                <span className="text-xs text-neutral-500">Visibility</span>
                                                                <span className="text-xs font-semibold text-neutral-200 capitalize">{repo.visibility}</span>
                                                            </li>
                                                            <li className="flex items-center justify-between">
                                                                <span className="text-xs text-neutral-500">Updated</span>
                                                                <span className="text-xs font-semibold text-neutral-200">
                                                                    {repo.updatedAt ? new Date(repo.updatedAt).toLocaleDateString() : "—"}
                                                                </span>
                                                            </li>
                                                        </ul>
                                                    </div>

                                                    {/* Stats */}
                                                    <div className="border border-neutral-800 rounded-md bg-neutral-900/60 p-3">
                                                        <h4 className="m-0 mb-2.5 text-[10px] uppercase tracking-[0.08em] text-neutral-600 font-semibold">Stats</h4>
                                                        <div className="flex flex-col gap-2">
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-neutral-500">Stars</span>
                                                                <span className="text-xs font-semibold text-neutral-200">{repo.stars ?? 0}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-neutral-500">Forks</span>
                                                                <span className="text-xs font-semibold text-neutral-200">{repo.forks ?? 0}</span>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-xs text-neutral-500">Issues</span>
                                                                <span className="text-xs font-semibold text-neutral-200">{repo.openIssues ?? 0}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <button
                                                    type="button"
                                                    disabled={isSending}
                                                    className="w-full h-9 border border-violet-500/30 rounded-md bg-violet-500/8 text-violet-400 text-sm font-medium cursor-pointer transition-all duration-150 hover:border-violet-500/60 hover:bg-violet-500/15 hover:text-violet-300 disabled:opacity-50 disabled:cursor-wait flex items-center justify-center gap-2"
                                                    onClick={() => handleSendToPlayground(repo)}
                                                >
                                                    {isSending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                                    {isSending ? "Importing…" : "Send to Playground"}
                                                </button>
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </>
            )}
        </section>
    );
}

export default MyRepositories;
