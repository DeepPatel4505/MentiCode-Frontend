import React from "react";
import { ChevronRight } from "lucide-react";
import { cn } from "../../../lib/utils";
import FindingCard from "./FindingCard.jsx";

const AuditPanel = ({
    isAuditOpen,
    setIsAuditOpen,
    auditTab,
    setAuditTab,
    tabs,
    filteredFindings,
    handleJumpToLine,
    loading,
    error,
    summary,
    analyzeCode,
}) => {
    const riskTone = {
        high: "bg-red-500/20 text-red-300 border border-red-500/30",
        medium: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
        low: "bg-green-500/20 text-green-300 border border-green-500/30",
    };

    const safeRiskLevel = (summary?.risk_level || "low").toLowerCase();

    return (
        <aside className="h-full bg-[#0d1117] text-[#cbd5e1] flex flex-col min-h-0">
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
                <h3 className="text-sm font-semibold text-white tracking-wide">
                    Code Audit
                </h3>

                <button
                    onClick={() => setIsAuditOpen((prev) => !prev)}
                    className="text-[#94a3b8] hover:text-white transition-colors p-1 rounded hover:bg-white/5"
                    title="Collapse Audit Panel"
                    aria-label="Collapse Audit Panel"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            <div className="px-4 py-3 border-b border-white/10 space-y-2 shrink-0">
                <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wide text-[#94a3b8]">
                        Risk Level
                    </span>
                    <span
                        className={cn(
                            "text-[11px] px-2 py-1 rounded-md font-semibold uppercase tracking-wide",
                            riskTone[safeRiskLevel] || riskTone.low,
                        )}
                    >
                        {safeRiskLevel}
                    </span>
                </div>

                <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2">
                    <p className="text-[11px] uppercase tracking-wide text-[#94a3b8]">
                        Quality Score
                    </p>
                    <p className="text-sm font-semibold text-white">
                        {summary?.overall_quality ?? 0}/100
                    </p>
                </div>
            </div>

            <div className="px-3 py-2 border-b border-white/10 shrink-0">
                <div className="grid grid-cols-4 gap-1 text-[11px] font-semibold">
                {tabs.map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setAuditTab(tab)}
                        className={cn(
                                "px-2 py-1.5 rounded-md transition-colors",
                            auditTab === tab
                                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                                    : "text-[#64748b] border border-transparent hover:text-[#cbd5e1] hover:bg-white/5",
                        )}
                    >
                        {tab}
                    </button>
                ))}
                </div>
            </div>

            <div className="px-4 py-2 border-b border-white/10 shrink-0 min-h-8">
                {loading && (
                    <div className="text-xs text-[#94a3b8]">
                        Analyzing code...
                    </div>
                )}

                {error && (
                    <div className="text-xs text-red-400">{error}</div>
                )}
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-2">
                {filteredFindings.map((f, i) => (
                    <FindingCard
                        key={i}
                        finding={f}
                        onClick={() => handleJumpToLine(f)}
                    />
                ))}

                {filteredFindings.length === 0 && !loading && !error && (
                    <div className="text-xs text-[#64748b] px-1 py-2">
                        No issues found for this scope.
                    </div>
                )}
            </div>

            <div className="px-4 py-3 border-t border-white/10 bg-[#0d1117] shrink-0">
                <button
                    onClick={analyzeCode}
                    disabled={loading}
                    className="w-full py-2 text-xs font-semibold bg-amber-400 text-black rounded-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-amber-300 transition-colors"
                >
                    {loading && (
                        <span className="inline-block h-3 w-3 rounded-full border-2 border-black/40 border-t-black animate-spin" />
                    )}
                    {loading ? "Analyzing..." : "Analyze Code"}
                </button>
            </div>
        </aside>
    );
};

export default AuditPanel;
