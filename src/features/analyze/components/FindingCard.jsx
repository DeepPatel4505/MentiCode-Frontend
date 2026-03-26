import { cn } from "../../../lib/utils";

function FindingCard({ finding, onClick }) {
    return (
        <div
            className="p-3 rounded-lg border border-white/10 bg-[#111827] hover:bg-[#1a1a1a] cursor-pointer transition"
            onClick={onClick}
        >
            <div className="flex justify-between items-center mb-1">
                <span
                    className={cn(
                        "text-xs font-bold uppercase",
                        finding.severity?.toLowerCase() === "critical" &&
                            "text-red-400",
                        finding.severity?.toLowerCase() === "major" &&
                            "text-yellow-400",
                        finding.severity?.toLowerCase() === "minor" &&
                            "text-blue-400",
                    )}
                >
                    {finding.severity}
                </span>

                <span className="text-[10px] text-[#64748b]">
                    Lines {finding.line_range?.[0] ?? "?"}-
                    {finding.line_range?.[1] ?? "?"}
                </span>
            </div>

            <p className="text-sm font-semibold text-white">{finding.issue}</p>

            <p className="text-xs text-[#a8b8d0] mt-1 line-clamp-2">
                {finding.why_it_matters}
            </p>
        </div>
    );
}

export default FindingCard;