import { createOpportunity } from "@/features/opportunities/actions";
import { priceGuideEntries } from "@/lib/price-guide";

const today = new Date().toISOString().slice(0,10);
export default function NewOpportunityPage() {
  return <div className="mx-auto max-w-4xl">
    <div className="mb-6"><p className="text-sm font-bold text-moss dark:text-lime">CADASTRO MANUAL ASSISTIDO</p><h1 className="text-3xl font-black">Nova oportunidade</h1><p className="mt-1 text-sm text-[var(--muted)]">Cole o link para referência e preencha apenas o que você conseguiu verificar.</p></div>
    <form action={createOpportunity} className="grid gap-5">
      <section className="panel grid gap-4 p-5 sm:grid-cols-2"><h2 className="sm:col-span-2 text-lg font-black">Anúncio original</h2>
        <div className="field sm:col-span-2"><label>Título *</label><input className="input" name="title" required maxLength={120} autoFocus /></div>
        <div className="field sm:col-span-2"><label>URL original</label><input className="input" name="originalUrl" type="url" placeholder="https://…" /></div>
        <div className="field"><label>Fonte *</label><select name="source" required><option>Facebook Marketplace</option><option>OLX</option><option>Mercado Livre</option><option>Indicação</option><option>Outra</option></select></div>
        <div className="field"><label>Data da captura *</label><input className="input" name="capturedAt" type="date" defaultValue={today} required /></div>
      </section>
      <section className="panel grid gap-4 p-5 sm:grid-cols-2"><h2 className="sm:col-span-2 text-lg font-black">Produto</h2>
        <div className="field"><label>Categoria *</label><input className="input" name="category" required placeholder="Celulares" list="price-categories" /><datalist id="price-categories"><option value="Videogames"/><option value="Celulares"/><option value="Televisões"/><option value="Bicicletas"/><option value="Motos"/><option value="Carros"/></datalist></div><div className="field"><label>Subcategoria</label><input className="input" name="subcategory" /></div>
        <div className="field"><label>Marca</label><input className="input" name="brand" /></div><div className="field"><label>Modelo</label><input className="input" name="model" list="price-models" /><datalist id="price-models">{priceGuideEntries.map((entry)=><option key={entry.model} value={entry.model}/>)}</datalist></div><div className="field"><label>Versão</label><input className="input" name="version" /></div>
        <div className="field"><label>Conservação *</label><select name="condition" required><option value="USADO_BOM">Usado — bom</option><option value="USADO_REGULAR">Usado — regular</option><option value="COM_DEFEITO">Com defeito</option><option value="NOVO">Novo</option></select></div>
        <div className="field sm:col-span-2"><label>Capacidade / especificações</label><input className="input" name="specifications" placeholder="128 GB, 8 GB RAM…" /></div><div className="field sm:col-span-2"><label>Defeitos conhecidos</label><textarea name="defects" rows={2}/></div><div className="field sm:col-span-2"><label>Acessórios incluídos</label><input className="input" name="accessories" /></div><div className="field sm:col-span-2"><label>Descrição</label><textarea name="description" rows={3}/></div>
      </section>
      <section className="panel grid gap-4 p-5 sm:grid-cols-3"><h2 className="sm:col-span-3 text-lg font-black">Preço e custos previstos</h2>
        {[['askingPrice','Preço pedido *'],['negotiatedPrice','Preço negociado'],['travelCost','Deslocamento'],['purchaseShipping','Frete de compra'],['partsCost','Peças'],['repairCost','Reparo'],['cleaningCost','Limpeza'],['packagingCost','Embalagem'],['otherPurchaseCosts','Outros custos'],['minimumProfit','Lucro mínimo desejado']].map(([name,label])=><div className="field" key={name}><label>{label}</label><input className="input" name={name} inputMode="decimal" placeholder="0,00" required={name==='askingPrice'}/></div>)}
        <div className="field"><label>Dias prováveis para vender</label><input className="input" name="expectedDaysToSell" type="number" min="1" max="730" defaultValue="30" /></div>
      </section>
      <section className="panel grid gap-4 p-5 sm:grid-cols-2"><h2 className="sm:col-span-2 text-lg font-black">Local e risco</h2>
        <div className="field"><label>Cidade *</label><input className="input" name="city" defaultValue="Goiânia" required /></div><div className="field"><label>Bairro</label><input className="input" name="neighborhood" /></div><div className="field"><label>Contato mínimo (opcional)</label><input className="input" name="contact" placeholder="Apelido ou telefone estritamente necessário" /></div><div className="field"><label>Risco percebido</label><select name="riskLevel"><option value="BAIXO">Baixo</option><option value="MEDIO">Médio</option><option value="ALTO">Alto</option></select></div>
        <fieldset className="sm:col-span-2 grid gap-2 rounded-xl border border-[var(--border)] p-4"><legend className="px-2 font-bold">Sinais observados</legend><label><input type="checkbox" name="PAGAMENTO_ANTECIPADO"/> Pedido de pagamento antecipado</label><label><input type="checkbox" name="PRECO_MUITO_BAIXO"/> Preço muito abaixo do mercado</label><label><input type="checkbox" name="PRESSAO"/> Pressão para fechar rapidamente</label></fieldset>
        <div className="field sm:col-span-2"><label>Observações</label><textarea name="notes" rows={3}/></div>
      </section>
      <div className="sticky bottom-16 z-10 flex justify-end rounded-2xl border border-[var(--border)] bg-[var(--panel)]/95 p-3 backdrop-blur lg:bottom-3"><button className="button">Salvar e analisar</button></div>
    </form>
  </div>;
}
