"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Users, MessageSquare, Bot, WalletCards, Boxes,
  UserRoundCog, Brain, Menu, X, Moon, Sun, LogOut, Settings,
  PanelLeftClose, PanelLeft,
} from "lucide-react";
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
  ["/configuracion", "Configuración", Settings],
] as const;

const COLLAPSE_KEY = "sp-sidebar-collapsed";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const { theme, setTheme } = useTheme();

  // Carga la preferencia guardada una vez montado, para evitar mismatch de hidratación
  useEffect(() => {
    const saved = localStorage.getItem(COLLAPSE_KEY);
    if (saved === "1") setCollapsed(true);
    setHydrated(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const sidebarWidth = collapsed ? "w-[72px]" : "w-64";
  const mainPad = collapsed ? "lg:pl-[72px]" : "lg:pl-64";

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen((v) => !v)} className="rounded-xl p-2 lg:hidden" aria-label="Menú">
              {mobileOpen ? <X size={21} /> : <Menu size={21} />}
            </button>
            <div className="flex items-center gap-2">
              <div className="grid size-9 place-items-center rounded-xl bg-[var(--brand)] text-sm font-black text-white">SP</div>
              <div className="hidden sm:block"><div className="font-bold">SP Digitales</div><div className="text-[11px] text-[var(--muted)]">CRM</div></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-xl border border-[var(--border)] p-2.5">
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button onClick={logout} className="rounded-xl border border-[var(--border)] p-2.5" title="Cerrar sesión"><LogOut size={18} /></button>
          </div>
        </div>
      </header>

      {/* overlay móvil */}
      {mobileOpen && (
        <div
          className="fixed inset-0 top-16 z-10 bg-black/30 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-16 left-0 z-20 flex flex-col border-r border-[var(--border)] bg-[var(--background)] p-3 transition-all duration-200 lg:translate-x-0",
          sidebarWidth,
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          !hydrated && "duration-0",
        )}
      >
        {/* toggle: colapsar/expandir (visible solo en desktop) */}
        <button
          onClick={toggleCollapsed}
          className={cn(
            "mb-2 hidden items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-[var(--muted)] hover:bg-black/5 lg:flex dark:hover:bg-white/5",
            collapsed && "justify-center px-0",
          )}
          aria-label={collapsed ? "Expandir menú" : "Ocultar menú"}
          title={collapsed ? "Expandir menú" : "Ocultar menú"}
        >
          {collapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          {!collapsed && <span>Ocultar menú</span>}
        </button>

        <nav className="space-y-1">
          {nav.map(([href, label, Icon]) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                title={collapsed ? label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  collapsed && "justify-center px-0",
                  active
                    ? "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
                    : "text-[var(--muted)] hover:bg-black/5 dark:hover:bg-white/5",
                )}
              >
                <Icon size={18} className="shrink-0" />
                {!collapsed && <span className="truncate">{label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className={cn("transition-[padding] duration-200", mainPad)}>
        <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
