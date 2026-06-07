import { cn } from "@/lib/utils";

interface SiteLogoProps {
  name?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 28, text: "text-sm" },
  md: { icon: 32, text: "text-lg" },
  lg: { icon: 40, text: "text-xl" },
};

export function SiteLogo({
  name = "极速比分",
  size = "md",
  showText = true,
  className,
}: SiteLogoProps) {
  const { icon, text } = sizes[size];

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={icon} />
      {showText && (
        <span className={cn(text, "font-black tracking-tight text-foreground")}>
          {name}
        </span>
      )}
    </span>
  );
}

export function LogoMark({ size = 32, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={cn("shrink-0", className)}
    >
      <rect width="32" height="32" rx="8" fill="#111827" />
      <path
        d="M4 11h7M5 16h9M4 21h7"
        stroke="#EF4444"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
      <circle cx="22" cy="16" r="8" fill="white" />
      <path
        d="M22 11.2l2.4 2.3.6 3.3-2.5 2.1-3.3-.2-2.1-2.5 1.1-3.2 3.8-.8z"
        fill="#111827"
      />
      <path
        d="M22 11.2v4.8M19.2 13.6h5.6M17.9 17.1l4.1 3.5M20.1 19.8l3.8-3.8"
        stroke="#111827"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  );
}
