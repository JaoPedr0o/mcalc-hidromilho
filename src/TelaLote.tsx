import React from 'react';
import {
  parseNum, fmt, validarLote, calcAguaTotal, calcUmidadeResultante, statusUmidade,
} from './calc';
import { Card, Campo, CampoUmidade, Resultado, Selo, Aviso, BarraFaixa } from './ui';

export type EstadoLote = { massa: string; uAtual: string; uAlvo: string };

export function TelaLote({ e, set }: { e: EstadoLote; set: (p: Partial<EstadoLote>) => void }) {
  const massa = parseNum(e.massa), uAtual = parseNum(e.uAtual), uAlvo = parseNum(e.uAlvo);

  const erro = validarLote(massa, uAtual, uAlvo);
  const ok = !erro;
  const agua = ok ? calcAguaTotal(massa, uAtual, uAlvo) : NaN;
  const verif = ok ? calcUmidadeResultante(massa, uAtual, agua) : NaN;

  return (
    <>
      <Card titulo="Dados do lote">
        <Campo label="Massa de milho moído" valor={e.massa} onChange={(v) => set({ massa: v })} sufixo="kg" />
        <CampoUmidade label="Umidade atual do milho" umidade={e.uAtual} onChange={(v) => set({ uAtual: v })} />
        <Campo label="Umidade almejada" valor={e.uAlvo} onChange={(v) => set({ uAlvo: v })} sufixo="%" dica="Faixa segura: 30% a 40%. 35% (meio da faixa) dá a mesma folga para os dois lados, por isso é um bom ponto de partida." />
      </Card>

      {erro ? <Aviso texto={erro} tipo="info" /> : null}

      {ok && (
        <Card titulo="Resultado">
          <Resultado destaque rotulo="Água a adicionar" valor={fmt(agua, 2)} unidade="litros" />
          <Resultado rotulo="Litros por kg de milho" valor={fmt(agua / massa, 3)} unidade="L/kg" />
          <Resultado rotulo="Umidade resultante (verificação)" valor={fmt(verif, 2)} unidade="%" />
          <Selo status={statusUmidade(uAlvo)} valor={uAlvo} />
          <BarraFaixa valor={uAlvo} />
        </Card>
      )}
    </>
  );
}
