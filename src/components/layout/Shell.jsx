import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";
import { Link } from "react-router-dom";

// Shell no longer renders its own Navbar — GlobalLayout provides the top navbar.
// It just provides consistent padding/max-width for page content.
export default function Shell({ children, className, fullWidth = false }) {
  return (
    <div className={cn("w-full", !fullWidth && "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", className)}>
      {children}
    </div>
  );
}

export function AuthShell({ children }) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/" className="inline-flex items-center gap-2 font-bold text-xl">
              <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span>Menti<span className="text-primary">Code</span></span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

export function PageHeader({ title, description, action, className }) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8", className)}>
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">{title}</h1>
        {description && <p className="text-muted-foreground mt-1">{description}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
