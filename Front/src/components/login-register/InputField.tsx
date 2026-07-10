import React, { forwardRef, useState } from "react";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai";
import { MdErrorOutline } from "react-icons/md";

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string;
  showPasswordToggle?: boolean;
  icon?: React.ReactNode;
}

const InputField = forwardRef<HTMLInputElement, InputFieldProps>(
  (
    {
      id,
      label,
      error,
      type = "text",
      showPasswordToggle,
      icon,
      className,
      ...rest
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const resolvedType = showPasswordToggle
      ? showPassword
        ? "text"
        : "password"
      : type;
    const hasError = Boolean(error);

    return (
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor={id}
          className="text-[11px] font-semibold uppercase tracking-widest text-neutral-500"
        >
          {label}
        </label>

        <div className="relative">
          <input
            ref={ref}
            id={id}
            type={resolvedType}
            aria-invalid={hasError}
            aria-describedby={hasError ? `${id}-error` : undefined}
            className={[
              "w-full h-10 pl-3.5 pr-10 rounded-xl text-sm bg-white text-neutral-900",
              "border-[1.5px] outline-none transition-all duration-200",
              "placeholder:text-neutral-300",
              hasError
                ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                : "border-neutral-200 focus:border-rose-600 focus:ring-2 focus:ring-rose-600/10",
              className ?? "",
            ].join(" ")}
            {...rest}
          />

          {/* static icon or password toggle */}
          {showPasswordToggle ? (
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-rose-600 transition-colors"
            >
              {showPassword ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
            </button>
          ) : icon ? (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none">
              {icon}
            </span>
          ) : null}
        </div>

        {hasError && (
          <p
            id={`${id}-error`}
            role="alert"
            className="text-xs text-red-500 flex items-center gap-1"
          >
            <MdErrorOutline 
              className="w-4 h-4"/> {error}
          </p>
        )}
      </div>
    );
  },
);

InputField.displayName = "InputField";
export default InputField;
