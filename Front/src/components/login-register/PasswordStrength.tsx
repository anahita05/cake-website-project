import React, { useMemo } from "react";

interface PasswordStrengthProps { password: string }

function evaluate(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: "", color: "" };
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  s = Math.min(s, 4);
  const map: Record<number, { label: string; color: string }> = {
    0: { label: "", color: "#e5e7eb" },
    1: { label: "Weak", color: "#E74C3C" },
    2: { label: "Fair", color: "#F39C12" },
    3: { label: "Strong", color: "#3ec778" },
    4: { label: "Very strong", color: "#16A085" },
  };
  return { score: s, ...map[s] };
}

const PasswordStrength: React.FC<PasswordStrengthProps> = ({ password }) => {
  const { score, label, color } = useMemo(() => evaluate(password), [password]);
  if (!password) return null;

  return (
    <div className="flex flex-col gap-1" aria-live="polite">
      <div className="flex gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-0.75 flex-1 rounded-full bg-neutral-200 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: i < score ? "100%" : "0%", background: color }}
            />
          </div>
        ))}
      </div>
      <p className="text-[11px]" style={{ color }}>
        {label && `Strength: ${label}`}
      </p>
    </div>
  );
};

export default PasswordStrength;
