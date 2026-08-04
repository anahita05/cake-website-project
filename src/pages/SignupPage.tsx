import React, { useState } from "react";
import AuthCard from "../components/login-register/AuthCard";
import InputField from "../components/login-register/InputField";
import PasswordStrength from "../components/login-register/PasswordStrength";
import { signupSchema, type SignupSchema } from "../hooks/useAuthValidation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "react-router-dom";
import { GiBeveledStar } from "react-icons/gi";
import { FiUser } from "react-icons/fi";
import { LuMail } from "react-icons/lu";
import { MdErrorOutline } from "react-icons/md";

const StarIcon = () => <GiBeveledStar className="w-8 h-8 text-white" />;

const panelProps = {
  icon: <StarIcon />,
  title: (
    <>
      Join Cake
      <br /> Studio today
    </>
  ),
  subtitle:
    "Create your account and get your first order with a special welcome discount.",
  features: [
    "10% off your first order",
    "Birthday surprise every year",
    "Priority queue on busy days",
  ],
};

const UserIcon = () => <FiUser />;

const MailIcon = () => <LuMail />;

const SignupPage: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignupSchema>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const passwordValue = watch("password");

  const onSubmit = async (data: SignupSchema) => {
    setIsLoading(true);
    setServerError(null);
    try {
      console.log("Signup:", data);
      await new Promise((r) => setTimeout(r, 1400));
      navigate("/login");
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Create account"
      subtitle="It only takes a minute"
      panelProps={panelProps}
    >
      <form
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="flex flex-col gap-3"
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
          id="fullName"
          label="Full name"
          type="text"
          placeholder="Your full name"
          autoComplete="name"
          error={errors.fullName?.message}
          icon={<UserIcon />}
          {...register("fullName")}
        />

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

        <div className="flex flex-col gap-1.5">
          <InputField
            id="password"
            label="Password"
            type="password"
            showPasswordToggle
            placeholder="Min. 8 chars, 1 uppercase, 1 number"
            autoComplete="new-password"
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordStrength password={passwordValue} />
        </div>

        <InputField
          id="confirmPassword"
          label="Confirm password"
          type="password"
          showPasswordToggle
          placeholder="Repeat your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <div className="flex flex-col gap-1 pt-0.5">
          <label className="flex items-start gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              id="agreeToTerms"
              className="w-3.5 h-3.5 mt-0.5 accent-red-700"
              {...register("agreeToTerms")}
            />
            <span className="text-xs text-neutral-600 leading-relaxed">
              I agree to the{" "}
              <Link
                to="/terms"
                className="text-red-700 hover:text-red-900 font-medium transition-colors"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-red-700 hover:text-red-900 font-medium transition-colors"
              >
                Privacy Policy
              </Link>
            </span>
          </label>
          {errors.agreeToTerms && (
            <p
              role="alert"
              className="text-xs text-red-500 flex items-center gap-1 ml-5"
            >
              <MdErrorOutline className="w-4 h-4" />
              {errors.agreeToTerms.message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className={[
            "w-full h-10 rounded-xl text-sm font-semibold text-white tracking-wide mt-1",
            "bg-red-700 hover:bg-red-800 transition-all duration-200",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-700 focus-visible:ring-offset-2",
            "disabled:opacity-60 disabled:cursor-not-allowed active:scale-[.98]",
            "flex items-center justify-center gap-2",
          ].join(" ")}
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </button>

        <p className="text-center text-xs text-neutral-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-red-700 font-semibold hover:text-red-900 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </form>
    </AuthCard>
  );
};

export default SignupPage;
