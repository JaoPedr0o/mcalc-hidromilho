// Fórmulas do app. Substituem o Solver da planilha por solução direta.
// Convenção: 1 L de água = 1 kg. Umidades em % (0–100).

export const FAIXA_MIN = 30;
export const FAIXA_MAX = 40;
export const ALVO_IDEAL = 35;

/** Converte texto digitado (aceita vírgula) em número; NaN se inválido. */
export function parseNum(s: string): number {
  if (s == null) return NaN;
  const t = s.trim().replace(',', '.');
  if (t === '') return NaN;
  return Number(t);
}

/** Formata número com vírgula decimal. */
export function fmt(n: number, casas = 2): string {
  if (!isFinite(n)) return '—';
  return n.toFixed(casas).replace('.', ',');
}

export const umidadeParaMS = (u: number) => 100 - u;
export const msParaUmidade = (ms: number) => 100 - ms;

/** Água total (L) para levar `massa` kg de milho de umidade `uAtual` até `uAlvo`. */
export function calcAguaTotal(massa: number, uAtual: number, uAlvo: number): number {
  const msKg = (massa * (100 - uAtual)) / 100;
  return msKg / (1 - uAlvo / 100) - massa;
}

/** Umidade final (%) após adicionar `agua` L a `massa` kg de milho com umidade `uAtual`. */
export function calcUmidadeResultante(massa: number, uAtual: number, agua: number): number {
  const msKg = (massa * (100 - uAtual)) / 100;
  return 100 - (msKg * 100) / (massa + agua);
}

/** Litros de água por kg de milho. */
export function calcAguaPorKg(uAtual: number, uAlvo: number): number {
  return (1 - uAtual / 100) / (1 - uAlvo / 100) - 1;
}

/** Vazão de água (L/h) dada a vazão de milho (kg/h). */
export function calcVazaoAgua(vazaoMilhoKgH: number, uAtual: number, uAlvo: number): number {
  return vazaoMilhoKgH * calcAguaPorKg(uAtual, uAlvo);
}

/** Umidade resultante (%) com vazão de água real (L/h) e vazão de milho (kg/h). */
export function umidadePorVazao(vazaoMilhoKgH: number, vazaoAguaLH: number, uAtual: number): number {
  const w = vazaoAguaLH / vazaoMilhoKgH;
  return ((uAtual / 100 + w) / (1 + w)) * 100;
}

export type Status = 'ok' | 'atencao' | 'fora';

export function statusUmidade(u: number): Status {
  if (u < FAIXA_MIN || u > FAIXA_MAX) return 'fora';
  if (u < FAIXA_MIN + 2 || u > FAIXA_MAX - 2) return 'atencao';
  return 'ok';
}

/** Correção sugerida para uma umidade medida `uMed` num lote de `massaTotal` kg. */
export function sugerirCorrecao(
  massaTotal: number,
  uMed: number,
  uMilhoSeco: number,
  alvo = ALVO_IDEAL,
): { tipo: 'agua' | 'milho' | 'nenhuma'; quantidade: number } {
  if (Math.abs(uMed - alvo) < 0.05) return { tipo: 'nenhuma', quantidade: 0 };
  if (uMed < alvo) {
    // x L: (u*M + 100x)/(M + x) = alvo  (em %)
    return { tipo: 'agua', quantidade: (massaTotal * (alvo - uMed)) / (100 - alvo) };
  }
  // y kg de milho seco (umidade uMilhoSeco)
  return { tipo: 'milho', quantidade: (massaTotal * (uMed - alvo)) / (alvo - uMilhoSeco) };
}

/** Valida entradas de umidade; retorna mensagem de erro ou '' se válido. */
export function validarUmidades(uAtual: number, uAlvo: number): string {
  if (isNaN(uAtual) || uAtual < 0 || uAtual >= 100) return 'Umidade atual deve estar entre 0 e 100%.';
  if (isNaN(uAlvo) || uAlvo <= 0 || uAlvo >= 100) return 'Informe a umidade almejada.';
  if (uAlvo <= uAtual) return 'A umidade almejada deve ser maior que a atual.';
  return '';
}

export function validarLote(massa: number, uAtual: number, uAlvo: number): string {
  if (isNaN(massa) || massa <= 0) return 'Informe a massa de milho (kg).';
  return validarUmidades(uAtual, uAlvo);
}

