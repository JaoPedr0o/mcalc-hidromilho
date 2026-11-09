import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cores, fontes, raio, sombra } from './theme';
import { Status, parseNum, fmt, complementoTexto } from './calc';

export const corStatus = (s: Status) => (s === 'ok' ? cores.ok : s === 'atencao' ? cores.atencao : cores.fora);
export const textoStatus = (s: Status) =>
  s === 'ok' ? 'Dentro da faixa' : s === 'atencao' ? 'Perto do limite' : 'Fora da faixa (30–40%)';

export function Card({ children, titulo, subtitulo }: { children: React.ReactNode; titulo?: string; subtitulo?: string }) {
  return (
    <View style={st.card}>
      {titulo ? <Text style={st.cardTitulo}>{titulo}</Text> : null}
      {subtitulo ? <Text style={st.cardSub}>{subtitulo}</Text> : null}
      {children}
    </View>
  );
}

export function Campo({
  label, valor, onChange, sufixo, dica,
}: { label: string; valor: string; onChange: (v: string) => void; sufixo?: string; dica?: string }) {
  const [foco, setFoco] = React.useState(false);
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={st.label}>{label}</Text>
      <View style={[st.inputRow, foco && { borderColor: cores.marinho }]}>
        <TextInput
          style={st.input}
          value={valor}
          onChangeText={onChange}
          onFocus={() => setFoco(true)}
          onBlur={() => setFoco(false)}
          keyboardType="decimal-pad"
          accessibilityLabel={label}
          placeholderTextColor={cores.textoFraco}
        />
        {sufixo ? <Text style={st.sufixo}>{sufixo}</Text> : null}
      </View>
      {dica ? <Text style={st.dica}>{dica}</Text> : null}
    </View>
  );
}

/** Campo de umidade com alternância Umidade / MS. O estado guardado é sempre a UMIDADE. */
export function CampoUmidade({
  label, umidade, onChange, dica,
}: { label: string; umidade: string; onChange: (u: string) => void; dica?: string }) {
  const [modoMS, setModoMS] = React.useState(false);
  const u = parseNum(umidade);
  const mostrado = modoMS ? complementoTexto(umidade) : umidade;
  const alterar = (txt: string) => (modoMS ? onChange(complementoTexto(txt)) : onChange(txt));
  return (
    <View>
      <Campo
        label={modoMS ? `${label} (como matéria seca)` : label}
        valor={mostrado}
        onChange={alterar}
        sufixo="%"
        dica={dica ?? (isNaN(u) ? undefined : modoMS ? `Umidade = ${fmt(u, 1)}%` : `Matéria seca = ${fmt(100 - u, 1)}%`)}
      />
      <Pressable onPress={() => setModoMS(!modoMS)} style={st.alterna} accessibilityRole="button">
        <Text style={st.alternaTxt}>{modoMS ? 'Digitar como umidade' : 'Digitar como matéria seca (MS)'}</Text>
      </Pressable>
    </View>
  );
}

export function Resultado({ rotulo, valor, unidade, destaque }: { rotulo: string; valor: string; unidade?: string; destaque?: boolean }) {
  if (destaque) {
    return (
      <LinearGradient colors={['#4B8FB0', cores.marinho]} start={{ x: 0.1, y: 0 }} end={{ x: 0.9, y: 1 }} style={st.resDestaque}>
        <Text style={st.resRotuloD}>{rotulo}</Text>
        <Text style={st.resValorD}>
          {valor}
          {unidade ? <Text style={st.resUnD}> {unidade}</Text> : null}
        </Text>
      </LinearGradient>
    );
  }
  return (
    <View style={st.res}>
      <Text style={st.resRotulo}>{rotulo}</Text>
      <Text style={st.resValor}>
        {valor}
        {unidade ? <Text style={st.resUn}> {unidade}</Text> : null}
      </Text>
    </View>
  );
}

/** `texto` troca a frase padrão (umidade em %) por outra, ex.: velocidade da água em m/s. */
export function Selo({ status, valor, texto }: { status: Status; valor: number; texto?: string }) {
  const c = corStatus(status);
  return (
    <View style={[st.selo, { backgroundColor: c + '18' }]}>
      <View style={[st.bolinha, { backgroundColor: c }]} />
      <Text style={[st.seloTxt, { color: c }]}>{texto ?? `${fmt(valor, 1)}% · ${textoStatus(status)}`}</Text>
    </View>
  );
}

