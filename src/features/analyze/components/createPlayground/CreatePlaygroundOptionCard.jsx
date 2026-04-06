import { cn } from "../../../../lib/utils.js";

function CreatePlaygroundOptionCard({ title, description, value, selectedValue, onSelect }) {
    const isSelected = value === selectedValue;

    return (
        <button
            type="button"
            onClick={() => onSelect(value)}
            className={cn(
                "group relative w-full rounded-md border p-3.5 text-left transition-all duration-150",
                isSelected
                    ? "border-violet-500/50 bg-violet-500/8"
                    : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-900"
            )}
            aria-pressed={isSelected}
        >
            <span
                className={cn(
                    "absolute right-3 top-3 w-4 h-4 rounded-full border text-[9px] font-bold flex items-center justify-center transition-colors",
                    isSelected
                        ? "border-violet-500 text-violet-400 bg-violet-500/15"
                        : "border-neutral-700 text-neutral-700 group-hover:border-neutral-500"
                )}
                aria-hidden="true"
            >
                {isSelected ? "✓" : ""}
            </span>

            <p className="m-0 pr-6 text-sm font-medium text-neutral-200">{title}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-neutral-600">{description}</p>
        </button>
    );
}

export default CreatePlaygroundOptionCard;
