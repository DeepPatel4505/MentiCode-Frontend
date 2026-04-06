import { Link } from "react-router-dom";
import { BookOpen, Zap, Play } from "lucide-react";
import { Card, CardContent, Badge, Progress } from "@/components/ui/index";
import { Button } from "@/components/ui/Button";
import { cn, getDifficultyConfig } from "@/lib/utils";

/**
 * CourseCard
 * @param {object}  course      - course object from API
 * @param {object}  [enrollment] - enrollment object (optional)
 * @param {boolean} [showProgress] - show progress bar + resume button
 */
export default function CourseCard({ course, enrollment, showProgress = false }) {
  const diff = getDifficultyConfig(course.difficulty);
  const pct  = Math.round((enrollment?.progress ?? 0) * 100);

  const resumeHref = enrollment?.currentLessonId
    ? `/courses/${course.slug}/lessons/${enrollment.currentLessonId}`
    : enrollment?.currentLevelId
    ? `/courses/${course.slug}/levels/${enrollment.currentLevelId}`
    : `/courses/${course.slug}`;

  return (
    <Card className="group hover:border-primary/30 hover:-translate-y-0.5 transition-all duration-200 overflow-hidden h-full flex flex-col">
      {/* Thumbnail */}
      <div className="aspect-video bg-gradient-to-br from-violet-900/20 to-neutral-900 relative overflow-hidden shrink-0">
        {course.thumbnail
          ? <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          : <div className="w-full h-full flex items-center justify-center"><BookOpen className="w-8 h-8 text-neutral-700" /></div>
        }
        {course.isPro && (
          <div className="absolute top-2 right-2">
            <Badge variant="pro">PRO</Badge>
          </div>
        )}
      </div>

      <CardContent className="p-4 flex flex-col flex-1 gap-2">
        {/* Title */}
        <h3 className="font-semibold text-sm leading-snug group-hover:text-primary transition-colors line-clamp-2 text-neutral-100">
          {course.title}
        </h3>

        {/* Meta row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className={cn("text-xs font-medium", diff.color)}>{diff.label}</span>
          {course.language && (
            <span className="px-1.5 py-0.5 rounded text-xs bg-neutral-800 text-neutral-400 border border-neutral-700">{course.language}</span>
          )}
          {course.totalXp > 0 && (
            <div className="flex items-center gap-0.5 ml-auto text-violet-400">
              <Zap className="w-3 h-3" />
              <span className="text-xs font-bold">{course.totalXp} XP</span>
            </div>
          )}
        </div>

        {/* Progress (enrolled) */}
        {showProgress && enrollment && (
          <div className="mt-auto pt-2 space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span className="font-medium text-foreground">{pct}%</span>
            </div>
            <Progress value={pct} color={pct === 100 ? "bg-emerald-500" : undefined} />
            <Button variant="gradient" size="sm" className="w-full gap-1.5 mt-1" asChild>
              <Link to={resumeHref}><Play className="w-3.5 h-3.5" /> Resume</Link>
            </Button>
          </div>
        )}

        {/* CTA (not enrolled) */}
        {!showProgress && (
          <div className="mt-auto pt-2">
            <Link to={`/courses/${course.slug}`} className="text-xs text-primary hover:underline font-medium">
              View course →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
