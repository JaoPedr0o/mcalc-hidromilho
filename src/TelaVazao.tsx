import React from 'react';
import { Text, View, Pressable, StyleSheet } from 'react-native';
import {
  parseNum, fmt, validarVazao, vazaoParaKgH, calcAguaPorKg, calcVazaoAgua, umidadePorVazao, statusUmidade,
  CANOS, V_MAX_REC, acharCano, velocidadeAgua, vazaoMaximaCano, menorCano, statusVelocidade, textoVelocidade,
  kgHParaKgMin, kgHParaKgS,
} from './calc';
import { cores, fontes, raio } from './theme';
import { EsquemaProcesso } from './Processo';
import type { EstadoLote } from './TelaLote';
import { Card, Campo, CampoUmidade, Resultado, Selo, Aviso, corStatus, st } from './ui';

export type EstadoVazao = {
  vazaoMilho: string; unidade: 'kg/h' | 't/h'; vazaoReal: string;
  /** Bitola nominal do cano de água escolhida (ex.: 3/4"). Vazio = usar a recomendada. */
  canoPol: string;
};

const milhar = (n: number) => fmt(n, 0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

/** `lote` (massa e umidades) é compartilhado com a aba Lote: o que se digita lá já vale aqui. */
export function TelaVazao({ e, set, lote: comum, setLote }: {
  e: EstadoVazao; set: (p: Partial<EstadoVazao>) => void; lote: EstadoLote; setLote: (p: Partial<EstadoLote>) => void;
}) {
  const vIn = parseNum(e.vazaoMilho), uAtual = parseNum(comum.uAtual), uAlvo = parseNum(comum.uAlvo);
  const vKgH = vazaoParaKgH(vIn, e.unidade);

  const erro = validarVazao(vIn, uAtual, uAlvo);
  const ok = !erro;

  const porKg = ok ? calcAguaPorKg(uAtual, uAlvo) : NaN;
  const lh = ok ? calcVazaoAgua(vKgH, uAtual, uAlvo) : NaN;
  const lmin = lh / 60;
  const lote = parseNum(comum.massa); // massa do lote, da aba Lote
  const real = parseNum(e.vazaoReal); // L/min
  const uReal = ok && !isNaN(real) && real >= 0 ? umidadePorVazao(vKgH, real * 60, uAtual) : NaN;

  // Cano de água: o escolhido, ou o menor que comporta a vazão sem passar de 2,5 m/s.
  const recomendado = ok ? menorCano(lmin) : undefined;
  const escolhido = acharCano(e.canoPol) ?? recomendado;
  const vEsc = ok && escolhido ? velocidadeAgua(lmin, escolhido.di) : NaN;

  return (
    <>
      <Card titulo="1 · Milho (bazuca)" subtitulo="Quanto milho sai da rosca por hora">
        <Text style={st.label}>Unidade da vazão</Text>
        <View style={{ flexDirection: 'row', marginBottom: 14, gap: 8 }}>
          {(['kg/h', 't/h'] as const).map((u) => (
            <Pressable key={u} onPress={() => set({ unidade: u })} accessibilityRole="button"
              style={{ paddingVertical: 8, paddingHorizontal: 20, borderRadius: 999, borderWidth: 1.5,
                borderColor: e.unidade === u ? cores.marinho : cores.borda,
                backgroundColor: e.unidade === u ? cores.ceuClaro : cores.card }}>
              <Text style={{ fontFamily: fontes.bold, color: e.unidade === u ? cores.marinho : cores.textoSuave }}>{u}</Text>
            </Pressable>
          ))}
        </View>
        <Campo label="Vazão de milho na saída da bazuca" valor={e.vazaoMilho} onChange={(v) => set({ vazaoMilho: v })}
          sufixo={e.unidade} dica="Valor do manual da bazuca. Fica salvo para a próxima vez." />
      </Card>

      <Card titulo="Umidade do milho" subtitulo="Os mesmos valores da aba Lote">
        <CampoUmidade label="Umidade atual do milho" umidade={comum.uAtual} onChange={(v) => setLote({ uAtual: v })} />
        <Campo label="Umidade almejada" valor={comum.uAlvo} onChange={(v) => setLote({ uAlvo: v })} sufixo="%"
          dica="Faixa segura: 30% a 40%. 35% (meio da faixa) dá a mesma folga para os dois lados, por isso é um bom ponto de partida." />
      </Card>

      {erro ? <Aviso texto={erro} tipo="info" /> : null}

      {ok && (
        <>
          <Card titulo="Resumo: milho e água" subtitulo="As duas vazões que precisam andar juntas">
            <View style={s.duas}>
              <View style={[s.tile, { backgroundColor: cores.milhoClaro }]}>
                <Text style={s.tileRot}>Milho</Text>
                <Text style={[s.tileVal, { color: '#8A6C1C' }]}>{milhar(vKgH)}<Text style={s.tileUn}> kg/h</Text></Text>
                <Text style={s.tileSub}>{fmt(vKgH / 1000, 2)} t/h · {fmt(kgHParaKgMin(vKgH), 1)} kg/min · {fmt(kgHParaKgS(vKgH), 2)} kg/s</Text>
              </View>
              <View style={[s.tile, { backgroundColor: cores.aguaClaro }]}>
                <Text style={s.tileRot}>Água</Text>
                <Text style={[s.tileVal, { color: '#1F6FA0' }]}>{fmt(lmin, 1)}<Text style={s.tileUn}> L/min</Text></Text>
                <Text style={s.tileSub}>{fmt(lh, 0)} L/h · {fmt(lh / 3600, 3)} L/s</Text>
              </View>
            </View>
            <Resultado rotulo="Água por kg de milho" valor={fmt(porKg, 3)} unidade="L/kg" />
            {!isNaN(lote) && lote > 0 ? (
              <>
                <Resultado rotulo={`Tempo total de operação (${milhar(lote)} kg de milho)`} valor={fmt((lote / vKgH) * 60, 0)} unidade="min" />
                <Resultado rotulo="Volume total de água" valor={fmt(lote * porKg, 0)} unidade="L" />
              </>
            ) : (
              <Aviso tipo="info" texto="Informe a massa de milho na aba Lote para ver o tempo total e o volume de água do lote." />
            )}
          </Card>

          <Card titulo="2 · Água (cano)" subtitulo="Escolha a bitola do cano em polegadas. O app confere se a água passa folgada.">
            <View style={{ marginBottom: 4 }}>
              {CANOS.map((c) => {
                const v = velocidadeAgua(lmin, c.di);
                const stt = statusVelocidade(v);
                const sel = escolhido?.pol === c.pol;
                const rec = recomendado?.pol === c.pol;
                return (
                  <Pressable key={c.pol} onPress={() => set({ canoPol: c.pol })} accessibilityRole="button"
                    accessibilityState={{ selected: sel }}
                    accessibilityLabel={`Cano de ${c.pol}, velocidade ${fmt(v, 2)} metros por segundo`}
                    style={[s.linha, sel && s.linhaSel]}>
                    <View style={[s.bitola, sel && { backgroundColor: cores.marinho }]}>
                      <Text style={[s.bitolaTxt, sel && { color: '#fff' }]}>{c.pol}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={s.linhaTitulo}>PVC {c.dn} mm{rec ? '  ·  recomendado' : ''}</Text>
                      <Text style={s.linhaSub}>interno ≈ {fmt(c.di, 1)} mm · comporta até {fmt(vazaoMaximaCano(c.di), 0)} L/min</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[s.vel, { color: corStatus(stt) }]}>{fmt(v, 2)}</Text>
                      <Text style={s.velUn}>m/s</Text>
                    </View>
                    <View style={[s.bolinha, { backgroundColor: corStatus(stt) }]} />
                  </Pressable>
                );
              })}
            </View>
            <Text style={st.dica}>
              Valores típicos de PVC soldável. Confira o diâmetro interno do seu cano no catálogo. Velocidade ideal da água: de 0,4 a {fmt(V_MAX_REC, 1)} m/s.
            </Text>

            {escolhido && (
              <View style={{ marginTop: 14 }}>
                <Selo status={statusVelocidade(vEsc)} valor={vEsc} texto={`${fmt(vEsc, 2)} m/s no cano de ${escolhido.pol}`} />
                <Text style={[st.dica, { marginTop: 8 }]}>{textoVelocidade(vEsc)}.</Text>
              </View>
            )}
            {!recomendado && (
              <Aviso tipo="fora" texto={`Nenhum cano da lista comporta ${fmt(lmin, 1)} L/min com folga. Divida em dois ramais ou use um cano maior que 2 1/2".`} />
            )}
            {recomendado && escolhido && escolhido.di < recomendado.di && (
              <Aviso tipo="atencao" texto={`O cano de ${escolhido.pol} é pequeno para ${fmt(lmin, 1)} L/min. Use pelo menos ${recomendado.pol}.`} />
            )}

            <View style={{ marginTop: 16 }}>
              <EsquemaProcesso milho={`${e.unidade === 't/h' ? fmt(vIn, 1) : milhar(vIn)} ${e.unidade}`} agua={`${fmt(lmin, 1)} L/min`} umid={`${fmt(uAlvo, 0)}%`} />
              <Text style={st.dica}>
                A mangueira de água fica na saída do moinho, junto do milho moído. Regule o registro até a vazão medida chegar em {fmt(lmin, 1)} L/min.
              </Text>
            </View>
            <Aviso tipo="info" texto="Se a vazão de milho ou a umidade do milho mudar, recalcule a vazão de água." />
          </Card>

          <Card titulo="Conferir vazão real do cano">
            <Campo label="Vazão de água medida" valor={e.vazaoReal} onChange={(v) => set({ vazaoReal: v })} sufixo="L/min"
              dica="Meça enchendo um balde por um tempo conhecido." />
            {!isNaN(uReal) && (
              <>
                <Resultado rotulo="Umidade resultante com essa vazão" valor={fmt(uReal, 2)} unidade="%" />
                <Selo status={statusUmidade(uReal)} valor={uReal} />
                {escolhido && (
                  <Text style={[st.dica, { marginTop: 8 }]}>
                    Velocidade da água medida no cano de {escolhido.pol}: {fmt(velocidadeAgua(real, escolhido.di), 2)} m/s.
                  </Text>
                )}
              </>
            )}
          </Card>
        </>
      )}
    </>
  );
}

