import { evaluatePriceGuide } from "@/lib/price-guide";
import { parseBRL } from "@/lib/money";

export type CapturedListing={title:string;priceCents:number;url:string|null;category:string;model:string|null};
export function parseBulkListings(text:string):CapturedListing[]{return text.split(/\r?\n/).map(line=>line.trim()).filter(Boolean).map((line,index)=>{const parts=line.split("|").map(p=>p.trim());if(parts.length<2)throw new Error(`Linha ${index+1}: use Título | Preço | Link`);const title=parts[0],priceCents=parseBRL(parts[1].replace(/^R\$\s*/,""));if(!title||priceCents<=0)throw new Error(`Linha ${index+1}: título ou preço inválido`);const url=parts[2]||null;if(url){try{new URL(url)}catch{throw new Error(`Linha ${index+1}: link inválido`)}}const guide=evaluatePriceGuide({title});return{title,priceCents,url,category:guide.reference?.category??"Outros",model:guide.reference?.model??null}})}
