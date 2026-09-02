import type { Metadata } from "next";
import { LockKeyhole, LogIn, ShieldCheck } from "lucide-react";
import { safeReturnPath } from "@/lib/auth/hosted-access";

export const metadata: Metadata = { title: "Entrar" };

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const returnPath = safeReturnPath(params.next);

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="panel w-full max-w-md overflow-hidden">
        <div className="bg-[#2f5d45] px-7 py-8 text-white">
          <div className="mb-5 inline-flex rounded-2xl bg-white/15 p-3">
            <LockKeyhole size={28} aria-hidden="true" />
          </div>
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/70">Acesso particular</p>
          <h1 className="mt-2 text-3xl font-black">Brique<span className="text-[#d8ec80]">GO</span></h1>
          <p className="mt-3 text-sm leading-6 text-white/80">Entre para acessar seus anúncios, estoque e financeiro.</p>
        </div>

        <form action="/api/auth/login" method="post" className="grid gap-5 p-7">
          <input type="hidden" name="next" value={returnPath} />

          {params.error === "1" && (
            <div role="alert" className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800">
              Usuário ou senha incorretos. Tente novamente.
            </div>
          )}

          <div className="field">
            <label htmlFor="username">Usuário</label>
            <input className="input" id="username" name="username" autoComplete="username" autoFocus required />
          </div>

          <div className="field">
            <label htmlFor="password">Senha</label>
            <input className="input" id="password" name="password" type="password" autoComplete="current-password" required />
          </div>

          <button className="button w-full py-3" type="submit">
            <LogIn size={18} aria-hidden="true" /> Entrar
          </button>

          <p className="flex items-center justify-center gap-2 text-center text-xs text-[var(--muted)]">
            <ShieldCheck size={15} aria-hidden="true" /> Seus dados permanecem privados.
          </p>
        </form>
      </section>
    </main>
  );
}
