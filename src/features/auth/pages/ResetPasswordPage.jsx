import { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import api from "@/lib/axios";
import { AuthShell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import { Input, Card, CardContent, Field } from "@/components/ui/index";
import { useToast } from "@/components/ui/Toast";

export function ResetPasswordPage() {
  const { token }  = useParams();
  const navigate   = useNavigate();
  const { toast }  = useToast();
  const [show, setShow]     = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post(`/auth/reset-forgot-password/${token}`, { newPassword: data.newPassword });
      toast({ title: "Password reset!", type: "success" });
      navigate("/login");
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message ?? "Invalid or expired link", type: "error" });
    } finally { setLoading(false); }
  };

  return (
    <AuthShell>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Set new password</h1>
        <p className="text-muted-foreground mt-2">Choose a strong password for your account</p>
      </div>
      <Card><CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="New password" error={errors.newPassword?.message}>
            <div className="relative">
              <Input type={show ? "text" : "password"} placeholder="••••••••" className="pr-10"
                {...register("newPassword", { required: "Required", minLength: { value: 8, message: "Min 8 characters" } })} />
              <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>
          <Field label="Confirm password" error={errors.confirm?.message}>
            <Input type={show ? "text" : "password"} placeholder="••••••••"
              {...register("confirm", { required: "Required", validate: (v) => v === watch("newPassword") || "Passwords don't match" })} />
          </Field>
          <Button type="submit" variant="gradient" className="w-full" loading={loading}>
            {!loading && "Reset password"}
          </Button>
        </form>
      </CardContent></Card>
    </AuthShell>
  );
}

export function VerifyEmailPage() {
  const { token } = useParams();
  const [status, setStatus] = useState("loading");

  useState(() => {
    api.get(`/auth/verify-email/${token}`)
      .then(() => setStatus("success"))
      .catch(() => setStatus("error"));
  }, [token]);

  return (
    <AuthShell>
      <Card><CardContent className="pt-8 pb-8 text-center">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground">Verifying your email…</p>
          </div>
        )}
        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">Email verified!</h2>
              <p className="text-muted-foreground text-sm">Your account is now active</p>
            </div>
            <Button variant="gradient" asChild><Link to="/login">Continue to login</Link></Button>
          </div>
        )}
        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-8 h-8 text-destructive" />
            </div>
            <div>
              <h2 className="text-xl font-bold mb-1">Verification failed</h2>
              <p className="text-muted-foreground text-sm">Link may be expired or invalid</p>
            </div>
            <Button variant="outline" asChild><Link to="/login">Back to login</Link></Button>
          </div>
        )}
      </CardContent></Card>
    </AuthShell>
  );
}

export default ResetPasswordPage;
