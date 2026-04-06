import { cn } from "../../../../lib/utils.js";

function CreatePlaygroundOptionCard({
    title,
    description,
    value,
    selectedValue,
    onSelect,
}) {
    const isSelected = value === selectedValue;

    return (
        <button
            type="button"
            onClick={() => onSelect(value)}
            className={cn(
                "group relative w-full rounded-3xl border-2 p-4 text-left transition-all duration-300",
                isSelected
                    ? "border-accent-amber bg-[#1f1f1f] shadow-[0_10px_24px_rgba(0,0,0,0.25),0_0_18px_rgba(243,164,45,0.18)]"
                    : "border-white bg-[#141414] hover:border-accent-amber hover:bg-[#1a1a1a]"
            )}
            aria-pressed={isSelected}
        >
            <span
                className={cn(
                    "absolute right-4 top-4 grid h-5 w-5 place-items-center rounded-full border text-xs font-bold transition-colors",
                    isSelected
                        ? "border-accent-amber text-accent-amber"
                        : "border-white/60 text-white/60 group-hover:border-accent-amber group-hover:text-accent-amber"
                )}
                aria-hidden="true"
            >
                {isSelected ? "✓" : ""}
            </span>

            <p className="m-0 pr-8 text-sm font-semibold text-white">{title}</p>
            <p className="mt-2 text-xs leading-relaxed text-[#a8b8d0]">
                {description}
            </p>
        </button>
    );
}

export default CreatePlaygroundOptionCard;
