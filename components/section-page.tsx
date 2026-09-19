import { AppShell } from "./app-shell";
import { Card, Badge } from "./ui";

export function SectionPage({title,kicker,description,children}:{title:string;kicker:string;description:string;children:React.ReactNode}){
 return <AppShell><div className="mb-6"><div className="text-sm text-[var(--muted)]">{kicker}</div><h1 className="mt-1 text-2xl font-black">{title}</h1><p className="mt-1 text-sm text-[var(--muted)]">{description}</p></div>{children}</AppShell>
}
export function Empty({text}:{text:string}){return <Card className="grid min-h-52 place-items-center p-6 text-center"><div><Badge>{text}</Badge><p className="mt-3 text-sm text-[var(--muted)]">Los datos aparecerán aquí cuando estén disponibles.</p></div></Card>}
