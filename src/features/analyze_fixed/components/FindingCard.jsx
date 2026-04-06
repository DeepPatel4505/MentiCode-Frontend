import { useState } from "react";
import { ChevronDown, Lightbulb, Wrench } from "lucide-react";
import { cn } from "../../../lib/utils";

function FindingCard({ finding, onClick }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeView, setActiveView] = useState("hint");

    const abstractIssue = finding.abstract_issue || finding.issue || "Issue detected";
    const hintText = finding.hint || "No hint provided.";
    const guidedFixText = finding.guided_fix || "No guided fix provided.";

    const handleCardClick = () => {
        setIsOpen((prev) => !prev);
        onClick?.();
    };

    const severityColor = {
        critical: "text-red-400",
        major: "text-yellow-400",
        minor: "text-blue-400",
    }[finding.severity?.toLowerCase()] ?? "text-[#94a3b8]";

    return (
        <div
            className="p-3 rounded-lg border border-white/10 bg-[#111827] hover:bg-[#1a1a1a] cursor-pointer transition"
            onClick={handleCardClick}
        >
            <div className="flex justify-between items-center mb-1">
                <span className={cn("text-xs font-bold uppercase", severityColor)}>
                    {finding.severity}
                </span>
                <span className="text-[10px] text-[#64748b]">
                    Lines {finding.line_range?.[0] ?? "?"}-{finding.line_range?.[1] ?? "?"}
                </span>
            </div>

            <p className="text-sm font-semibold text-white">{abstractIssue}</p>

            <p className="text-xs text-[#a8b8d0] mt-1 line-clamp-2">
                {finding.why_it_matters}
            </p>

            {isOpen && (
                <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={() => setActiveView("hint")}
                            className={cn(
                                "flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-colors",
                                activeView === "hint"
                                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                                    : "text-[#64748b] hover:text-white border border-transparent hover:border-white/10"
                            )}
                        >
                            <Lightbulb size={12} />
                            Hint
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveView("guided_fix")}
                            className={cn(
                                "flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold transition-colors",
                                activeView === "guided_fix"
                                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                                    : "text-[#64748b] hover:text-white border border-transparent hover:border-white/10"
                            )}
                        >
                            <Wrench size={12} />
                            Guided Fix
                        </button>
                    </div>

                    <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2">
                        <p className="text-[10px] uppercase tracking-wide text-[#94a3b8] mb-1">
                            {activeView === "hint" ? "Hint" : "Guided Fix"}
                        </p>
                        <p className="text-xs text-[#cbd5e1] leading-relaxed">
                            {activeView === "hint" ? hintText : guidedFixText}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            onClick?.(finding);
                        }}
                        className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-semibold transition-colors"
                    >
                        <ChevronDown size={12} />
                        Jump to line
                    </button>
                </div>
            )}
        </div>
    );
}

export default FindingCard;
