import { createOpportunity } from "@/features/opportunities/actions";
import { evaluatePriceGuide, priceGuideEntries } from "@/lib/price-guide";

const today = new Date().toISOString().slice(0, 10);
const text = (value: string | string[] | undefined, max: number) => (Array.isArray(value) ? value[0] : value ?? "").trim().slice(0, max);
const sources = ["Facebook Marketplace", "OLX", "Mercado Livre", "Indicação", "Outra"];

type NewOpportunityParams = Promise<Record<string, string | string[] | undefined>>;

export default async function NewOpportunityPage({ searchParams }: { searchParams: NewOpportunityParams }) {
  const params = await searchParams;
  const title = text(params.title, 120);
  const description = text(params.description, 1000);
  const originalUrl = text(params.originalUrl, 1800);
  const askingPrice = text(params.price, 30);
  const requestedSource = text(params.source, 40);
  const source = sources.includes(requestedSource) ? requestedSource : "Outra";
  const location = text(params.location, 120);
  const imageUrlCandidate = text(params.imageUrl, 1500);
  const imageUrl = /^https?:\/\//i.test(imageUrlCandidate) ? imageUrlCandidate : "";
  const detected = evaluatePriceGuide({ title, description });
  const detectedCategory = detected.reference?.category === "iPhones" ? "Celulares" : detected.reference?.category ?? "";
  const notes = location ? `Local informado no anúncio: ${location}` : "";

  return <div className="mx-auto max-w-4xl">
    <div className="mb-6"><p className="text-sm font-bold text-moss dark:text-lime">CADASTRO MANUAL ASSISTIDO</p><h1 className="text-3xl font-black">Nova oportunidade</h1><p className="mt-1 text-sm text-[var(--muted)]">Cole o link para referência e preencha apenas o que você conseguiu verificar.</p></div>

    {params.captured === "1" && <section className="panel mb-5 overflow-hidden border-moss"><div className="grid sm:grid-cols-[150px_1fr]">{imageUrl ? <img src={imageUrl} alt="Foto encontrada no anúncio" className="h-40 w-full object-cover sm:h-full" referrerPolicy="no-referrer" /> : <div className="grid min-h-28 place-items-center bg-black/5 text-sm text-[var(--muted)]">Sem foto disponível</div>}<div className="p-5"><span className="badge">Recebido da extensão</span><h2 className="mt-2 text-lg font-black">Confira antes de salvar</h2><p className="mt-1 text-sm text-[var(--muted)]">Os sites podem mudar o formato da página. Corrija qualquer campo que não tenha sido reconhecido.</p></div></div></section>}

    <form action={createOpportunity} className="grid gap-5">
      <section className="panel grid gap-4 p-5 sm:grid-cols-2"><h2 className="text-lg font-black sm:col-span-2">Anúncio original</h2>
        <div className="field sm:col-span-2"><label>Título *</label><input className="input" name="title" required maxLength={120} autoFocus defaultValue={title} /></div>
        <div className="field sm:col-span-2"><label>URL original</label><input className="input" name="originalUrl" type="url" placeholder="https://…" defaultValue={originalUrl} /></div>
        <div className="field"><label>Fonte *</label><select name="source" required defaultValue={source}>{sources.map((item) => <option key={item}>{item}</option>)}</select></div>
        <div className="field"><label>Data da captura *</label><input className="input" name="capturedAt" type="date" defaultValue={today} required /></div>
      </section>
      <section className="panel grid gap-4 p-5 sm:grid-cols-2"><h2 className="text-lg font-black sm:col-span-2">Produto</h2>
        <div className="field"><label>Categoria *</label><input className="input" name="category" required placeholder="Celulares" list="price-categories" defaultValue={detectedCategory} /><datalist id="price-categories"><option value="Videogames"/><option value="Celulares"/><option value="Televisões"/><option value="Bicicletas"/><option value="Motos"/><option value="Carros"/></datalist></div><div className="field"><label>Subcategoria</label><input className="input" name="subcategory" /></div>
        <div className="field"><label>Marca</label><input className="input" name="brand" /></div><div className="field"><label>Modelo</label><input className="input" name="model" list="price-models" defaultValue={detected.reference?.model ?? ""} /><datalist id="price-models">{priceGuideEntries.map((entry)=><option key={entry.model} value={entry.model}/>)}</datalist></div><div className="field"><label>Versão</label><input className="input" name="version" /></div>
        <div className="field"><label>Conservação *</label><select name="condition" required defaultValue="USADO_BOM"><option value="USADO_BOM">Usado — bom</option><option value="USADO_REGULAR">Usado — regular</option><option value="COM_DEFEITO">Com defeito</option><option value="NOVO">Novo</option></select></div>
        <div className="field sm:col-span-2"><label>Capacidade / especificações</label><input className="input" name="specifications" placeholder="128 GB, 8 GB RAM…" /></div><div className="field sm:col-span-2"><label>Defeitos conhecidos</label><textarea name="defects" rows={2}/></div><div className="field sm:col-span-2"><label>Acessórios incluídos</label><input className="input" name="accessories" /></div><div className="field sm:col-span-2"><label>Descrição</label><textarea name="description" rows={3} defaultValue={description}/></div>
      </section>
      <section className="panel grid gap-4 p-5 sm:grid-cols-3"><h2 className="text-lg font-black sm:col-span-3">Preço e custos previstos</h2>
        {[["askingPrice","Preço pedido *"],["negotiatedPrice","Preço negociado"],["travelCost","Deslocamento"],["purchaseShipping","Frete de compra"],["partsCost","Peças"],["repairCost","Reparo"],["cleaningCost","Limpeza"],["packagingCost","Embalagem"],["otherPurchaseCosts","Outros custos"],["minimumProfit","Lucro mínimo desejado"]].map(([name,label])=><div className="field" key={name}><label>{label}</label><input className="input" name={name} inputMode="decimal" placeholder="0,00" required={name === "askingPrice"} defaultValue={name === "askingPrice" ? askingPrice : undefined}/></div>)}
        <div className="field"><label>Dias prováveis para vender</label><input className="input" name="expectedDaysToSell" type="number" min="1" max="730" defaultValue="30" /></div>
      </section>
      <section className="panel grid gap-4 p-5 sm:grid-cols-2"><h2 className="text-lg font-black sm:col-span-2">Local e risco</h2>
        <div className="field"><label>Cidade *</label><input className="input" name="city" defaultValue="Goiânia" required /></div><div className="field"><label>Bairro</label><input className="input" name="neighborhood" /></div><div className="field"><label>Contato mínimo (opcional)</label><input className="input" name="contact" placeholder="Apelido ou telefone estritamente necessário" /></div><div className="field"><label>Risco percebido</label><select name="riskLevel" defaultValue="MEDIO"><option value="BAIXO">Baixo</option><option value="MEDIO">Médio</option><option value="ALTO">Alto</option></select></div>
        <fieldset className="grid gap-2 rounded-xl border border-[var(--border)] p-4 sm:col-span-2"><legend className="px-2 font-bold">Sinais observados</legend><label><input type="checkbox" name="PAGAMENTO_ANTECIPADO"/> Pedido de pagamento antecipado</label><label><input type="checkbox" name="PRECO_MUITO_BAIXO"/> Preço muito abaixo do mercado</label><label><input type="checkbox" name="PRESSAO"/> Pressão para fechar rapidamente</label></fieldset>
        <div className="field sm:col-span-2"><label>Observações</label><textarea name="notes" rows={3} defaultValue={notes}/></div>
      </section>
      <div className="sticky bottom-16 z-10 flex justify-end rounded-2xl border border-[var(--border)] bg-[var(--panel)]/95 p-3 backdrop-blur lg:bottom-3"><button className="button">Salvar e analisar</button></div>
    </form>
  </div>;
}
