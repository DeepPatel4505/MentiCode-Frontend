import { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { ChevronRight, Zap, CheckCircle2, XCircle, Trophy, RotateCcw, Heart, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/index";
import { fetchLevel, fetchMyCourses, selectCurrentLevel, selectLevelLoading, selectCurrentCourse } from "@/app/store/slices/courseSlice";
import { submitLevelAttempt, selectAttemptLoading, selectLastAttemptResult, clearAttemptResult } from "@/app/store/slices/enrollSlice";
import { addXp, fetchStreak } from "@/app/store/slices/gamificationSlice";
import { useToast } from "@/components/ui/Toast";
import { cn, triggerConfetti } from "@/lib/utils";
import CourseNavbar from "@/components/layout/CourseNavbar";

function Lives({ count, max = 3 }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, i) => (
        <Heart key={i} className={cn("w-5 h-5 transition-all duration-300",
          i < count ? "fill-red-500 text-red-500 scale-110" : "fill-none text-muted-foreground/30 scale-90"
        )} />
      ))}
    </div>
  );
}

function FeedbackBanner({ correct, explanation, onNext }) {
  return (
    <div className={cn("fixed bottom-0 left-0 right-0 p-5 border-t-2 animate-fade-in-up z-30",
      correct ? "bg-success/10 border-success/40" : "bg-destructive/10 border-destructive/40"
    )}>
      <div className="max-w-lg mx-auto flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={cn("w-8 h-8 rounded-full flex items-center justify-center shrink-0",
            correct ? "bg-green-500/20" : "bg-red-500/20"
          )}>
            {correct
              ? <CheckCircle2 className="w-5 h-5 text-green-400" />
              : <XCircle className="w-5 h-5 text-red-400" />
            }
          </div>
          <div>
            <p className={cn("font-bold text-sm", correct ? "text-green-400" : "text-red-400")}>
              {correct ? "Correct! 🎉" : "Not quite!"}
            </p>
            {explanation && <p className="text-xs text-muted-foreground mt-0.5 max-w-xs">{explanation}</p>}
          </div>
        </div>
        <Button size="sm" onClick={onNext}
          className={cn("gap-1.5 shrink-0", correct ? "bg-green-500 hover:bg-green-600 text-white" : "bg-destructive hover:bg-destructive/90 text-white")}>
          {correct ? "Continue" : "Got it"} <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

function XpBurst({ xp }) {
  return (
    <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none animate-bounce-in">
      <div className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-black text-2xl shadow-2xl shadow-primary/50 blue-glow">
        <Zap className="w-6 h-6" /> +{xp} XP!
      </div>
    </div>
  );
}

