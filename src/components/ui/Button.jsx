import { forwardRef, cloneElement, Children } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        primary:     "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20",
        secondary:   "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:     "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground",
        ghost:       "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        success:     "bg-success text-success-foreground hover:bg-success/90",
        link:        "text-primary underline-offset-4 hover:underline p-0 h-auto",
        gradient:    "bg-gradient-to-r from-blue-600 to-blue-500 text-white hover:from-blue-700 hover:to-blue-600 shadow-lg shadow-blue-500/25",
      },
      size: {
        xs:      "h-7 px-3 text-xs rounded-lg",
        sm:      "h-8 px-3.5 text-xs",
        default: "h-10 px-5",
        lg:      "h-12 px-7 text-base",
        xl:      "h-14 px-8 text-lg",
        icon:    "h-9 w-9",
        "icon-sm": "h-7 w-7",
        "icon-lg": "h-11 w-11",
      },
    },
    defaultVariants: { variant: "primary", size: "default" },
  }
);

const Button = forwardRef(({ className, variant, size, loading, asChild, children, ...props }, ref) => {
  const classes = cn(buttonVariants({ variant, size }), className);

  // asChild: merge button styles onto the single child element (e.g. <Link>)
  if (asChild) {
    const child = Children.only(children);
    return cloneElement(child, {
      ...props,
      ref,
      className: cn(classes, child.props.className),
    });
  }

  return (
    <button
      ref={ref}
      className={classes}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
      {children}
    </button>
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
