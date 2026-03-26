import { cn } from "../../../../lib/utils.js";

function CreatePlaygroundCapacityMeter({ count, limit, compact = false }) {
    const usagePercentage = Math.min((count / limit) * 100, 100);
    const isLimitReached = count >= limit;

    if (compact) {
        return (
            <section
                className="w-55 rounded-xl px-3"
                aria-label="Playground capacity"
            >
                <div className="flex items-center justify-between gap-2">
                    <p className="m-0 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9fb1c8]">
                        Usage
                    </p>
                    <p
                        className={cn(
                            "m-0 text-xs font-bold",
                            isLimitReached ? "text-red-400" : "text-accent-amber",
                        )}
                    >
                        {count}/{limit}
                    </p>
                </div>

                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#2a2f3a]">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-300",
                            isLimitReached
                                ? "bg-linear-to-r from-red-500 to-red-400"
                                : "bg-linear-to-r from-[#ffd18f] to-accent-amber",
                        )}
                        style={{ width: `${usagePercentage}%` }}
                    />
                </div>
            </section>
        );
    }

    return (
        <section className="rounded-2xl border border-white bg-[#141414] p-4" aria-label="Playground capacity">
            <div className="flex items-center justify-between gap-4">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-[#9fb1c8]">
                    Playground Capacity
                </p>
                <p
                    className={cn(
                        "m-0 text-sm font-bold",
                        isLimitReached ? "text-red-400" : "text-accent-amber"
                    )}
                >
                    {count}/{limit}
                </p>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#2a2f3a]">
                <div
                    className={cn(
                        "h-full rounded-full transition-all duration-300",
                        isLimitReached
                            ? "bg-linear-to-r from-red-500 to-red-400"
                            : "bg-linear-to-r from-[#ffd18f] to-accent-amber"
                    )}
                    style={{ width: `${usagePercentage}%` }}
                />
            </div>

            <p className="mt-3 mb-0 text-xs text-[#9fb1c8]">
                {isLimitReached
                    ? "No available slots. Delete one playground to continue."
                    : `${limit - count} slot${limit - count > 1 ? "s" : ""} remaining.`}
            </p>
        </section>
    );
}

export default CreatePlaygroundCapacityMeter;