const s = StyleSheet.create({
  duas: { flexDirection: 'row', gap: 10, marginBottom: 6 },
  tile: { flex: 1, borderRadius: raio.lg, padding: 14 },
  tileRot: { fontFamily: fontes.medium, fontSize: 12, color: cores.textoSuave },
  tileVal: { fontFamily: fontes.bold, fontSize: 24, marginTop: 2 },
  tileUn: { fontFamily: fontes.medium, fontSize: 12 },
  tileSub: { fontFamily: fontes.regular, fontSize: 11, color: cores.textoSuave, marginTop: 4, lineHeight: 15 },
  linha: {
    flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, paddingHorizontal: 10,
    borderRadius: raio.md, borderWidth: 1.5, borderColor: 'transparent', marginBottom: 4,
  },
  linhaSel: { borderColor: cores.marinho, backgroundColor: cores.ceuClaro },
  bitola: { minWidth: 58, height: 34, borderRadius: 17, backgroundColor: cores.chip, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  bitolaTxt: { fontFamily: fontes.bold, fontSize: 15, color: cores.texto },
  linhaTitulo: { fontFamily: fontes.semibold, fontSize: 13, color: cores.texto },
  linhaSub: { fontFamily: fontes.regular, fontSize: 11, color: cores.textoFraco, marginTop: 1 },
  vel: { fontFamily: fontes.bold, fontSize: 16 },
  velUn: { fontFamily: fontes.regular, fontSize: 10, color: cores.textoFraco },
  bolinha: { width: 9, height: 9, borderRadius: 5 },
});
