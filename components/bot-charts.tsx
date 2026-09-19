"use client";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { Card } from "./ui";

const tooltipStyle = {
  background: "var(--card-raised)",
  border: "1px solid var(--line)",
  borderRadius: 8,
  fontSize: 12,
  boxShadow: "var(--shadow)",
};

const palette = ["var(--signal)", "var(--pulse)", "#7c8ce0", "#c76b9b", "#5aa9d6", "#b39150"];

export function BotCharts({ byHour, byType }: { byHour: { hour: string; value: number }[]; byType: { name: string; value: number }[] }) {
  return (
    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <Card className="p-5">
        <h2 className="font-display text-lg font-medium">Mensajes por hora</h2>
        <p className="text-xs text-[var(--ink-dim)]">Cuándo escribe la gente, hora a hora (AR)</p>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byHour}>
              <CartesianGrid vertical={false} stroke="var(--line)" strokeDasharray="3 3" />
              <XAxis dataKey="hour" tick={{ fill: "var(--ink-dim)", fontSize: 10 }} axisLine={{ stroke: "var(--line)" }} tickLine={false} interval={1} />
              <YAxis hide allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" fill="var(--signal)" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="p-5">
        <h2 className="font-display text-lg font-medium">Eventos por tipo</h2>
        <p className="text-xs text-[var(--ink-dim)]">Qué está generando movimiento en el bot</p>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={byType} dataKey="value" nameKey="name" innerRadius={58} outerRadius={95} paddingAngle={2}>
                {byType.map((_, i) => (
                  <Cell key={i} fill={palette[i % palette.length]} stroke="var(--card)" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {byType.map((t, i) => (
            <span key={t.name} className="flex items-center gap-1.5 text-xs text-[var(--ink-dim)]">
              <span className="size-2 rounded-full" style={{ background: palette[i % palette.length] }} />
              {t.name}
            </span>
          ))}
        </div>
      </Card>
    </div>
  );
}
