// ForgotPasswordPage
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail } from "lucide-react";
import { useState } from "react";
import api from "@/lib/axios";
import { AuthShell } from "@/components/layout/Shell";
import { Button } from "@/components/ui/Button";
import { Input, Card, CardContent, Field } from "@/components/ui/index";
import { useToast } from "@/components/ui/Toast";

export function ForgotPasswordPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", data);
      setSent(true);
      toast({ title: "Reset link sent!", description: "Check your email.", type: "success" });
    } catch (err) {
      toast({ title: "Error", description: err.response?.data?.message, type: "error" });
    } finally { setLoading(false); }
  };

  return (
    <AuthShell>
      <Link to="/login" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to login
      </Link>
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold">Forgot password?</h1>
        <p className="text-muted-foreground mt-2">Enter your email and we'll send a reset link</p>
      </div>

      {sent ? (
        <Card><CardContent className="pt-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="font-semibold text-lg mb-2">Check your inbox</h2>
          <p className="text-muted-foreground text-sm">We've sent a reset link to your email address. It expires in 20 minutes.</p>
          <Link to="/login" className="inline-block mt-4 text-sm text-primary hover:underline">Back to login</Link>
        </CardContent></Card>
      ) : (
        <Card><CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Field label="Email" error={errors.email?.message}>
              <Input type="email" placeholder="you@example.com" error={!!errors.email}
                {...register("email", { required: "Email is required", pattern: { value: /\S+@\S+\.\S+/, message: "Invalid email" } })} />
            </Field>
            <Button type="submit" variant="gradient" className="w-full" loading={loading}>
              {!loading && "Send reset link"}
            </Button>
          </form>
        </CardContent></Card>
      )}
    </AuthShell>
  );
}

export default ForgotPasswordPage;
