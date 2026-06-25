import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router";
import { LuCake, LuMail } from "react-icons/lu";
import AuthCard from "../components/login-register/AuthCard";
import InputField from "../components/login-register/InputField";
import { loginSchema, type LoginSchema } from "../hooks/useAuthValidation";

const CakeIcon = () => 
  <LuCake 
    className="w-7 h-7 text-white"/>;

const panelProps = {
  icon: <CakeIcon />,
  title: (
    <>
      Welcome back to
      <br />
      Cake Studio
    </>
  ),
  subtitle:
    "Sign in to track orders, save favorites, and enjoy exclusive member perks.",
  features: [
    "Fresh-baked, same-day delivery",
    "Custom designs for every occasion",
    "Members get early access to drops",
  ],
};

const MailIcon = () => (
  <LuMail />
);

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginSchema>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = async (data: LoginSchema) => {
    setIsLoading(true);
    setServerError(null);
    try {
      console.log("Login:", data);
      await new Promise((r) => setTimeout(r, 1200));
      navigate("/");
    } catch {
      setServerError("Incorrect email or password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Sign in"
      subtitle="Good to see you again"
      panelProps={panelProps}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-3.5"
      >
        {serverError && (
          <div
            role="alert"
            className="bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl px-4 py-3"
          >
            {serverError}
          </div>
        )}

        <InputField
          id="email"
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          icon={<MailIcon />}
          {...register("email")}
        />

        <InputField
          id="password"
          label="Password"
          type="password"
          showPasswordToggle
          placeholder="Min. 8 characters"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register("password")}
        />

        <div className="flex items-center justify-between py-1">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              id="rememberMe"
              className="w-3.5 h-3.5 accent-red-700"
              {...register("rememberMe")}
            />
            <span className="text-xs text-neutral-600">Remember me</span>
          </label>
          <Link
            to="/forgot-password"
            className="text-xs text-red-700 hover:text-red-900 font-medium transition-colors"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={[
            "w-full h-10 rounded-xl text-sm font-semibold text-white tracking-wide",
            "bg-red-700 hover:bg-red-800 transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2",
            "disabled:opacity-60 disabled:cursor-not-allowed active:scale-[.98]",
            "flex items-center justify-center gap-2",
          ].join(" ")}
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in...
            </>
          ) : (
            "Sign In"
          )}
        </button>

        <div className="flex items-center gap-3 my-0.5">
          <div className="flex-1 h-px bg-neutral-100" />
          <span className="text-[11px] text-neutral-400">or</span>
          <div className="flex-1 h-px bg-neutral-100" />
        </div>

        <p className="text-center text-xs text-neutral-400">
          Don't have an account?{" "}
          <Link
            to="/signup"
            className="text-red-700 font-semibold hover:text-red-900 transition-colors"
          >
            Create one
          </Link>
        </p>
      </form>
    </AuthCard>
  );
};

export default LoginPage;
