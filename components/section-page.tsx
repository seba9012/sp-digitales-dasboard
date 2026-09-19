import { AppShell } from "./app-shell";
import { Card, Badge } from "./ui";

export function SectionPage({ title, kicker, description, children }: { title: string; kicker: string; description: string; children: React.ReactNode }) {
  return (
    <AppShell>
      <div className="mb-6 border-b border-[var(--line)] pb-5">
        <div className="text-xs font-medium text-[var(--ink-dim)]">{kicker}</div>
        <h1 className="font-display mt-1 text-[28px] font-medium leading-tight">{title}</h1>
        <p className="mt-1 text-sm text-[var(--ink-dim)]">{description}</p>
      </div>
      {children}
    </AppShell>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <Card className="grid min-h-52 place-items-center p-6 text-center">
      <div>
        <Badge>{text}</Badge>
        <p className="mt-3 text-sm text-[var(--ink-dim)]">Los datos aparecerán aquí cuando estén disponibles.</p>
      </div>
    </Card>
  );
}
