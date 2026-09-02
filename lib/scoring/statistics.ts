export type ComparableSample = { priceCents: number; collectedAt: string; included: boolean; outlier?: boolean; priceType: string; condition: string };

const percentile = (sorted: number[], p: number) => {
  if (!sorted.length) return 0;
  const index = (sorted.length - 1) * p;
  const lower = Math.floor(index), upper = Math.ceil(index);
  return Math.round(sorted[lower] + (sorted[upper] - sorted[lower]) * (index - lower));
};

export function marketStatistics(samples: ComparableSample[], now = new Date()) {
  const selected = samples.filter((sample) => sample.included && !sample.outlier);
  const values = selected.map((sample) => sample.priceCents).sort((a, b) => a - b);
  const meanCents = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
  const variance = values.length ? values.reduce((total, value) => total + (value - meanCents) ** 2, 0) / values.length : 0;
  const averageAgeDays = selected.length ? selected.reduce((total, sample) => total + Math.max(0, (now.getTime() - new Date(sample.collectedAt).getTime()) / 86400000), 0) / selected.length : 0;
  const conditionCount = new Set(selected.map((s) => s.condition)).size;
  const priceTypeCount = new Set(selected.map((s) => s.priceType)).size;
  const confidence = values.length < 3 ? "BAIXA" : values.length >= 5 && averageAgeDays <= 30 && conditionCount === 1 && priceTypeCount === 1 ? "ALTA" : "MEDIA";
  return { count: values.length, minCents: values[0] ?? 0, maxCents: values.at(-1) ?? 0, meanCents, medianCents: percentile(values, .5), q1Cents: percentile(values, .25), q3Cents: percentile(values, .75), standardDeviationCents: Math.round(Math.sqrt(variance)), averageAgeDays: Math.round(averageAgeDays), confidence };
}

export function detectOutliers(prices: number[]) {
  const sorted = [...prices].sort((a, b) => a - b);
  const q1 = percentile(sorted, .25), q3 = percentile(sorted, .75), iqr = q3 - q1;
  return prices.map((price) => iqr > 0 && (price < q1 - 1.5 * iqr || price > q3 + 1.5 * iqr));
}
