export type Recommendation = { label: "Excelente oportunidade" | "Boa oportunidade" | "Negociar" | "Alto risco" | "Não comprar" | "Dados insuficientes"; tone: string; reasons: string[] };

export function recommend(input: { comparableCount: number; confidence: string; roi: number; margin: number; riskLevel: string; repairRisk?: boolean; fraudRisk?: boolean }): Recommendation {
  const reasons: string[] = [];
  if (input.comparableCount < 3) return { label: "Dados insuficientes", tone: "slate", reasons: [`Apenas ${input.comparableCount} comparável(is); use pelo menos 3.`] };
  if (input.fraudRisk) return { label: "Não comprar", tone: "red", reasons: ["Há sinal crítico de possível fraude; verifique antes de avançar."] };
  if (input.riskLevel === "ALTO" || input.repairRisk) return { label: "Alto risco", tone: "orange", reasons: ["O risco informado pode consumir a margem projetada."] };
  reasons.push(`ROI provável de ${input.roi.toFixed(1)}%.`, `Margem provável de ${input.margin.toFixed(1)}%.`, `Confiança da amostra: ${input.confidence.toLowerCase()}.`);
  if (input.roi >= 40 && input.margin >= 25 && input.confidence !== "BAIXA") return { label: "Excelente oportunidade", tone: "green", reasons };
  if (input.roi >= 25 && input.margin >= 18) return { label: "Boa oportunidade", tone: "green", reasons };
  if (input.roi >= 10 && input.margin >= 8) return { label: "Negociar", tone: "yellow", reasons };
  return { label: "Não comprar", tone: "red", reasons: [...reasons, "O retorno não atinge uma margem de segurança razoável."] };
}
