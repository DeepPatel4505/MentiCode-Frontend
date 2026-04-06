import { useState } from "react";
import { Lightbulb, Wrench } from "lucide-react";
import { cn } from "../../../lib/utils";

const severityConfig = {
    critical: { color: "text-red-400",   dot: "bg-red-500" },
    major:    { color: "text-amber-400", dot: "bg-amber-500" },
    minor:    { color: "text-blue-400",  dot: "bg-blue-500" },
};

function getDisplayLineRange(finding) {
    const lineRange = Array.isArray(finding?.line_range)
        ? finding.line_range
        : null;

    if (lineRange && lineRange.length >= 2) {
        const start = Number(lineRange[0]);
        const end = Number(lineRange[1]);
        if (Number.isInteger(start) && start > 0) {
            return [start, Number.isInteger(end) && end >= start ? end : start];
        }
    }

    const start = Number(
        finding?.line_number ??
            finding?.line ??
            finding?.start_line,
    );
    const end = Number(finding?.end_line);

    if (Number.isInteger(start) && start > 0) {
        return [start, Number.isInteger(end) && end >= start ? end : start];
    }

    if (typeof finding?.line_range === "string") {
        const matched = finding.line_range.match(/\d+/g) || [];
        if (matched.length > 0) {
            const parsedStart = Number(matched[0]);
            const parsedEnd = Number(matched[1] ?? matched[0]);
            if (Number.isInteger(parsedStart) && parsedStart > 0) {
                return [
                    parsedStart,
                    Number.isInteger(parsedEnd) && parsedEnd >= parsedStart
                        ? parsedEnd
                        : parsedStart,
                ];
            }
        }
    }

    return ["?", "?"];
}

function FindingCard({ finding, onClick }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeView, setActiveView] = useState("hint");

    const sev    = finding.severity?.toLowerCase();
    const config = severityConfig[sev] || { color: "text-neutral-400", dot: "bg-neutral-500" };

    // Support both old (issue) and new (abstract_issue) field names
    const title    = finding.abstract_issue || finding.issue || "Issue detected";
    const hint     = finding.hint || "No hint provided.";
    const guidedFix = finding.guided_fix || "No guided fix provided.";
    const [startLine, endLine] = getDisplayLineRange(finding);

    const handleCardClick = () => {
        setIsOpen((prev) => !prev);
        onClick?.();
    };

    return (
        <div
            className="p-3 rounded-md border border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-900 cursor-pointer transition-colors duration-150"
            onClick={handleCardClick}
        >
            {/* Header row */}
            <div className="flex justify-between items-center mb-1.5">
                <span className={cn("flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.06em]", config.color)}>
                    <span className={cn("w-1.5 h-1.5 rounded-full", config.dot)} />
                    {finding.severity}
                </span>
                <span className="text-[10px] text-neutral-700 font-mono">
                    L{startLine}–{endLine}
                </span>
            </div>

            <p className="text-xs font-medium text-neutral-200 leading-snug">{title}</p>

            {finding.why_it_matters && (
                <p className="text-[11px] text-neutral-600 mt-1 line-clamp-2 leading-relaxed">
                    {finding.why_it_matters}
                </p>
            )}

            {/* Expanded: hint / guided fix tabs */}
            {isOpen && (
                <div className="mt-3 space-y-2" onClick={(e) => e.stopPropagation()}>
                    <div className="flex gap-1.5">
                        {[
                            { id: "hint",        label: "Hint",        icon: Lightbulb },
                            { id: "guided_fix",  label: "Guided Fix",  icon: Wrench },
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                type="button"
                                onClick={() => setActiveView(id)}
                                className={cn(
                                    "flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold transition-colors",
                                    activeView === id
                                        ? "bg-violet-500/15 text-violet-300 border border-violet-500/30"
                                        : "text-neutral-600 hover:text-neutral-300 border border-transparent hover:border-neutral-700"
                                )}
                            >
                                <Icon size={11} />
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="rounded-md border border-neutral-800 bg-neutral-950/60 px-3 py-2.5">
                        <p className="text-[10px] uppercase tracking-[0.08em] text-neutral-600 mb-1">
                            {activeView === "hint" ? "Hint" : "Guided Fix"}
                        </p>
                        <p className="text-xs text-neutral-300 leading-relaxed">
                            {activeView === "hint" ? hint : guidedFix}
                        </p>
                    </div>

                    <p className="text-[10px] text-neutral-600">Selecting this card highlights matching lines in the editor.</p>
                </div>
            )}
        </div>
    );
}

export default FindingCard;
