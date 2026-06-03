import type { SVGProps } from "react";

export type IconName =
  | "dashboard"
  | "habits"
  | "log"
  | "check"
  | "summary"
  | "settings"
  | "plus"
  | "spark"
  | "arrow"
  | "user"
  | "chevron";

const paths: Record<IconName, string[]> = {
  dashboard: ["M4 13h7V4H4v9Z", "M13 20h7V4h-7v16Z", "M4 20h7v-5H4v5Z"],
  habits: ["M8 6h12", "M8 12h12", "M8 18h12", "M4 6h.01", "M4 12h.01", "M4 18h.01"],
  log: ["M12 5v14", "M5 12h14"],
  check: ["M20 6 9 17l-5-5"],
  summary: ["M4 19V5", "M8 17v-5", "M12 17V8", "M16 17v-9", "M20 17v-3"],
  settings: ["M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 3.1-.2-.1a1.7 1.7 0 0 0-1.9.2l-.3.2a1.7 1.7 0 0 0-.8 1.7V22h-3.6v-.1a1.7 1.7 0 0 0-.8-1.7l-.3-.2a1.7 1.7 0 0 0-1.9-.2l-.2.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1.1H3v-3.8h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-3.1.2.1a1.7 1.7 0 0 0 1.9-.2l.3-.2a1.7 1.7 0 0 0 .8-1.7V2h3.6v.1a1.7 1.7 0 0 0 .8 1.7l.3.2a1.7 1.7 0 0 0 1.9.2l.2-.1L19.8 7l-.1.1A1.7 1.7 0 0 0 19.4 9a1.7 1.7 0 0 0 1.5 1.1h.1v3.8h-.1a1.7 1.7 0 0 0-1.5 1.1Z"],
  plus: ["M12 5v14", "M5 12h14"],
  spark: ["M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"],
  arrow: ["M5 12h14", "m12 5 7 7-7 7"],
  user: ["M20 21a8 8 0 0 0-16 0", "M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8"],
  chevron: ["m6 9 6 6 6-6"]
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
}

export function Icon({ name, className = "h-5 w-5", ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      viewBox="0 0 24 24"
      {...props}
    >
      {paths[name].map((d) => (
        <path d={d} key={d} />
      ))}
    </svg>
  );
}
