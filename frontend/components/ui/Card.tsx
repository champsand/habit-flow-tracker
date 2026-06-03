import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  as?: "article" | "section" | "aside" | "div";
  padded?: boolean;
}

export function Card({ as: Tag = "section", children, className = "", padded = true, ...props }: CardProps) {
  return (
    <Tag
      className={`rounded-3xl border border-slate-800 bg-slate-900/75 shadow-soft shadow-black/10 ${padded ? "p-5 sm:p-6" : ""} ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
