import Link from "next/link";
import { eq } from "drizzle-orm";
import { db } from "@/database/client";
import { opportunities } from "@/database/schema";
import { requireUser } from "@/lib/auth/session";

export default async function InspectionPage() {
  const user = await requireUser();
  const items = await db.select().from(opportunities).where(eq(opportunities.userId, user.userId)).all();
  const active = items.filter((item) => item.status === "EM_ANALISE" || item.status === "NEGOCIACAO");
  return <div className="grid gap-6"><header><h1 className="text-3xl font-black">Inspeção e modo visita</h1><p className="text-sm text-[var(--muted)]">Abra um item no celular, marque o que conferiu e salve o resultado vinculado à oportunidade.</p></header><section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{active.map((item) => <Link className="panel p-5 hover:border-moss" href={`/visita/${item.id}`} key={item.id}><p className="text-xs font-bold uppercase text-[var(--muted)]">{item.category}</p><h2 className="mt-1 text-lg font-black">{item.title}</h2><p className="mt-2 text-sm text-moss dark:text-lime">Iniciar inspeção →</p></Link>)}</section>{!active.length && <section className="panel p-8 text-center"><h2 className="text-xl font-black">Nenhuma oportunidade aguardando inspeção</h2><Link className="button mt-4" href="/oportunidades/nova">Cadastrar oportunidade</Link></section>}</div>;
}
