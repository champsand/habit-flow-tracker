import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-emerald-400 text-slate-950 hover:bg-emerald-300 shadow-lg shadow-emerald-950/30 disabled:bg-slate-700 disabled:text-slate-400",
  secondary: "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700 disabled:text-slate-500",
  ghost: "text-slate-300 hover:bg-slate-800/80 disabled:text-slate-600",
  danger: "bg-rose-500/12 text-rose-300 hover:bg-rose-500/20 border border-rose-500/25 disabled:text-rose-300/40"
};

const base =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-emerald-400/50 disabled:cursor-not-allowed disabled:shadow-none";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  variant?: ButtonVariant;
  children: ReactNode;
}

export function Button({ className = "", variant = "primary", ...props }: ButtonProps) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}

export function LinkButton({ className = "", variant = "primary", href, children, ...props }: LinkButtonProps) {
  return (
    <Link className={`${base} ${variants[variant]} ${className}`} href={href} {...props}>
      {children}
    </Link>
  );
}
