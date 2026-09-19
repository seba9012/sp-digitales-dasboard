"use client";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { Card } from "./ui";

export function BotCharts({byHour,byType}:{byHour:{hour:string;value:number}[];byType:{name:string;value:number}[]}){
 return <div className="mt-6 grid gap-6 xl:grid-cols-2">
  <Card className="p-5"><h2 className="font-bold">Mensajes por hora</h2><div className="mt-4 h-72"><ResponsiveContainer width="100%" height="100%"><BarChart data={byHour}><XAxis dataKey="hour"/><YAxis allowDecimals={false}/><Tooltip/><Bar dataKey="value" fill="currentColor"/></BarChart></ResponsiveContainer></div></Card>
  <Card className="p-5"><h2 className="font-bold">Eventos por tipo</h2><div className="mt-4 h-72"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={byType} dataKey="value" nameKey="name" outerRadius={95} label>{byType.map((_,i)=><Cell key={i}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div></Card>
 </div>
}