/** `info` = dica neutra (azul da marca); os demais tipos são alertas de status. */
export function Aviso({ texto, tipo = 'fora' }: { texto: string; tipo?: Status | 'info' }) {
  const c = tipo === 'info' ? cores.info : corStatus(tipo);
  return (
    <View style={[st.aviso, { backgroundColor: c + '14' }]}>
      <Text style={{ color: c, fontFamily: fontes.medium, fontSize: 14, lineHeight: 20 }}>{texto}</Text>
    </View>
  );
}

export function Botao({ texto, onPress, secundario }: { texto: string; onPress: () => void; secundario?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [st.botao, secundario && st.botaoSec, pressed && { opacity: 0.85 }]}
    >
      <Text style={[st.botaoTxt, secundario && { color: cores.marinho }]}>{texto}</Text>
    </Pressable>
  );
}

/** Barra 20–50% com a faixa segura destacada e marcador da umidade. */
export function BarraFaixa({ valor }: { valor: number }) {
  const min = 20, max = 50;
  const pos = (v: number) => `${Math.max(0, Math.min(100, ((v - min) / (max - min)) * 100))}%` as const;
  return (
    <View style={{ marginTop: 14 }}>
      <View style={st.barra}>
        <View style={[st.faixa, { left: pos(30), width: `${((40 - 30) / (max - min)) * 100}%` }]} />
        {!isNaN(valor) && <View style={[st.marca, { left: pos(valor) }]} />}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <Text style={st.dica}>20%</Text>
        <Text style={[st.dica, { color: cores.marinho }]}>faixa segura 30–40%</Text>
        <Text style={st.dica}>50%</Text>
      </View>
    </View>
  );
}

export const st = StyleSheet.create({
  card: { backgroundColor: cores.card, borderRadius: raio.xl, padding: 20, marginBottom: 16, boxShadow: sombra },
  cardTitulo: { fontFamily: fontes.bold, fontSize: 18, color: cores.marinho, marginBottom: 4 },
  cardSub: { fontFamily: fontes.regular, fontSize: 13, color: cores.textoFraco, marginBottom: 14 },
  label: { fontFamily: fontes.medium, fontSize: 13, color: cores.textoSuave, marginBottom: 7 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: cores.campo, borderRadius: raio.md,
    borderWidth: 1.5, borderColor: cores.borda, paddingHorizontal: 16,
  },
  input: { flex: 1, minWidth: 0, minHeight: 54, fontFamily: fontes.semibold, fontSize: 20, color: cores.texto, paddingVertical: 10 },
  sufixo: { fontFamily: fontes.medium, fontSize: 15, color: cores.textoFraco, marginLeft: 8 },
  dica: { fontFamily: fontes.regular, fontSize: 12, color: cores.textoFraco, marginTop: 5, lineHeight: 17 },
  alterna: { alignSelf: 'flex-start', marginTop: -8, marginBottom: 16, paddingVertical: 6 },
  alternaTxt: { fontFamily: fontes.medium, color: cores.marinho, fontSize: 13 },
  res: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: cores.chip },
  resRotulo: { fontFamily: fontes.regular, fontSize: 13, color: cores.textoSuave },
  resValor: { fontFamily: fontes.semibold, fontSize: 22, color: cores.texto, marginTop: 2 },
  resUn: { fontFamily: fontes.regular, fontSize: 14, color: cores.textoFraco },
  resDestaque: { borderRadius: raio.xl, padding: 22, marginBottom: 8 },
  resRotuloD: { fontFamily: fontes.medium, fontSize: 13, color: 'rgba(255,255,255,0.75)' },
  resValorD: { fontFamily: fontes.display, fontSize: 46, color: '#FFFFFF', marginTop: 2 },
  resUnD: { fontFamily: fontes.medium, fontSize: 16, color: 'rgba(255,255,255,0.75)' },
  selo: { flexDirection: 'row', alignItems: 'center', borderRadius: raio.pilula, paddingVertical: 8, paddingHorizontal: 14, alignSelf: 'flex-start', marginTop: 12 },
  bolinha: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },
  seloTxt: { fontFamily: fontes.semibold, fontSize: 13 },
  aviso: { borderRadius: raio.lg, padding: 14, marginTop: 12, marginBottom: 4 },
  botao: { minHeight: 56, backgroundColor: cores.marinho, borderRadius: raio.lg, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  botaoSec: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: cores.bordaForte },
  botaoTxt: { fontFamily: fontes.semibold, color: '#fff', fontSize: 16 },
  barra: { height: 12, borderRadius: 6, backgroundColor: cores.trilho, overflow: 'hidden' },
  faixa: { position: 'absolute', top: 0, bottom: 0, backgroundColor: cores.destaque + '88' },
  marca: { position: 'absolute', top: 0, bottom: 0, width: 5, marginLeft: -2.5, borderRadius: 3, backgroundColor: cores.marinhoEscuro },
});
