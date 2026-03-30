import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Zap, Star, Lock, ChevronRight, Map, Trophy } from "lucide-react";
import Shell from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, Badge } from "@/components/ui/index";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/hooks/useAuth";
import api from "@/lib/api";

const FREE_FEATURES = [
  "Access to free courses",
  "First 3 lessons per course",
  "First 1 game level per course",
  "Community forum access",
  "Mobile app access",
];

const PRO_FEATURES = [
  "All free features",
  "Unlimited access to all courses",
  "All game levels & challenges",
  "Guided learning roadmaps",
  "Downloadable resources",
  "Priority support",
  "Certificates of completion",
  "Offline learning mode",
  "Early access to new content",
];

const FAQ = [
  { q: "Can I cancel anytime?",      a: "Yes, cancel anytime. You'll keep Pro access until the end of your billing period." },
  { q: "Is there a free trial?",     a: "Yes — free forever for core content. Upgrade only when you need full access." },
  { q: "Do you offer student discounts?", a: "Yes, email us with your student ID for 50% off the Pro plan." },
  { q: "What payment methods are accepted?", a: "We accept all major credit/debit cards, UPI, and net banking." },
];

export default function PricingPage() {
  const navigate   = useNavigate();
  const { toast }  = useToast();
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const isAuth = !!user;
  const isPro = user?.plan === "pro";

  const handleUpgrade = async () => {
    if (!isAuth) { navigate("/register"); return; }
    if (isPro)   return;

    // In production this would redirect to a payment gateway.
    // For now it calls the upgrade endpoint directly (demo flow).
    setLoading(true);
    try {
      const res = await api.post("/auth/upgrade");
      setUser((prev) => ({ ...prev, ...(res.data?.data?.user ?? {}) }));
      toast({ title: "Welcome to Pro! 🎉", description: "All content is now unlocked.", type: "success" });
      navigate("/courses");
    } catch (error) {
      toast({ title: "Upgrade failed", description: error?.message ?? "Please try again", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell showNavbar={false}>
      {/* Header */}
      <div className="text-center mb-14 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-5">
          <Zap className="w-3.5 h-3.5" /> Simple, honest pricing
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">Level up with Pro</h1>
        <p className="text-muted-foreground text-lg">Everything you need to go from beginner to job-ready developer. No hidden fees.</p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">

        {/* Free */}
        <Card className="relative p-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold mb-1">Free</h2>
            <p className="text-muted-foreground text-sm">Perfect for getting started</p>
          </div>
          <div className="mb-6">
            <span className="text-4xl font-bold">$0</span>
            <span className="text-muted-foreground ml-2">forever</span>
          </div>
          <ul className="space-y-3 mb-8">
            {FREE_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-muted-foreground shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          <Button variant="outline" className="w-full" asChild={!isAuth}>
            {!isAuth ? (
              <a href="/register">Get started free</a>
            ) : (
              <span className="opacity-60 cursor-default">Current plan</span>
            )}
          </Button>
        </Card>

        {/* Pro */}
        <Card className="relative p-6 border-primary/50 bg-gradient-to-b from-primary/5 to-background blue-glow">
          {/* Popular badge */}
          <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
            <Badge variant="pro" className="px-4 py-1 shadow-lg">
              <Star className="w-3 h-3" /> Most Popular
            </Badge>
          </div>

          <div className="mb-5">
            <h2 className="text-xl font-bold mb-1">Pro</h2>
            <p className="text-muted-foreground text-sm">For serious learners</p>
          </div>
          <div className="mb-6 flex items-end gap-2">
            <span className="text-4xl font-bold">$12</span>
            <span className="text-muted-foreground mb-1">/ month</span>
            <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-success/10 text-green-400 border border-success/20 mb-1">Save 30% yearly</span>
          </div>

          <ul className="space-y-3 mb-8">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm">
                <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5 text-primary" />
                </div>
                {f}
              </li>
            ))}
          </ul>

          {isPro ? (
            <div className="w-full py-3 text-center rounded-xl bg-success/10 border border-success/20 text-green-400 text-sm font-medium flex items-center justify-center gap-2">
              <Check className="w-4 h-4" /> You're on Pro!
            </div>
          ) : (
            <Button variant="gradient" className="w-full blue-glow gap-2" size="lg" loading={loading} onClick={handleUpgrade}>
              {!loading && (<><Zap className="w-4 h-4" /> Upgrade to Pro</>)}
            </Button>
          )}
          <p className="text-xs text-muted-foreground text-center mt-3">Cancel anytime. No questions asked.</p>
        </Card>
      </div>

      {/* What you unlock */}
      <div className="max-w-4xl mx-auto mb-16">
        <h2 className="text-2xl font-bold text-center mb-8">What Pro unlocks</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: Lock,    title: "All content",        desc: "Every course, game level, and challenge — no more locked icons." },
            { icon: Map,     title: "Learning roadmaps",  desc: "Guided paths from zero to full-stack developer." },
            { icon: Trophy,  title: "Certificates",       desc: "Shareable completion certificates for your portfolio." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="p-5 rounded-2xl border border-border bg-card text-center">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold mb-1">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">Frequently asked questions</h2>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <div key={item.q} className="p-5 rounded-2xl border border-border bg-card">
              <h3 className="font-semibold mb-1.5 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-primary shrink-0" /> {item.q}
              </h3>
              <p className="text-sm text-muted-foreground pl-6">{item.a}</p>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
