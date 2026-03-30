import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { cva } from "class-variance-authority";

// ── Input ──────────────────────────────────────────────────────
export const Input = forwardRef(({ className, error, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-xl border bg-secondary px-3 py-2 text-sm",
      "placeholder:text-muted-foreground",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
      error ? "border-destructive focus-visible:ring-destructive" : "border-border",
      className
    )}
    {...props}
  />
));
Input.displayName = "Input";

// ── Textarea ───────────────────────────────────────────────────
export const Textarea = forwardRef(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[80px] w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm",
      "placeholder:text-muted-foreground resize-none",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      className
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

// ── Label ──────────────────────────────────────────────────────
export const Label = forwardRef(({ className, ...props }, ref) => (
  <label ref={ref} className={cn("text-sm font-medium text-foreground/90", className)} {...props} />
));
Label.displayName = "Label";

// ── Select ─────────────────────────────────────────────────────
export const Select = forwardRef(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-10 w-full rounded-xl border border-border bg-secondary px-3 py-2 text-sm",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      className
    )}
    {...props}
  >{children}</select>
));
Select.displayName = "Select";

// ── Card ───────────────────────────────────────────────────────
export const Card = forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("rounded-2xl border border-border bg-card text-card-foreground", className)} {...props} />
));
Card.displayName = "Card";

export const CardHeader  = forwardRef(({ className, ...props }, ref) => <div ref={ref} className={cn("flex flex-col gap-1.5 p-6", className)} {...props} />);
CardHeader.displayName = "CardHeader";
export const CardTitle   = forwardRef(({ className, ...props }, ref) => <h3 ref={ref} className={cn("font-semibold text-lg leading-none", className)} {...props} />);
CardTitle.displayName = "CardTitle";
export const CardDescription = forwardRef(({ className, ...props }, ref) => <p ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props} />);
CardDescription.displayName = "CardDescription";
export const CardContent = forwardRef(({ className, ...props }, ref) => <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />);
CardContent.displayName = "CardContent";
export const CardFooter  = forwardRef(({ className, ...props }, ref) => <div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props} />);
CardFooter.displayName = "CardFooter";

// ── Badge ──────────────────────────────────────────────────────
const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-full text-xs font-semibold transition-colors px-2.5 py-0.5",
  {
    variants: {
      variant: {
        default:     "bg-primary/10 text-primary border border-primary/20",
        secondary:   "bg-secondary text-secondary-foreground border border-border",
        success:     "bg-success/10 text-green-400 border border-success/20",
        warning:     "bg-warning/10 text-amber-400 border border-warning/20",
        destructive: "bg-destructive/10 text-red-400 border border-destructive/20",
        outline:     "border border-border text-foreground",
        pro:         "bg-gradient-to-r from-blue-600 to-blue-400 text-white border-0",
      },
    },
    defaultVariants: { variant: "default" },
  }
);
export const Badge = ({ className, variant, ...props }) => (
  <span className={cn(badgeVariants({ variant }), className)} {...props} />
);

// ── Progress ───────────────────────────────────────────────────
export const Progress = forwardRef(({ className, value = 0, color, ...props }, ref) => (
  <div ref={ref} className={cn("relative h-2 w-full overflow-hidden rounded-full bg-secondary", className)} {...props}>
    <div
      className={cn("progress-fill h-full rounded-full", color ?? "bg-primary")}
      style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
    />
  </div>
));
Progress.displayName = "Progress";

// ── Skeleton ───────────────────────────────────────────────────
export const Skeleton = ({ className, ...props }) => (
  <div className={cn("skeleton rounded-xl", className)} {...props} />
);

// ── Separator ─────────────────────────────────────────────────
export const Separator = forwardRef(({ className, orientation = "horizontal", ...props }, ref) => (
  <div
    ref={ref}
    className={cn("shrink-0 bg-border", orientation === "horizontal" ? "h-px w-full" : "h-full w-px", className)}
    {...props}
  />
));
Separator.displayName = "Separator";

// ── Avatar ─────────────────────────────────────────────────────
export const Avatar = ({ src, name, size = "md", className }) => {
  const sizes = { xs: "w-6 h-6 text-xs", sm: "w-8 h-8 text-sm", md: "w-10 h-10 text-sm", lg: "w-12 h-12 text-base", xl: "w-16 h-16 text-xl" };
  const initial = name?.[0]?.toUpperCase() ?? "U";
  return (
    <div className={cn("rounded-full bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center font-bold text-white overflow-hidden shrink-0", sizes[size] ?? sizes.md, className)}>
      {src ? <img src={src} alt={name} className="w-full h-full object-cover" /> : initial}
    </div>
  );
};

// ── Switch ─────────────────────────────────────────────────────
export const Switch = ({ checked, onChange, label }) => (
  <label className="flex items-center gap-3 cursor-pointer">
    <div className="relative">
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <div className={cn("w-10 h-6 rounded-full transition-colors", checked ? "bg-primary" : "bg-secondary border border-border")} />
      <div className={cn("absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform", checked ? "translate-x-5" : "translate-x-1")} />
    </div>
    {label && <span className="text-sm">{label}</span>}
  </label>
);

// ── Tooltip ────────────────────────────────────────────────────
export const Tooltip = ({ children, content }) => (
  <div className="relative group">
    {children}
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 rounded-lg bg-foreground text-background text-xs whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-lg">
      {content}
      <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-foreground" />
    </div>
  </div>
);

// ── Empty State ────────────────────────────────────────────────
export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
    {Icon && (
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
        <Icon className="w-8 h-8 text-primary/50" />
      </div>
    )}
    <div>
      <h3 className="font-semibold text-foreground mb-1">{title}</h3>
      {description && <p className="text-sm text-muted-foreground max-w-xs">{description}</p>}
    </div>
    {action}
  </div>
);

// ── Field wrapper ──────────────────────────────────────────────
export const Field = ({ label, error, children, className }) => (
  <div className={cn("space-y-1.5", className)}>
    {label && <Label>{label}</Label>}
    {children}
    {error && <p className="text-xs text-destructive mt-1">{error}</p>}
  </div>
);
