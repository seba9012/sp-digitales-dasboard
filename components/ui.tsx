import { cn } from "@/lib/utils";

export function Card({
  className,
  children,
  accent,
}: {
  className?: string;
  children: React.ReactNode;
  /** Franja superior de 3px para marcar una tarjeta como la protagonista de la sección. */
  accent?: "signal" | "pulse" | "danger";
}) {
  const accentColor = accent === "signal" ? "var(--signal)" : accent === "pulse" ? "var(--pulse)" : accent === "danger" ? "var(--danger)" : undefined;
  return (
    <div
      className={cn("rounded-lg border border-[var(--line)] bg-[var(--card)]", className)}
      style={accentColor ? { boxShadow: `inset 0 2px 0 0 ${accentColor}` } : undefined}
    >
      {children}
    </div>
  );
}

const toneDot: Record<string, string> = {
  neutral: "var(--ink-dim)",
  success: "var(--pulse)",
  warning: "var(--signal)",
  danger: "var(--danger)",
  info: "var(--pulse)",
};
const toneText: Record<string, string> = {
  neutral: "text-[var(--ink-dim)]",
  success: "text-[var(--pulse)]",
  warning: "text-[var(--signal)]",
  danger: "text-[var(--danger)]",
  info: "text-[var(--pulse)]",
};

export function Badge({
  children,
  tone = "neutral",
  dot = true,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger" | "info";
  dot?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] px-2.5 py-1 text-xs font-semibold", toneText[tone])}>
      {dot && <span className="size-1.5 rounded-full" style={{ background: toneDot[tone] }} />}
      {children}
    </span>
  );
}

export function Button({
  className,
  children,
  variant = "solid",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid" | "ghost" }) {
  const base = "inline-flex items-center justify-center gap-2 rounded-md px-3.5 py-2.5 text-sm font-semibold transition disabled:opacity-50";
  const styles =
    variant === "ghost"
      ? "border border-[var(--line)] hover:bg-[var(--bg-soft)]"
      : "bg-[var(--ink)] text-[var(--bg)] hover:opacity-85";
  return (
    <button className={cn(base, styles, className)} {...props}>
      {children}
    </button>
  );
}

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-md border border-[var(--line)] bg-transparent px-3.5 py-2.5 text-sm outline-none placeholder:text-[var(--ink-dim)] focus:border-[var(--signal)]",
        props.className
      )}
    />
  );
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={cn("rounded-md border border-[var(--line)] bg-[var(--card)] px-3.5 py-2.5 text-sm outline-none focus:border-[var(--signal)]", props.className)}
    />
  );
}

/** Punto de estado en vivo — usado para el bot online/offline y para métricas "en movimiento". */
export function LiveDot({ tone = "success" }: { tone?: "success" | "danger" | "warning" }) {
  const color = tone === "success" ? "var(--pulse)" : tone === "danger" ? "var(--danger)" : "var(--signal)";
  return (
    <span className="relative inline-flex size-2">
      <span className="pulse-dot absolute inline-flex size-2 rounded-full" style={{ background: color }} />
    </span>
  );
}
