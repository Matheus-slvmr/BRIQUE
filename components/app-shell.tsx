import Link from "next/link";
import { BarChart3, Boxes, CircleDollarSign, FileBarChart, Heart, PlusCircle, Radar, Search, Settings, ShieldCheck, Table2 } from "lucide-react";
import { ThemeToggle } from "./theme-toggle";

const nav = [
  ["Painel", "/", BarChart3],
  ["Oportunidades", "/oportunidades", Search],
  ["Radar", "/radar", Radar],
  ["Favoritos", "/favoritos", Heart],
  ["Estoque", "/estoque", Boxes],
  ["Financeiro", "/financeiro", CircleDollarSign],
  ["Tabela", "/referencias", Table2],
  ["Inspeção", "/inspecao", ShieldCheck],
  ["Relatórios", "/relatorios", FileBarChart],
  ["Configurações", "/configuracoes", Settings],
] as const;

export function AppShell({ children, userName }: { children: React.ReactNode; userName: string }) {
  return <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]"><aside className="hidden border-r border-[var(--border)] bg-[var(--panel)] p-5 lg:flex lg:flex-col"><Link href="/" className="text-2xl font-black">Brique<span className="text-moss">GO</span></Link><Link href="/oportunidades/nova" className="button mt-7"><PlusCircle size={18}/>Nova oportunidade</Link><nav className="mt-7 grid gap-1" aria-label="Navegação principal">{nav.map(([label, href, Icon]) => <Link key={href} href={href} className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold hover:bg-black/5 dark:hover:bg-white/5"><Icon size={18}/>{label}</Link>)}</nav><div className="mt-auto flex items-center justify-between border-t border-[var(--border)] pt-4"><div><p className="text-xs text-[var(--muted)]">Uso local</p><p className="max-w-32 truncate text-sm font-bold">{userName}</p></div><ThemeToggle/></div></aside><div><header className="sticky top-0 z-20 flex items-center justify-between border-b border-[var(--border)] bg-[var(--panel)]/95 px-4 py-3 backdrop-blur lg:hidden"><Link href="/" className="text-xl font-black">Brique<span className="text-moss">GO</span></Link><div className="flex gap-2"><Link href="/buscar" className="button secondary px-3" aria-label="Pesquisa global"><Search size={17}/></Link><Link href="/oportunidades/nova" className="button py-2"><PlusCircle size={17}/>Adicionar</Link></div></header><main className="mx-auto max-w-7xl p-4 pb-24 sm:p-7">{children}</main><nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-[var(--border)] bg-[var(--panel)] px-1 py-2 lg:hidden" aria-label="Navegação móvel">{nav.slice(0, 3).concat(nav.slice(4, 6)).map(([label, href, Icon]) => <Link key={href} href={href} className="grid place-items-center gap-1 text-[10px] font-bold"><Icon size={20}/>{label}</Link>)}</nav></div></div>;
}
