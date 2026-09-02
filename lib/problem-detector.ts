export type DetectedProblem={severity:"CRITICO"|"ALTO"|"MEDIO";label:string;match:string};
const rules:[RegExp,DetectedProblem["severity"],string][]=[
  [/chip\s*off/i,"CRITICO","Chip off"],[/bloquead[oa]/i,"CRITICO","Aparelho bloqueado"],[/sem\s+leitor|leitor\s+(?:com\s+)?defeito/i,"CRITICO","Leitor ausente ou com defeito"],
  [/n[aã]o\s+liga|parou\s+de\s+ligar/i,"ALTO","Não liga"],[/tela\s+trocada/i,"ALTO","Tela trocada"],[/bateria\s+trocada/i,"MEDIO","Bateria trocada"],[/bateria\D{0,15}(\d{2})\s*%/i,"MEDIO","Saúde da bateria informada"],
  [/trincad[oa]|quebrad[oa]/i,"ALTO","Dano físico"],[/sem\s+nota/i,"MEDIO","Sem nota fiscal"],[/conta\s+(?:icloud|google|psn|xbox)/i,"ALTO","Conta ainda vinculada"],
];
export function detectProblems(...values:Array<string|null|undefined>):DetectedProblem[]{const text=values.filter(Boolean).join(" ");return rules.flatMap(([regex,severity,label])=>{const match=text.match(regex);return match?[{severity,label,match:match[0]}]:[]})}
