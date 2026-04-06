import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs) => twMerge(clsx(inputs));

export const formatDuration = (seconds) => {
  if (!seconds) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
};

export const formatXp = (xp) => {
  if (!xp) return "0";
  return xp >= 1000 ? `${(xp / 1000).toFixed(1)}k` : xp.toString();
};

export const getDifficultyConfig = (difficulty) => ({
  beginner:     { label: "Beginner",     color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  intermediate: { label: "Intermediate", color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/20" },
  advanced:     { label: "Advanced",     color: "text-red-400",     bg: "bg-red-400/10 border-red-400/20" },
}[difficulty] ?? { label: difficulty, color: "text-muted-foreground", bg: "bg-muted border-border" });

export const getProgressColor = (pct) => {
  if (pct >= 100) return "bg-emerald-500";
  if (pct >= 50)  return "bg-blue-500";
  return "bg-blue-500/70";
};

export const timeAgo = (date) => {
  const diff  = Date.now() - new Date(date).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins  < 1)  return "just now";
  if (mins  < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days  < 30) return `${days}d ago`;
  return new Date(date).toLocaleDateString();
};

export const truncate = (str, n = 100) => str?.length > n ? str.slice(0, n) + "…" : str;

// Confetti effect
export const triggerConfetti = () => {
  const colors = ["#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE", "#ffffff"];
  for (let i = 0; i < 80; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.cssText = `
      left: ${Math.random() * 100}vw;
      top: -10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${1.5 + Math.random() * 2}s;
      animation-delay: ${Math.random() * 0.5}s;
      transform: rotate(${Math.random() * 360}deg);
    `;
    document.body.appendChild(piece);
    setTimeout(() => piece.remove(), 4000);
  }
};
