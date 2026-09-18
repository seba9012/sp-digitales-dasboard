import { cn } from "@/lib/utils";

export function Card({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm", className)}>{children}</div>;
}
export function Badge({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral"|"success"|"warning"|"danger"|"info" }) {
  const tones = {
    neutral: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
    danger: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300",
    info: "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
  };
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", tones[tone])}>{children}</span>;
}
export function Button({ className, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button className={cn("inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50 bg-[var(--brand)] text-white", className)} {...props}>{children}</button>;
}
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn("w-full rounded-xl border border-[var(--border)] bg-transparent px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-300", props.className)} />;
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn("rounded-xl border border-[var(--border)] bg-[var(--card)] px-3.5 py-2.5 text-sm outline-none", props.className)} />;
}