export function validarVazao(vazao: number, uAtual: number, uAlvo: number): string {
  if (isNaN(vazao) || vazao <= 0) return 'Informe a vazão de milho da bazuca (veja o manual do equipamento).';
  return validarUmidades(uAtual, uAlvo);
}

/** Converte vazão digitada (kg/h ou t/h) para kg/h. */
export const vazaoParaKgH = (v: number, unidade: 'kg/h' | 't/h') => (unidade === 't/h' ? v * 1000 : v);

/** Texto de umidade <-> texto de MS (seletor Umidade/MS). Retorna '' se inválido. */
export function complementoTexto(txt: string): string {
  const v = parseNum(txt);
  return isNaN(v) ? '' : String(Number((100 - v).toFixed(4))).replace('.', ',');
}

/** CSV (separador ;, vírgula decimal) dos lotes registrados. */
export type LoteCsv = { data: string; massa: number; uInicial: number; agua: number; uCalc: number; uMed?: number };
export function gerarCSV(lotes: LoteCsv[]): string {
  const cab = 'data;massa_kg;umidade_inicial_%;agua_L;umidade_calculada_%;umidade_medida_%';
  const linhas = lotes.map((l) =>
    [l.data, l.massa, l.uInicial, l.agua, l.uCalc.toFixed(2), l.uMed ?? ''].join(';').replace(/\./g, ','),
  );
  return [cab, ...linhas].join('\n');
}


// ---------------------------------------------------------------------------------------------
// Cano de água. Valores típicos de PVC soldável (marrom): diâmetro externo nominal em mm e
// diâmetro INTERNO aproximado (parede padrão). Confira com o catálogo do cano que você tem.

export type Cano = { pol: string; dn: number; di: number };

export const CANOS: Cano[] = [
  { pol: '1/2"', dn: 20, di: 17.0 },
  { pol: '3/4"', dn: 25, di: 21.6 },
  { pol: '1"', dn: 32, di: 27.8 },
  { pol: '1 1/4"', dn: 40, di: 35.2 },
  { pol: '1 1/2"', dn: 50, di: 44.0 },
  { pol: '2"', dn: 60, di: 53.4 },
  { pol: '2 1/2"', dn: 75, di: 66.6 },
];

/** Velocidade máxima recomendada da água no cano (m/s). A NBR 5626 limita instalações prediais a 3 m/s. */
export const V_MAX_REC = 2.5;
export const V_MAX_ABS = 3.0;
/** Abaixo disto o registro fica "sensível demais" e o cano é grande demais para a vazão. */
export const V_MIN_REC = 0.4;

export const acharCano = (pol: string): Cano | undefined => CANOS.find((c) => c.pol === pol);

/** Velocidade (m/s) da água com vazão `qLmin` (L/min) num cano de diâmetro interno `diMm` (mm). */
export function velocidadeAgua(qLmin: number, diMm: number): number {
  const area = Math.PI * Math.pow(diMm / 2000, 2); // m²
  return qLmin / 60000 / area;
}

/** Vazão máxima (L/min) que o cano comporta na velocidade `vMax` (m/s). */
export function vazaoMaximaCano(diMm: number, vMax = V_MAX_REC): number {
  return vMax * Math.PI * Math.pow(diMm / 2000, 2) * 60000;
}

/** Menor cano (da lista) que leva `qLmin` sem passar de `vMax`. undefined se nenhum serve. */
export function menorCano(qLmin: number, vMax = V_MAX_REC): Cano | undefined {
  return CANOS.find((c) => velocidadeAgua(qLmin, c.di) <= vMax);
}

/** ok: 0,4 a 2,5 m/s · atenção: 2,5 a 3 m/s ou abaixo de 0,4 · fora: acima de 3 m/s. */
export function statusVelocidade(v: number): Status {
  if (v > V_MAX_ABS) return 'fora';
  if (v > V_MAX_REC || v < V_MIN_REC) return 'atencao';
  return 'ok';
}

export function textoVelocidade(v: number): string {
  if (v > V_MAX_ABS) return 'Rápida demais: o cano é pequeno para essa vazão';
  if (v > V_MAX_REC) return 'No limite: água muito rápida, perde pressão e faz barulho';
  if (v < V_MIN_REC) return 'Lenta: cano grande para essa vazão, o registro fica pouco sensível';
  return 'Boa para a vazão';
}

/** Conversões de vazão de milho (kg/h) mostradas no resumo. */
export const kgHParaKgMin = (kgH: number) => kgH / 60;
export const kgHParaKgS = (kgH: number) => kgH / 3600;
