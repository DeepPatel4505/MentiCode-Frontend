import { createContext, useContext, useState, useCallback } from "react";
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastCtx = createContext(null);
export const useToast = () => useContext(ToastCtx);

let toastId = 0;

const config = {
  success: { icon: CheckCircle2, bg: "bg-success/10 border-success/30", text: "text-green-400" },
  error:   { icon: AlertCircle,  bg: "bg-destructive/10 border-destructive/30", text: "text-red-400" },
  warning: { icon: AlertTriangle,bg: "bg-warning/10 border-warning/30", text: "text-amber-400" },
  info:    { icon: Info,         bg: "bg-primary/10 border-primary/30", text: "text-primary" },
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, type = "info", duration = 4000 }) => {
    const id = ++toastId;
    setToasts((prev) => [...prev.slice(-4), { id, title, description, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), duration);
  }, []);

  const dismiss = (id) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastCtx.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => {
          const C = config[t.type] ?? config.info;
          return (
            <div key={t.id} className={cn(
              "flex items-start gap-3 p-4 rounded-2xl border shadow-2xl animate-fade-in-up pointer-events-auto",
              "bg-card backdrop-blur-md", C.bg
            )}>
              <C.icon className={cn("w-4 h-4 mt-0.5 shrink-0", C.text)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-tight">{t.title}</p>
                {t.description && <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>}
              </div>
              <button onClick={() => dismiss(t.id)} className="text-muted-foreground hover:text-foreground shrink-0 transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastCtx.Provider>
  );
}
