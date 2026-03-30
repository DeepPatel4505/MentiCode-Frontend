import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind CSS classes with support for conditional classes.
 * Automatically handles class conflicts by giving precedence to later classes.
 * 
 * @param {...any} inputs - Class names, conditional objects, or arrays
 * @returns {string} Merged class string
 * 
 * @example
 * cn('px-2 py-1', true && 'bg-red-500') // 'px-2 py-1 bg-red-500'
 * cn('px-4 py-2', 'px-2') // 'py-2 px-2' (px-2 takes precedence)
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const DIFFICULTY_CONFIG = {
  beginner: {
    label: "Beginner",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
  },
  intermediate: {
    label: "Intermediate",
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
  },
  advanced: {
    label: "Advanced",
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
  },
};

export function getDifficultyConfig(difficulty) {
  return DIFFICULTY_CONFIG[difficulty] ?? {
    label: "Unknown",
    color: "text-muted-foreground",
    bg: "bg-secondary border-border",
  };
}

export function formatDuration(seconds = 0) {
  const total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);

  if (hrs > 0) return `${hrs}h ${mins}m`;
  if (mins > 0) return `${mins}m`;
  return "<1m";
}

export function formatXp(value = 0) {
  const num = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(num);
}

export function timeAgo(input) {
  if (!input) return "-";
  const date = new Date(input);
  if (Number.isNaN(date.getTime())) return "-";

  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";

  const intervals = [
    [31536000, "year"],
    [2592000, "month"],
    [86400, "day"],
    [3600, "hour"],
    [60, "minute"],
  ];

  for (const [unitSeconds, unitLabel] of intervals) {
    const amount = Math.floor(seconds / unitSeconds);
    if (amount >= 1) return `${amount} ${unitLabel}${amount > 1 ? "s" : ""} ago`;
  }

  return "just now";
}

export function triggerConfetti() {
  if (typeof window === "undefined" || typeof document === "undefined") return;

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.inset = "0";
  container.style.pointerEvents = "none";
  container.style.zIndex = "300";

  const colors = ["#60a5fa", "#3b82f6", "#22c55e", "#f59e0b", "#f43f5e"];
  const pieces = 60;

  for (let i = 0; i < pieces; i += 1) {
    const piece = document.createElement("span");
    piece.style.position = "absolute";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.top = "-10px";
    piece.style.width = "8px";
    piece.style.height = "12px";
    piece.style.borderRadius = "2px";
    piece.style.background = colors[i % colors.length];
    piece.style.opacity = "0.95";
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    piece.style.transition = `transform 1200ms ease-out, top 1200ms ease-out, opacity 1200ms ease-out`;
    container.appendChild(piece);

    requestAnimationFrame(() => {
      const drift = (Math.random() - 0.5) * 200;
      piece.style.top = "110%";
      piece.style.transform = `translateX(${drift}px) rotate(${Math.random() * 720}deg)`;
      piece.style.opacity = "0";
    });
  }

  document.body.appendChild(container);
  setTimeout(() => container.remove(), 1300);
}
