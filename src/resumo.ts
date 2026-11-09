import { parseNum, fmt, validarLote, validarVazao, calcAguaTotal, vazaoParaKgH, calcVazaoAgua } from './calc';
import type { EstadoLote } from './TelaLote';
import type { EstadoVazao } from './TelaVazao';

const milhar = (n: number) => fmt(n, 0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/**
 * Texto do cálculo, pronto para mandar por WhatsApp ou mensagem.
 * `null` quando falta preencher o lote (massa e umidades). A parte da vazão só entra se estiver válida.
 */
export function montarResumo(lote: EstadoLote, vazao: EstadoVazao): string | null {
  const massa = parseNum(lote.massa), uAtual = parseNum(lote.uAtual), uAlvo = parseNum(lote.uAlvo);
  if (validarLote(massa, uAtual, uAlvo)) return null;
  const agua = calcAguaTotal(massa, uAtual, uAlvo);
  const linhas = [
    'Mcalc Hidramilho',
    '',
    `Lote: ${milhar(massa)} kg de milho`,
    `Umidade do milho: ${fmt(uAtual, 1)}% → almejada: ${fmt(uAlvo, 1)}%`,
    `Água a adicionar: ${fmt(agua, 1)} L (${fmt(agua / massa, 3)} L/kg)`,
  ];
  const vIn = parseNum(vazao.vazaoMilho);
  if (!validarVazao(vIn, uAtual, uAlvo)) {
    const kgH = vazaoParaKgH(vIn, vazao.unidade);
    linhas.push('', `Vazão de milho: ${milhar(kgH)} kg/h`, `Vazão de água: ${fmt(calcVazaoAgua(kgH, uAtual, uAlvo) / 60, 1)} L/min`);
  }
  return linhas.join('\n');
}