function ResultScreen({ result, level, onRetry, onContinue }) {
  const waitMins = result.retryAvailableAt
    ? Math.max(0, Math.ceil((new Date(result.retryAvailableAt) - Date.now()) / 60000))
    : 0;

  useEffect(() => { if (result.isPassed) triggerConfetti(); }, [result.isPassed]);

  return (
    <div className="flex flex-col items-center text-center py-10 gap-6 animate-scale-in px-4">
      <div className={cn("w-28 h-28 rounded-full flex items-center justify-center relative",
        result.isPassed ? "bg-success/20" : "bg-destructive/10"
      )}>
        {result.isPassed && <div className="absolute inset-0 rounded-full border-2 border-primary animate-pulse-ring" />}
        {result.isPassed
          ? <Trophy className="w-14 h-14 text-amber-400 animate-bounce-in" />
          : <XCircle className="w-14 h-14 text-destructive" />
        }
      </div>
      <div>
        <h2 className="text-4xl font-black mb-2">{result.isPassed ? "🎉 Excellent!" : "💪 Keep going!"}</h2>
        <p className="text-muted-foreground">{result.isPassed ? "You crushed it!" : `Need ${level?.passingScore ?? 70}% to pass`}</p>
      </div>
      {/* Score ring */}
      <div className="relative w-32 h-32">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
          <circle cx="50" cy="50" r="40" fill="none"
            stroke={result.isPassed ? "#22c55e" : "hsl(var(--destructive))"}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 40}`}
            strokeDashoffset={`${2 * Math.PI * 40 * (1 - result.score / 100)}`}
            style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.34,1.56,0.64,1)" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black">{result.score}%</span>
          <span className="text-xs text-muted-foreground">score</span>
        </div>
      </div>
      {result.isPassed && result.xpAwarded > 0 && (
        <div className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-primary/10 border border-primary/20 blue-glow-sm animate-bounce-in">
          <Zap className="w-6 h-6 text-primary" />
          <div className="text-left">
            <p className="font-black text-2xl text-primary">+{result.xpAwarded} XP</p>
            <p className="text-xs text-muted-foreground">added to your total</p>
          </div>
        </div>
      )}
      <div className="flex gap-3 w-full max-w-xs">
        {!result.isPassed && (
          <Button variant="outline" className="flex-1 gap-2" onClick={onRetry} disabled={waitMins > 0}>
            <RotateCcw className="w-4 h-4" />
            {waitMins > 0 ? `Wait ${waitMins}m` : "Try again"}
          </Button>
        )}
        <Button variant="gradient" className="flex-1 gap-2 blue-glow-sm" onClick={onContinue}>
          {result.isPassed ? "Continue" : "Review"} <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export default function GameLevelPage() {
  const { slug, levelId } = useParams();
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const { toast }  = useToast();

  const level      = useSelector(selectCurrentLevel);
  const loading    = useSelector(selectLevelLoading);
  const submitting = useSelector(selectAttemptLoading);
  const result     = useSelector(selectLastAttemptResult);
  const course     = useSelector(selectCurrentCourse);

  const [answers,     setAnswers]     = useState({});
  const [currentQ,    setCurrentQ]    = useState(0);
  const [submitted,   setSubmitted]   = useState(false);
  const [lives,       setLives]       = useState(3);
  const [showXpBurst, setShowXpBurst] = useState(false);
  const xpTimer = useRef(null);

  const questions = level?.config?.questions ?? [];
  const question  = questions[currentQ];
  const isCorrect = submitted && answers[question?.id] === question?.correctAnswer;

  useEffect(() => {
    dispatch(fetchLevel(levelId));
    return () => { dispatch(clearAttemptResult()); if (xpTimer.current) clearTimeout(xpTimer.current); };
  }, [dispatch, levelId]);

  const handleSelect = (answer) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [question.id]: answer }));
  };

  const handleCheck = () => {
    if (!answers[question?.id] || submitted) return;
    setSubmitted(true);
    const correct = answers[question.id] === question.correctAnswer;
    if (!correct) setLives((l) => Math.max(0, l - 1));
  };

  const handleNext = async () => {
    const isLast = currentQ === questions.length - 1;
    if (!isLast) {
      setCurrentQ((q) => q + 1);
      setSubmitted(false);
      return;
    }
    const formatted = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
    const res = await dispatch(submitLevelAttempt({ levelId, answers: formatted }));
    if (res.meta.requestStatus === "fulfilled") {
      const data = res.payload;
      if (data.isPassed && data.xpAwarded > 0) {
        dispatch(addXp(data.xpAwarded));
        // Re-sync from server: fetch courses first (updates xpEarned), then recompute XP
        dispatch(fetchMyCourses()).then(() => dispatch(fetchStreak()));
        setShowXpBurst(true);
        xpTimer.current = setTimeout(() => setShowXpBurst(false), 2500);
      }
    } else {
      const err = res.payload;
      if (err?.error?.code === "COOLDOWN") toast({ title: "Cooldown active", description: "Please wait before retrying.", type: "error" });
      else if (err?.statusCode === 402) navigate("/pricing");
    }
  };

  const handleRetry = () => {
    setAnswers({}); setCurrentQ(0); setSubmitted(false); setLives(3);
    dispatch(clearAttemptResult());
  };

  if (loading || !level) return (
    <div className="min-h-screen bg-background flex flex-col">
      <CourseNavbar courseTitle={course?.title} courseSlug={slug} />
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-lg px-4 space-y-5">
          <Skeleton className="h-3 w-full rounded-full" />
          <Skeleton className="h-7 w-2/3 mx-auto" />
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <CourseNavbar courseTitle={course?.title} courseSlug={slug} />
      {/* Level controls bar */}
      <div className="sticky top-14 z-40 border-b border-border bg-background/95 backdrop-blur-md h-12 flex items-center px-4 gap-3">
        <Link to={`/courses/${slug}`} className="text-muted-foreground hover:text-foreground transition-colors mr-1">
          <X className="w-5 h-5" />
        </Link>
        {!result && questions.length > 0 && (
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 h-3 bg-secondary rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-primary to-blue-400 transition-all duration-500"
                style={{ width: `${Math.round((currentQ / questions.length) * 100)}%` }} />
            </div>
            <span className="text-xs font-bold text-muted-foreground shrink-0">{currentQ}/{questions.length}</span>
          </div>
        )}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1 font-bold text-sm">
            <Zap className="w-4 h-4 text-primary" />
            <span className="text-primary">{level.xpReward}</span>
          </div>
          {!result && <Lives count={lives} />}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-32">
        <div className="w-full max-w-lg">
          {result ? (
            <ResultScreen result={result} level={level} onRetry={handleRetry} onContinue={() => navigate(`/courses/${slug}`)} />
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No questions configured yet.</p>
              <Button variant="outline" asChild><Link to={`/courses/${slug}`}>Go back</Link></Button>
            </div>
          ) : (
            <div className="space-y-6 animate-fade-in">
              <div className="text-center mb-2">
                <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-xs font-bold text-primary capitalize">
                  <Zap className="w-3.5 h-3.5" /> {level.type?.replace("_", " ")}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-center">{question?.text}</h2>
              <div className="space-y-3">
                {question?.options?.map((option, i) => {
                  const selected = answers[question?.id] === option;
                  const correct  = question.correctAnswer === option;
                  let cls = "quiz-option";
                  if (submitted) { if (correct) cls += " correct"; else if (selected) cls += " incorrect"; }
                  else if (selected) cls += " selected";
                  return (
                    <button key={option} className={cn(cls, "transition-all duration-150 active:scale-[0.98]")}
                      onClick={() => handleSelect(option)} disabled={submitted}>
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <span className={cn("w-7 h-7 rounded-lg border text-xs font-bold flex items-center justify-center shrink-0",
                            submitted && correct  ? "bg-green-500/20 border-green-500 text-green-400" :
                            submitted && selected ? "bg-red-500/20 border-red-500 text-red-400" :
                            selected              ? "bg-primary/20 border-primary text-primary" :
                            "bg-secondary border-border text-muted-foreground"
                          )}>
                            {String.fromCharCode(65 + i)}
                          </span>
                          <span className="text-sm">{option}</span>
                        </div>
                        {submitted && correct  && <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0" />}
                        {submitted && selected && !correct && <XCircle className="w-5 h-5 text-red-400 shrink-0" />}
                      </div>
                    </button>
                  );
                })}
              </div>
              {!submitted && (
                <Button variant="gradient" size="lg" className="w-full blue-glow-sm"
                  disabled={!answers[question?.id]} onClick={handleCheck}>
                  Check answer
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {submitted && !result && (
        <FeedbackBanner correct={isCorrect} explanation={question?.explanation}
          onNext={() => {
            if (currentQ === questions.length - 1) handleNext();
            else { setCurrentQ((q) => q + 1); setSubmitted(false); }
          }}
        />
      )}
      {showXpBurst && result?.xpAwarded && <XpBurst xp={result.xpAwarded} />}
    </div>
  );
}
