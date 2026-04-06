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
        <aside className="h-full bg-[hsl(240_10%_4%)] text-neutral-400 flex flex-col min-h-0 border-l border-white/[0.06]">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between shrink-0">
                <h3 className="text-sm font-semibold text-white">Code Audit</h3>
                <button
                    onClick={() => setIsAuditOpen(prev => !prev)}
                    className="text-neutral-600 hover:text-neutral-300 transition-colors p-1 rounded hover:bg-white/5"
                    title="Collapse Audit Panel"
                    aria-label="Collapse Audit Panel"
                >
                    <ChevronRight className="h-4 w-4" />
                </button>
            </div>

            {/* Summary */}
            <div className="px-4 py-3 border-b border-white/[0.06] space-y-2 shrink-0">
                <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-neutral-600">Risk Level</span>
                    <span className={cn("text-[10px] px-2 py-0.5 rounded font-semibold uppercase tracking-wide", riskTone[safeRiskLevel] || riskTone.low)}>
                        {safeRiskLevel}
                    </span>
                </div>
                <div className="rounded-md border border-neutral-800 bg-neutral-900/60 px-3 py-2">
                    <p className="text-[10px] uppercase tracking-[0.08em] text-neutral-600">Quality Score</p>
                    <p className="text-sm font-semibold text-white mt-0.5">{summary?.overall_quality ?? 0}/100</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="px-3 py-2 border-b border-white/[0.06] shrink-0">
                <div className="grid grid-cols-4 gap-1 text-[11px] font-medium">
                    {tabs.map(tab => (
                        <button
                            key={tab}
                            onClick={() => setAuditTab(tab)}
                            className={cn(
                                "px-2 py-1.5 rounded transition-colors",
                                auditTab === tab
                                    ? "bg-violet-500/15 text-violet-300 border border-violet-500/30"
                                    : "text-neutral-600 border border-transparent hover:text-neutral-300 hover:bg-white/5"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Status */}
            <div className="px-4 py-2 border-b border-white/[0.06] shrink-0 min-h-8">
                {loading && <div className="text-xs text-neutral-500">Analyzing code…</div>}
                {error && <div className="text-xs text-red-400">{error}</div>}
            </div>

            {/* Findings */}
            <div className="flex-1 min-h-0 overflow-y-auto px-3 py-2 space-y-2">
                {filteredFindings.map((f, i) => (
                    <FindingCard key={i} finding={f} onClick={() => handleJumpToLine(f)} />
                ))}
                {filteredFindings.length === 0 && !loading && !error && (
                    <div className="text-xs text-neutral-700 px-1 py-2">No issues found for this scope.</div>
                )}
            </div>

            {/* Analyze button */}
            <div className="px-4 py-3 border-t border-white/[0.06] shrink-0">
                <button
                    onClick={analyzeCode}
                    disabled={loading}
                    className="w-full py-2 text-xs font-semibold bg-violet-600 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-violet-500 transition-colors"
                >
                    {loading && <span className="inline-block h-3 w-3 rounded-full border-2 border-white/30 border-t-white animate-spin" />}
                    {loading ? "Analyzing…" : "Analyze Code"}
                </button>
            </div>
        </aside>
    );
};

export default AuditPanel;
