"use client";
import { useState } from "react";
import { Button, Input } from "./ui";

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
    <main className="grid min-h-screen place-items-center p-5">
      <div className="w-full max-w-sm rounded-3xl border border-[var(--border)] bg-[var(--card)] p-7 shadow-xl">
        <div className="mb-8">
          <div className="grid size-12 place-items-center rounded-2xl bg-[var(--brand)] font-black text-white">SP</div>
          <h1 className="mt-5 text-2xl font-black">SP Digitales</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">Acceso al CRM</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <Input
            type="password"
            placeholder="Contraseña de administrador"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <Button className="w-full" disabled={loading}>{loading ? "Ingresando..." : "Ingresar"}</Button>
        </form>
      </div>
    </main>
  );
}
