"use server";

import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";
import { db } from "@/database/client";
import { auditLogs, opportunities } from "@/database/schema";
import { requireUser } from "@/lib/auth/session";

const MAX_SIZE = 1024 * 1024;
const splitCsvLine = (line: string) => { const values:string[]=[];let current="",quoted=false;for(let i=0;i<line.length;i++){const char=line[i];if(char==='"'&&line[i+1]==='"'){current+='"';i++}else if(char==='"')quoted=!quoted;else if(char===';'&&!quoted){values.push(current);current=""}else current+=char}values.push(current);return values };
const clean = (value: unknown, max=500) => String(value ?? "").trim().slice(0,max);
const integer = (value: unknown) => { const parsed=Number(value); return Number.isSafeInteger(parsed)&&parsed>=0?parsed:0 };

export async function importData(_: { error?: string; success?: string } | undefined, form: FormData) {
  const user=await requireUser(),file=form.get("file");
  if(!(file instanceof File)||file.size===0)return{error:"Selecione um arquivo CSV ou JSON."};
  if(file.size>MAX_SIZE)return{error:"O arquivo excede o limite de 1 MB."};
  const text=await file.text();let rows:Record<string,unknown>[]=[];
  try{
    if(file.name.toLowerCase().endsWith(".json")){const json=JSON.parse(text);if(json.format!=="briquego-export"||json.version!==1||!Array.isArray(json.opportunities))throw new Error("Formato JSON incompatível");rows=json.opportunities}
    else if(file.name.toLowerCase().endsWith(".csv")){const lines=text.replace(/^\uFEFF/,"").split(/\r?\n/).filter(Boolean);if(lines.length<2)throw new Error("CSV sem registros");const headers=splitCsvLine(lines[0]);rows=lines.slice(1).map(line=>Object.fromEntries(splitCsvLine(line).map((value,index)=>[headers[index],value])))}
    else throw new Error("Extensão não permitida");
  }catch(error){return{error:error instanceof Error?error.message:"Arquivo inválido"}}
  if(rows.length>500)return{error:"O limite é de 500 oportunidades por importação."};
  const now=new Date().toISOString();
  db.transaction((tx)=>{for(const row of rows){const exported="askingPriceCents" in row;const title=clean(exported?row.title:row.titulo,120),category=clean(exported?row.category:row.categoria,60),source=clean(exported?row.source:row.fonte,40),captured=clean(exported?row.capturedAt:row.data_captura,40);if(!title||!category||!source||Number.isNaN(Date.parse(captured)))throw new Error(`Registro inválido: ${title||"sem título"}`);const id=randomUUID();tx.insert(opportunities).values({id,userId:user.userId,title,originalUrl:clean(exported?row.originalUrl:row.url_original,500)||null,source,category,subcategory:clean(exported?row.subcategory:row.subcategoria,60)||null,brand:clean(exported?row.brand:row.marca,60)||null,model:clean(exported?row.model:row.modelo,80)||null,version:clean(exported?row.version:row.versao,80)||null,condition:clean(exported?row.condition:row.condicao,30)||"USADO_BOM",askingPriceCents:integer(exported?row.askingPriceCents:row.preco_pedido_centavos),negotiatedPriceCents:integer(exported?row.negotiatedPriceCents:row.preco_negociado_centavos)||null,city:clean(exported?row.city:row.cidade,80)||"Goiânia",neighborhood:clean(exported?row.neighborhood:row.bairro,80)||null,capturedAt:new Date(captured).toISOString(),notes:clean(exported?row.notes:row.observacoes,1000)||null,status:"EM_ANALISE",riskLevel:"MEDIO",expectedDaysToSell:30}).run();tx.insert(auditLogs).values({id:randomUUID(),userId:user.userId,entityType:"Opportunity",entityId:id,action:"IMPORT",afterJson:JSON.stringify({title,source}),occurredAt:now}).run()}});
  redirect("/oportunidades");
}
