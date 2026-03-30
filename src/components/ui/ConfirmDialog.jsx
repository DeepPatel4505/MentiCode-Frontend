import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/**
 * ConfirmDialog — lightweight modal for destructive confirmations
 * @param {boolean}  open       - controls visibility
 * @param {string}   message    - confirmation message
 * @param {function} onConfirm  - called when user confirms
 * @param {function} onCancel   - called when user cancels
 */
export default function ConfirmDialog({ open, message, onConfirm, onCancel }) {
  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onCancel?.(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden="true"
      />
      {/* Dialog */}
      <div
        role="alertdialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl",
          "animate-in fade-in zoom-in-95 duration-150"
        )}
      >
        <p className="text-sm text-foreground mb-6">{message}</p>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
          <Button variant="destructive" size="sm" onClick={onConfirm}>Confirm</Button>
        </div>
      </div>
    </div>
  );
}
