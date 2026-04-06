import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Zap, Code2, Briefcase, Heart, Chrome, Users, Twitter, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { setOnboardingField, completeOnboarding, selectOnboarding } from "@/app/store/slices/gamificationSlice";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, title: "What's your level?",         subtitle: "We'll tailor your path to where you are." },
  { id: 2, title: "What's your main goal?",     subtitle: "Help us focus on what matters most." },
  { id: 3, title: "How did you find us?",       subtitle: "Takes 2 seconds, helps us a lot." },
  { id: 4, title: "What do you want to learn?", subtitle: "Pick everything that interests you." },
  { id: 5, title: "Set your daily goal",        subtitle: "Consistency beats intensity every time." },
];

const SKILL_OPTIONS = [
  { value: "beginner",     icon: "🌱", label: "Beginner",     desc: "Just starting out" },
  { value: "intermediate", icon: "⚡", label: "Intermediate", desc: "I know some basics" },
  { value: "advanced",     icon: "🔥", label: "Advanced",     desc: "Building real projects" },
];
const GOAL_OPTIONS = [
  { value: "job",      icon: Briefcase, label: "Get a job",       desc: "Land my first dev role" },
  { value: "projects", icon: Code2,     label: "Build projects",  desc: "Create things I'm proud of" },
  { value: "fun",      icon: Heart,     label: "Learn for fun",   desc: "Explore out of curiosity" },
];
const HEARD_OPTIONS = [
  { value: "google",  icon: Chrome,  label: "Google search" },
  { value: "friend",  icon: Users,   label: "Friend / colleague" },
  { value: "social",  icon: Twitter, label: "Social media" },
  { value: "other",   icon: Zap,     label: "Somewhere else" },
];
const TOPIC_OPTIONS = [
  { value: "html-css",   icon: "🎨", label: "HTML & CSS" },
  { value: "javascript", icon: "⚡", label: "JavaScript" },
  { value: "react",      icon: "⚛️", label: "React" },
  { value: "node",       icon: "🟢", label: "Node.js" },
  { value: "python",     icon: "🐍", label: "Python" },
  { value: "sql",        icon: "🗄️", label: "SQL & Databases" },
  { value: "typescript", icon: "📘", label: "TypeScript" },
  { value: "git",        icon: "🔀", label: "Git & GitHub" },
];
const DAILY_GOALS = [
  { value: 5,  icon: "🌿", label: "Casual",  desc: "5 min / day",  sub: "Light commitment" },
  { value: 15, icon: "⚡", label: "Regular", desc: "15 min / day", sub: "Steady progress" },
  { value: 30, icon: "🔥", label: "Serious", desc: "30 min / day", sub: "Fast track" },
];

function Card({ selected, onClick, children }) {
  return (
    <button onClick={onClick}
      className={cn(
        "relative w-full p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer select-none",
        selected
          ? "border-primary bg-primary/10 shadow-md shadow-primary/10"
          : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
      )}>
      {selected && (
        <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </span>
      )}
      {children}
    </button>
  );
}

