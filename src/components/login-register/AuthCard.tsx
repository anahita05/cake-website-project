import React from "react";
import { GiStarProminences } from "react-icons/gi";

interface BrandPanelProps {
  icon: React.ReactNode;
  title: React.ReactNode;
  subtitle: string;
  features: string[];
}

export const BrandPanel: React.FC<BrandPanelProps> = ({ icon, title, subtitle, features }) => (
  <div className="hidden lg:flex flex-col bg-red-700 p-9 relative overflow-hidden">
    {/* decorative circles */}
    <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full bg-white/10" />
    <div className="absolute bottom-8 -left-5 w-18 h-18 rounded-full bg-white/8" />

    {/* brand mark */}
    <div className="relative z-10 w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center mb-7 animate-pulse">
      {icon}
    </div>

    <h2 className="relative z-10 font-bold text-xl text-white leading-snug mb-2">{title}</h2>
    <p className="relative z-10 text-sm text-white/60 leading-relaxed mb-8">{subtitle}</p>

    <ul className="relative z-10 flex flex-col gap-2.5">
      {features.map((f) => (
        <li key={f} className="flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white/50 shrink-0" />
          <span className="text-xs text-white/75">{f}</span>
        </li>
      ))}
    </ul>
  </div>
);

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  panelProps: BrandPanelProps;
}

const AuthCard: React.FC<AuthCardProps> = ({ children, title, subtitle, panelProps }) => (
  <div className="h-screen #f1ebe4 flex items-center justify-center p-4">
    <div className="w-full max-w-3xl grid lg:grid-cols-[240px_1fr] rounded-2xl overflow-hidden shadow-xl shadow-black/10">
      <BrandPanel {...panelProps} />

      <div className="bg-white px-8 py-9 flex flex-col gap-0">
        {/* mobile brand */}
        <div className="flex lg:hidden items-center gap-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-red-700 flex items-center justify-center">
            <GiStarProminences
              className="w-7 h-7 text-white" />
          </div>
          <span className="font-bold text-base text-neutral-900">Cake Studio</span>
        </div>

        <div className="mb-6 animate-[fadeUp_.4s_ease_both]">
          <h3 className="text-xl font-bold text-neutral-900 mb-1">{title}</h3>
          <p className="text-xs text-neutral-400">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  </div>
);

export default AuthCard;
