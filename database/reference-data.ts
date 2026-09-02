import { db } from "./client";
import { connectors, dataSources, inspectionChecklists } from "./schema";

const checklists = [
  { id: "checklist-geral", category: "Geral", name: "Checklist antifraude geral", items: ["Vendedor aceita encontro em local seguro", "Produto pode ser testado", "Número de série disponível", "Nota fiscal disponível", "Fotos parecem próprias", "Preço muito abaixo do mercado", "Pedido de pagamento antecipado", "Pressão para fechar rapidamente", "Defeitos não informados", "Titularidade verificável", "IMEI ou número de série conferido quando aplicável"] },
  { id: "checklist-celulares", category: "Celulares", name: "Inspeção — Celulares", items: ["IMEI coincide no aparelho, caixa e consulta aplicável", "Conta do fabricante foi removida", "Câmeras, biometria, áudio e carregamento testados", "Tela sem manchas, toque fantasma ou sinais de troca", "Saúde da bateria conferida (iPhone 13 e anteriores: acima de 75%)", "Aparelho não está com chip off nem bloqueado"] },
  { id: "checklist-notebooks", category: "Notebooks", name: "Inspeção — Notebooks", items: ["Bateria e carregador testados", "SMART do armazenamento verificado", "Tela, teclado, portas e Wi‑Fi testados", "BIOS sem senha ou bloqueio corporativo"] },
  { id: "checklist-videogames", category: "Videogames", name: "Inspeção — Videogames", items: ["Console conecta à rede sem bloqueio", "Leitor, portas e controles testados", "PS4 possui leitor de disco funcionando", "Modelo não é Xbox One Fat", "Lacres e sinais de abertura inspecionados", "Conta do vendedor foi removida"] },
  { id: "checklist-bicicletas", category: "Bicicletas", name: "Inspeção — Bicicletas", items: ["Número do quadro registrado", "Quadro sem trincas ou soldas suspeitas", "Freios, relação, rodas e suspensão testados", "Origem/titularidade verificada"] },
  { id: "checklist-eletrodomesticos", category: "Eletrodomésticos", name: "Inspeção — Eletrodomésticos", items: ["Tensão elétrica confirmada", "Aparelho testado em ciclo completo", "Cabo, plugue e isolamento íntegros", "Ruídos, vazamentos e aquecimento anormal ausentes"] },
  { id: "checklist-ferramentas", category: "Ferramentas", name: "Inspeção — Ferramentas", items: ["Número de série e procedência verificados", "Ferramenta testada sob carga", "Proteções e travas funcionando", "Bateria e carregador avaliados"] },
];

const sources = [
  { id: "source-facebook", connectorId: "connector-facebook", name: "Facebook Marketplace", docs: "https://www.facebook.com/help/550954179351183/", auth: "NÃO_SUPORTADO", data: "Cadastro manual e abertura do link original", limits: "Nenhuma API pública de pesquisa confirmada", status: "NAO_SUPORTADO" },
  { id: "source-olx", connectorId: "connector-olx", name: "OLX", docs: "https://developers.olx.com.br/anuncio/api/home.html", auth: "OAUTH2", data: "Gestão dos próprios anúncios conforme plano e credenciais", limits: "Não usar como busca ampla de mercado", status: "INDISPONIVEL" },
  { id: "source-mercadolivre", connectorId: "connector-mercadolivre", name: "Mercado Livre", docs: "https://developers.mercadolivre.com.br/pt_br/api-docs-pt-br/", auth: "OAUTH2", data: "Itens e recursos autorizados pela API oficial", limits: "Endpoints e permissões precisam ser confirmados antes da ativação", status: "INDISPONIVEL" },
  { id: "source-fipe", connectorId: "connector-fipe", name: "Tabela FIPE", docs: "https://veiculos.fipe.org.br/", auth: "NENHUMA", data: "Digitação assistida da consulta pública para veículos", limits: "A FIPE declara que não fornece API oficial", status: "NAO_SUPORTADO" },
];

export function ensureReferenceData() {
  for (const item of checklists) db.insert(inspectionChecklists).values({ ...item, userId: null }).onConflictDoNothing().run();
  for (const item of sources) {
    db.insert(dataSources).values({ id: item.id, name: item.name, officialDocsUrl: item.docs, priceTypes: ["ANUNCIADO", "VENDA_CONFIRMADA"] }).onConflictDoNothing().run();
    db.insert(connectors).values({ id: item.connectorId, dataSourceId: item.id, authType: item.auth, availableData: item.data, limits: item.limits, status: item.status }).onConflictDoNothing().run();
  }
}
