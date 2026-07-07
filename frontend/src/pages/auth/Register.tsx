import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Lock, Mail, ShieldCheck, User } from "lucide-react";
import toast from "react-hot-toast";

import api from "../../services/api";
import { useAuth } from "../../contexts/AuthContext";
import type { RegisterRequest } from "../../types/auth.types";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";

function Register() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const fromLocation = (location.state as { from?: { pathname?: string; search?: string; hash?: string } } | null)?.from;
  const redirectTo = `${fromLocation?.pathname || "/dashboard"}${fromLocation?.search || ""}${fromLocation?.hash || ""}`;

  useEffect(() => {
    if (token) {
      navigate(redirectTo, { replace: true });
    }
  }, [navigate, redirectTo, token]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterRequest>();

  const onSubmit = async (data: RegisterRequest) => {
    try {
      setLoading(true);
      const { name, email, password } = data;
      await api.post("/auth/register", { name, email, password });
      toast.success("Registration successful");
      navigate("/login", { state: location.state, replace: true });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const password = watch("password");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_32%),linear-gradient(135deg,#020617_0%,#0b1120_48%,#111827_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <Card className="grid w-full overflow-hidden lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative hidden min-h-[680px] flex-col justify-between overflow-hidden bg-[linear-gradient(135deg,rgba(34,211,238,0.16),rgba(15,23,42,0.96))] p-10 lg:flex">
            <div>
              <Badge><ShieldCheck className="h-4 w-4" />Secure onboarding</Badge>
              <h1 className="mt-6 max-w-md text-4xl font-semibold text-white">Create a protected identity.</h1>
              <p className="mt-4 max-w-md text-sm leading-7 text-slate-400">
                Register with the same enterprise-grade surface used throughout the ZeroTrace console.
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-950/45 p-5">
              <div className="text-sm font-medium text-slate-200">Identity controls</div>
              <div className="mt-2 text-2xl font-semibold text-white">Policy-ready access</div>
            </div>
          </div>

          <div className="p-8 sm:p-10">
            <div className="mx-auto max-w-md">
              <div className="mb-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 shadow-lg shadow-cyan-500/20">
                  <ShieldCheck className="h-7 w-7 text-white" />
                </div>
                <h2 className="mt-5 text-3xl font-semibold text-white">Create account</h2>
                <p className="mt-2 text-sm text-slate-400">Set up your access to ZeroTrace.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Enter full name"
                  icon={<User className="h-4 w-4 text-cyan-300" />}
                  error={errors.name?.message}
                  {...register("name", { required: "Name is required" })}
                />
                <Input
                  label="Email"
                  type="email"
                  placeholder="Enter email"
                  icon={<Mail className="h-4 w-4 text-cyan-300" />}
                  error={errors.email?.message}
                  {...register("email", {
                    required: "Email is required",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email" },
                  })}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="Enter password"
                  icon={<Lock className="h-4 w-4 text-cyan-300" />}
                  error={errors.password?.message}
                  {...register("password", {
                    required: "Password is required",
                    minLength: { value: 8, message: "Password must be at least 8 characters" },
                  })}
                />
                <Input
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm password"
                  icon={<Lock className="h-4 w-4 text-cyan-300" />}
                  error={(errors.passwordConfirm as any)?.message}
                  {...register("passwordConfirm", {
                    required: "Please confirm your password",
                    validate: (value: string) => value === password || "Passwords do not match",
                  } as any)}
                />

                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? "Registering..." : "Register"}
                </Button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-400">
                Already have an account?{" "}
                <Link to="/login" state={location.state} className="font-medium text-cyan-300 transition hover:text-cyan-200">Sign in</Link>
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default Register;
