"use client";
import { useState } from "react";
import { Button, Input, LiveDot } from "./ui";

export function LoginForm() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });

      // Si el middleware redirigió el POST, la respuesta "ok" es la página de login, no la API.
      if (r.redirected) {
        setError("El servidor redirigió el login. Revisá que middleware.ts deje pasar /api/auth/login.");
        return;
      }
      if (r.ok) {
        // Navegación completa (no router.push) para que el navegador mande la cookie nueva
        // y no se reutilice ninguna redirección cacheada a /login.
        window.location.assign("/");
        return;
      }
      if (r.status === 401) {
        setError("Contraseña incorrecta");
        return;
      }
      const data = await r.json().catch(() => null);
      setError(data?.message ?? `Error del servidor (${r.status})`);
    } catch {
      setError("No se pudo conectar con el servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="dark grid min-h-screen place-items-center bg-[var(--bg)] p-5 text-[var(--ink)]">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-2 text-xs text-[var(--ink-dim)]">
          <LiveDot />
          <span>Bot en línea · SP Digitales</span>
        </div>
        <h1 className="font-display text-4xl font-medium leading-none">Centro de<br/>control</h1>
        <p className="mt-3 text-sm text-[var(--ink-dim)]">Ventas, clientes y comportamiento del bot, en un solo lugar.</p>

        <form onSubmit={submit} className="mt-8 space-y-3 border-t border-[var(--line)] pt-6">
          <Input
            type="password"
            placeholder="Contraseña de administrador"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p className="text-sm text-[var(--danger)]">{error}</p>}
          <Button className="w-full" disabled={loading}>{loading ? "Ingresando…" : "Ingresar"}</Button>
        </form>
      </div>
    </main>
  );
}
