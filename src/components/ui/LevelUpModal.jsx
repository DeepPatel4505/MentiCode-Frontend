import { useEffect, useRef } from "react";
import { Zap, Star, X } from "lucide-react";
import { triggerConfetti } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import useCourse from "@/features/course/hooks/useCourse";

export default function LevelUpModal() {
  const { showLevelUp: show, newLevel, dismissLevelUp } = useCourse();
  const triggered  = useRef(false);

  useEffect(() => {
    if (show && !triggered.current) {
      triggered.current = true;
      triggerConfetti();
      // Auto-dismiss after 5s
      const t = setTimeout(() => {
        dismissLevelUp();
        triggered.current = false;
      }, 5000);
      return () => clearTimeout(t);
    }
    if (!show) triggered.current = false;
  }, [dismissLevelUp, show]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <div className="relative w-full max-w-sm text-center animate-bounce-in">
        {/* Glow ring */}
        <div className="absolute inset-0 rounded-3xl bg-primary/20 blur-2xl scale-110 pointer-events-none" />

        <div className="relative bg-card border border-primary/40 rounded-3xl p-8 shadow-2xl overflow-hidden">
          {/* Stars bg decoration */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(6)].map((_, i) => (
              <Star key={i}
                className="absolute text-primary/20 fill-primary/10 animate-pulse-slow"
                style={{
                  width: `${12 + i * 4}px`,
                  height: `${12 + i * 4}px`,
                  top:  `${10 + (i % 3) * 30}%`,
                  left: `${5  + (i * 17) % 90}%`,
                  animationDelay: `${i * 0.3}s`,
                }}
              />
            ))}
          </div>

          {/* Level badge */}
          <div className="relative mb-5">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center mx-auto shadow-xl shadow-primary/40 level-up-pop">
              <div className="text-center">
                <Zap className="w-6 h-6 text-white mx-auto mb-0.5" />
                <span className="text-white font-black text-xl leading-none">{newLevel}</span>
              </div>
            </div>
            {/* Pulse ring */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 rounded-full border-2 border-primary animate-pulse-ring" />
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-2">Level up!</p>
            <h2 className="text-3xl font-black mb-2">You reached</h2>
            <h3 className="text-2xl font-bold gradient-text">Level {newLevel}!</h3>
            <p className="text-muted-foreground text-sm mt-2">
              Amazing progress. Keep going — you're unstoppable! 🚀
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="gradient" className="flex-1 gap-2" onClick={dismissLevelUp}>
              <Zap className="w-4 h-4" /> Keep learning!
            </Button>
          </div>

          <button
            onClick={dismissLevelUp}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