export default function OnboardingPage() {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const [skillLevel, setSkillLevel] = useState(null);
  const [goal,       setGoal]       = useState(null);
  const [heardFrom,  setHeardFrom]  = useState(null);
  const [topics,     setTopics]     = useState([]);
  const [dailyGoal,  setDailyGoal]  = useState(null);

  const toggleTopic = (t) => setTopics((prev) => prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]);

  const canNext = () => {
    if (step === 1) return !!skillLevel;
    if (step === 2) return !!goal;
    if (step === 3) return !!heardFrom;
    if (step === 4) return topics.length > 0;
    if (step === 5) return !!dailyGoal;
    return false;
  };

  const handleNext = async () => {
    if (!canNext()) return;
    if (step < 5) { setStep((s) => s + 1); return; }
    setSaving(true);
    dispatch(setOnboardingField({ skillLevel, goal, heardFrom, topics, dailyGoal }));
    dispatch(completeOnboarding());
    await new Promise((r) => setTimeout(r, 300));
    navigate("/courses");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">Menti<span className="text-primary">Code</span></span>
        </div>
        <span className="text-sm text-muted-foreground">{step} / 5</span>
      </div>

      {/* Progress */}
      <div className="w-full h-1 bg-secondary">
        <div className="h-full bg-primary transition-all duration-500" style={{ width: `${(step / 5) * 100}%` }} />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-8">

          {/* Title */}
          <div className="text-center animate-fade-in-up">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">{STEPS[step - 1].title}</h1>
            <p className="text-muted-foreground">{STEPS[step - 1].subtitle}</p>
          </div>

          {/* Step content */}
          <div key={step} className="animate-fade-in space-y-3">

            {step === 1 && SKILL_OPTIONS.map((o) => (
              <Card key={o.value} selected={skillLevel === o.value} onClick={() => setSkillLevel(o.value)}>
                <div className="flex items-center gap-4 pr-6">
                  <span className="text-3xl">{o.icon}</span>
                  <div>
                    <p className="font-semibold">{o.label}</p>
                    <p className="text-sm text-muted-foreground">{o.desc}</p>
                  </div>
                </div>
              </Card>
            ))}

            {step === 2 && GOAL_OPTIONS.map((o) => (
              <Card key={o.value} selected={goal === o.value} onClick={() => setGoal(o.value)}>
                <div className="flex items-center gap-4 pr-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <o.icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{o.label}</p>
                    <p className="text-sm text-muted-foreground">{o.desc}</p>
                  </div>
                </div>
              </Card>
            ))}

            {step === 3 && (
              <div className="grid grid-cols-2 gap-3">
                {HEARD_OPTIONS.map((o) => (
                  <Card key={o.value} selected={heardFrom === o.value} onClick={() => setHeardFrom(o.value)}>
                    <div className="flex flex-col items-center gap-2 py-2 pr-4">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <o.icon className="w-5 h-5 text-primary" />
                      </div>
                      <p className="font-medium text-sm text-center">{o.label}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            {step === 4 && (
              <>
                <p className="text-xs text-primary font-medium text-right">{topics.length} selected</p>
                <div className="grid grid-cols-2 gap-3">
                  {TOPIC_OPTIONS.map((o) => (
                    <Card key={o.value} selected={topics.includes(o.value)} onClick={() => toggleTopic(o.value)}>
                      <div className="flex items-center gap-3 pr-5">
                        <span className="text-xl">{o.icon}</span>
                        <p className="font-medium text-sm">{o.label}</p>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            )}

            {step === 5 && DAILY_GOALS.map((o) => (
              <Card key={o.value} selected={dailyGoal === o.value} onClick={() => setDailyGoal(o.value)}>
                <div className="flex items-center gap-4 pr-6">
                  <span className="text-3xl">{o.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{o.label}</p>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{o.desc}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{o.sub}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Nav buttons */}
          <div className="flex gap-3">
            {step > 1 && (
              <Button variant="ghost" onClick={() => setStep((s) => s - 1)} className="gap-2">
                <ArrowLeft className="w-4 h-4" /> Back
              </Button>
            )}
            <Button variant="gradient" className="flex-1 gap-2" disabled={!canNext() || saving} loading={saving} onClick={handleNext}>
              {!saving && (step === 5 ? <><Zap className="w-4 h-4" /> Start learning!</> : <>Continue <ArrowRight className="w-4 h-4" /></>)}
            </Button>
          </div>

          {step === 3 && (
            <button onClick={() => { setHeardFrom("other"); setTimeout(handleNext, 50); }}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors text-center">
              Skip this question
            </button>
          )}
        </div>
      </div>

      {/* Step dots */}
      <div className="flex items-center justify-center gap-2 pb-8">
        {STEPS.map((s) => (
          <div key={s.id} className={cn("h-2 rounded-full transition-all duration-300",
            s.id === step ? "bg-primary w-6" : s.id < step ? "bg-primary/40 w-2" : "bg-border w-2"
          )} />
        ))}
      </div>
    </div>
  );
}
