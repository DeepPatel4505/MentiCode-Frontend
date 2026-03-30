import { Link } from "react-router-dom";
import { Zap } from "lucide-react";
import { Avatar } from "@/components/ui/index";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function CourseNavbar({ courseTitle, courseSlug }) {
  const { user } = useAuth();
  const isAuth = !!user;

  return (
    <div className="h-14 shrink-0 border-b border-border bg-card/95 backdrop-blur-md flex items-center px-4 gap-3 z-40">
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2.5 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <span className="font-bold text-lg tracking-tight hidden sm:block">
          Menti<span className="text-primary">Code</span>
        </span>
      </Link>

      {/* Course title */}
      {courseTitle && (
        <>
          <span className="text-border/60 text-sm hidden sm:block">·</span>
          {courseSlug ? (
            <Link
              to={`/courses/${courseSlug}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors truncate max-w-[200px] sm:max-w-xs"
            >
              {courseTitle}
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground truncate max-w-[200px] sm:max-w-xs">
              {courseTitle}
            </span>
          )}
        </>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Profile */}
      {isAuth && user && (
        <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
          <Avatar src={user?.avatarUrl} name={user?.username} size="sm" />
          <span className="text-sm font-medium hidden sm:block">{user?.username}</span>
        </Link>
      )}
    </div>
  );
}
