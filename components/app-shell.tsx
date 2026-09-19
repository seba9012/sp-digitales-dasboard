"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Users, MessageSquare, Bot, WalletCards, Boxes, UserRoundCog, Brain, Menu, X, Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const nav = [
  ["/", "Resumen", LayoutDashboard],
  ["/clientes", "Clientes", Users],
  ["/conversaciones", "Conversaciones", MessageSquare],
  ["/bot", "Comportamiento del bot", Bot],
  ["/ventas", "Ventas y finanzas", WalletCards],
  ["/inventario", "Inventario", Boxes],
  ["/revendedores", "Revendedores", UserRoundCog],
  ["/conocimiento", "Conocimiento", Brain],
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { theme, setTheme } = useTheme();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--bg)]/92 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(v => !v)} className="rounded-md p-2 lg:hidden" aria-label="Menú">
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link href="/" className="flex items-center gap-2.5">
              <span className="font-display grid size-8 place-items-center rounded-md border border-[var(--line)] text-sm font-medium">SP</span>
              <span className="hidden sm:block">
                <span className="font-display block text-[15px] leading-none">SP Digitales</span>
                <span className="block text-[11px] leading-none text-[var(--ink-dim)] mt-1">Centro de control</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-md border border-[var(--line)] p-2.5 hover:bg-[var(--bg-soft)]" aria-label="Cambiar tema">
              {theme === "dark" ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button onClick={logout} className="rounded-md border border-[var(--line)] p-2.5 hover:bg-[var(--bg-soft)]" title="Cerrar sesión" aria-label="Cerrar sesión">
              <LogOut size={17} />
            </button>
          </div>
        </div>
      </header>

      <aside className={cn("fixed inset-y-16 left-0 z-20 w-64 overflow-y-auto border-r border-[var(--line)] bg-[var(--bg)] p-3 transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <nav className="space-y-0.5">
          {nav.map(([href, label, Icon]) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-md border-l-2 px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "border-l-[var(--signal)] bg-[var(--bg-soft)] text-[var(--ink)]"
                    : "border-l-transparent text-[var(--ink-dim)] hover:bg-[var(--bg-soft)] hover:text-[var(--ink)]"
                )}
              >
                <Icon size={17} />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
