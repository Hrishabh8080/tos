"use client";
import Link from "next/link";
import css from "./Button.module.css";
import Icon from "./Icon";

/**
 * Unified button/link. Premium blue by default, orange hover accent.
 * variant: "primary" | "accent" | "ghost" | "outline" | "dark" | "whatsapp"
 * Renders an <a>/<Link> when `href` is given, else a <button>.
 */
export default function Button({
  children,
  href,
  variant = "primary",
  size = "md",
  icon,
  iconRight = true,
  full,
  external,
  className = "",
  ...rest
}) {
  const cls = `${css.btn} ${css[variant] || ""} ${css[size] || ""} ${full ? css.full : ""} ${className}`;

  const inner = (
    <>
      {icon && !iconRight && <Icon name={icon} size={18} className={css.ico} />}
      <span>{children}</span>
      {icon && iconRight && <Icon name={icon} size={18} className={css.ico} />}
    </>
  );

  if (href) {
    if (external) {
      return (
        <a href={href} className={cls} target="_blank" rel="noopener noreferrer" {...rest}>
          {inner}
        </a>
      );
    }
    return (
      <Link href={href} className={cls} {...rest}>
        {inner}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {inner}
    </button>
  );
}
