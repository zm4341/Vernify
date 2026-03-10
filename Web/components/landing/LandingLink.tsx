"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";

const focusRing =
  "focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 focus:ring-offset-transparent";

const primaryStyle = {
  background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
  boxShadow: "0 4px 20px rgba(124, 58, 237, 0.3)",
};

const primaryCtaStyle = {
  background: "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
  boxShadow: "0 8px 32px rgba(124, 58, 237, 0.4)",
};

const ghostBg = "rgba(255,255,255,0.05)";

type Variant = "primary" | "ghost";
type Size = "nav" | "cta";

interface LandingLinkProps {
  href: string;
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  children: React.ReactNode;
  className?: string;
  ariaLabel?: string;
}

/**
 * 落地页可复用链接组件，消除 Nav / Hero / Climax CTA 中的重复样式
 */
export function LandingLink({
  href,
  variant = "ghost",
  size = "cta",
  icon: Icon,
  children,
  className = "",
  ariaLabel,
}: LandingLinkProps) {
  const isNav = size === "nav";
  const isPrimary = variant === "primary";

  const baseClasses = [
    "flex items-center gap-2 cursor-pointer transition-all duration-200",
    focusRing,
    className,
  ].join(" ");

  if (isNav) {
    const navClasses = [
      "px-4 py-2 sm:px-5 rounded-full text-sm font-medium",
      isPrimary
        ? "text-white hover:opacity-90"
        : "text-white/80 hover:text-white bg-white/10 hover:bg-white/15",
    ].join(" ");

    return (
      <Link
        href={href}
        className={`${baseClasses} ${navClasses}`}
        style={isPrimary ? primaryStyle : undefined}
        aria-label={ariaLabel}
      >
        {Icon && <Icon size={16} aria-hidden />}
        {children}
      </Link>
    );
  }

  // CTA size (hero / climax)
  const ctaClasses = [
    "px-6 py-3 sm:px-8 sm:py-4 rounded-2xl",
    isPrimary
      ? "text-white font-semibold hover:shadow-[0_8px_40px_rgba(124,58,237,0.5)]"
      : "text-white/70 font-medium hover:text-white hover:bg-white/10",
  ].join(" ");

  return (
    <Link
      href={href}
      className={`${baseClasses} ${ctaClasses}`}
      style={
        isPrimary
          ? primaryCtaStyle
          : { background: ghostBg }
      }
      aria-label={ariaLabel}
    >
      {Icon && <Icon size={20} aria-hidden />}
      {children}
    </Link>
  );
}
