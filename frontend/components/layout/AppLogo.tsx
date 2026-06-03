import Link from "next/link";

interface AppLogoProps {
  href?: string;
  compact?: boolean;
  markSize?: "sm" | "md";
  className?: string;
}

const markSizes = {
  sm: "h-10 w-10",
  md: "h-11 w-11"
};

export function AppLogo({ href = "/dashboard", compact = false, markSize = "md", className = "" }: AppLogoProps) {
  const content = (
    <>
      <LogoMark className={markSizes[markSize]} />
      {!compact ? (
        <div>
          <p className="text-sm font-semibold text-white">Habit Flow</p>
          <p className="text-xs text-slate-500">Weekly consistency</p>
        </div>
      ) : (
        <span className="font-semibold text-white">Habit Flow</span>
      )}
    </>
  );

  return (
    <Link className={`flex items-center gap-3 ${className}`} href={href}>
      {content}
    </Link>
  );
}

export function LogoMark({ className = "h-11 w-11" }: { className?: string }) {
  return (
    <svg aria-hidden="true" className={`shrink-0 ${className}`} fill="none" viewBox="0 0 40 40">
      <rect x="3" y="3" width="34" height="34" rx="11" fill="#071F29" />
      <rect x="3.5" y="3.5" width="33" height="33" rx="10.5" stroke="#5EEAD4" strokeOpacity="0.32" />
      <path
        d="M9.5 15.8C12.7 12.5 16.9 12.5 20 15.8C23.1 19.1 27.3 19.1 30.5 15.8"
        stroke="#5EEAD4"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
      />
      <path
        d="M9.5 24.2C12.7 20.9 16.9 20.9 20 24.2C23.1 27.5 27.3 27.5 30.5 24.2"
        stroke="#22D3EE"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="3"
        opacity="0.92"
      />
    </svg>
  );
}
