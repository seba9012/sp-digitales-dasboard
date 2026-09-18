"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LayoutDashboard, Users, MessageSquare, Bot, WalletCards, Boxes, UserRoundCog, Brain, Menu, X, Moon, Sun, LogOut } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "./ui";
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
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--background)]/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(v=>!v)} className="rounded-xl p-2 lg:hidden" aria-label="Menú">
              {open ? <X size={21}/> : <Menu size={21}/>}
            </button>
            <div className="flex items-center gap-2">
              <div className="grid size-9 place-items-center rounded-xl bg-[var(--brand)] text-sm font-black text-white">SP</div>
              <div className="hidden sm:block"><div className="font-bold">SP Digitales</div><div className="text-[11px] text-[var(--muted)]">CRM</div></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="rounded-xl border border-[var(--border)] p-2.5">
              {theme === "dark" ? <Sun size={18}/> : <Moon size={18}/>}
            </button>
            <button onClick={logout} className="rounded-xl border border-[var(--border)] p-2.5" title="Cerrar sesión"><LogOut size={18}/></button>
          </div>
        </div>
      </header>

      <aside className={cn("fixed inset-y-16 left-0 z-20 w-72 border-r border-[var(--border)] bg-[var(--background)] p-4 transition-transform lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <nav className="space-y-1">
          {nav.map(([href, label, Icon]) => (
            <Link key={href} href={href} onClick={()=>setOpen(false)} className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium", pathname===href ? "bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300" : "text-[var(--muted)] hover:bg-black/5 dark:hover:bg-white/5")}>
              <Icon size={18}/>{label}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="lg:pl-72">
        <div className="mx-auto max-w-[1500px] p-4 sm:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}