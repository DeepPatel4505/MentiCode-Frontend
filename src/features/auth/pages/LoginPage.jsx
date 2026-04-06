import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import { useState } from "react";
import { loginUser, selectAuthLoading, selectAuthError, clearError, selectIsAdmin } from "@/app/store/slices/authSlice";
import { AuthShell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import { Input, Label, Card, CardContent, Field } from "@/components/ui/index";
import { useToast } from "@/components/ui/Toast";

export default function LoginPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const { toast } = useToast();
  const loading   = useSelector(selectAuthLoading);
  const error     = useSelector(selectAuthError);
  const isAdmin   = useSelector(selectIsAdmin);
  const [show, setShow] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  useEffect(() => { dispatch(clearError()); }, [dispatch]);
  useEffect(() => {
    if (error) toast({ title: "Login failed", description: error, type: "error" });
  }, [error]);

  const onSubmit = async (data) => {
    const res = await dispatch(loginUser(data));
    if (res.meta.requestStatus === "fulfilled") {
      toast({ title: "Welcome back!", type: "success" });
      const role = res.payload?.user?.role;
      navigate(role === "admin" ? "/admin" : "/courses");
    }
  };

  return (
    <AuthShell>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground mt-2">Sign in to continue your learning journey</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Email" error={errors.email?.message}>
              <Input
                type="email"
                placeholder="you@example.com"
                error={!!errors.email}
                {...register("email", {
                  required: "Email is required",
                  pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" },
                })}
              />
            </Field>

            <Field label="Password" error={errors.password?.message}>
              <div className="relative">
                <Input
                  type={show ? "text" : "password"}
                  placeholder="••••••••"
                  error={!!errors.password}
                  className="pr-10"
                  {...register("password", { required: "Password is required", minLength: { value: 8, message: "Min 8 characters" } })}
                />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </Field>

            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
            </div>

            <Button type="submit" variant="gradient" className="w-full" loading={loading}>
              {!loading && "Sign in"} <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
            <div className="relative flex justify-center"><span className="bg-card px-3 text-xs text-muted-foreground">or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a href="/api/v1/auth/google">
              <Button variant="outline" className="w-full gap-2 text-xs">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
            </a>
            <a href="/api/v1/auth/github">
              <Button variant="outline" className="w-full gap-2 text-xs">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
                </svg>
                GitHub
              </Button>
            </a>
          </div>
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground mt-6">
        Don't have an account?{" "}
        <Link to="/register" className="text-primary font-medium hover:underline">Create one free</Link>
      </p>
    </AuthShell>
  );
}
