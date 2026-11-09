import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, KeyboardAvoidingView, Keyboard, TextInput, Platform, Share } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import Feather from '@expo/vector-icons/Feather';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  useFonts, Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { cores, fontes, raio } from './src/theme';
import { LogoMcalc } from './src/LogoMcalc';
import { montarResumo } from './src/resumo';
import { Dialogo } from './src/Dialogo';
import { TelaLote, EstadoLote } from './src/TelaLote';
import { TelaVazao, EstadoVazao } from './src/TelaVazao';

const ABAS = [
  { id: 'lote', nome: 'Lote', icone: 'droplet' },
  { id: 'vazao', nome: 'Vazão', icone: 'sliders' },
] as const;
const CHAVE_VAZAO = 'hidramilho:vazaoMilho';

function Conteudo() {
  const insets = useSafeAreaInsets();
  const [aba, setAba] = React.useState<(typeof ABAS)[number]['id']>('lote');
  // Massa e umidades valem para as duas abas: o que for digitado em Lote já aparece em Vazão (e vice-versa).
  const [lote, setLote] = React.useState<EstadoLote>({ massa: '', uAtual: '12', uAlvo: '35' });
  const [vazao, setVazao] = React.useState<EstadoVazao>({
    vazaoMilho: '', unidade: 'kg/h', vazaoReal: '', canoPol: '',
  });
  const setL = (p: Partial<EstadoLote>) => setLote((s0) => ({ ...s0, ...p }));

  const [dialogo, setDialogo] = React.useState<null | 'limpar' | 'vazio'>(null);
  const compartilhar = async () => {
    const texto = montarResumo(lote, vazao);
    if (!texto) { setDialogo('vazio'); return; }
    try { await Share.share({ message: texto }); } catch { /* o usuário fechou a janela */ }
  };
  const limpar = () => {
    setLote({ massa: '', uAtual: '12', uAlvo: '35' });
    setVazao((s) => ({ ...s, vazaoReal: '' }));
    setDialogo(null);
  };

  // Teclado: o app usa a tela inteira no Android, então a janela não encolhe sozinha. O
  // KeyboardAvoidingView (abaixo) encolhe a área rolável; aqui rolamos até o campo em uso.
  const rolagem = React.useRef<React.ComponentRef<typeof ScrollView>>(null);
  const posicao = React.useRef(0);
  React.useEffect(() => {
    const sub = Keyboard.addListener(Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow', (ev) => {
      const campo = TextInput.State.currentlyFocusedInput();
      if (!campo) return;
      const topoTeclado = ev.endCoordinates.screenY;
      setTimeout(() => {
        campo.measureInWindow((_x, y, _w, altura) => {
          const falta = y + altura + 20 - topoTeclado; // quanto o campo fica escondido atrás do teclado
          if (falta > 0) rolagem.current?.scrollTo({ y: posicao.current + falta, animated: true });
        });
      }, 60);
    });
    return () => sub.remove();
  }, []);

  React.useEffect(() => {
    AsyncStorage.getItem(CHAVE_VAZAO).then((v) => { if (v) setVazao((s) => ({ ...s, ...JSON.parse(v) })); }).catch(() => {});
  }, []);

  const setV = (p: Partial<EstadoVazao>) => {
    setVazao((s) => {
      const n = { ...s, ...p };
      AsyncStorage.setItem(CHAVE_VAZAO, JSON.stringify({ vazaoMilho: n.vazaoMilho, unidade: n.unidade, canoPol: n.canoPol })).catch(() => {});
      return n;
    });
  };

  return (
    <View style={s.raiz}>
      <StatusBar style="dark" />
      <View style={[s.topo, { paddingTop: insets.top + 14 }]}>
        <View style={{ flex: 1 }}>
          <LogoMcalc altura={58} />
        </View>
        <Pressable onPress={compartilhar} accessibilityRole="button" accessibilityLabel="Compartilhar o resultado" hitSlop={6} style={s.acao}>
          <Feather name="share-2" size={17} color={cores.marinho} />
        </Pressable>
        <Pressable onPress={() => setDialogo('limpar')} accessibilityRole="button" accessibilityLabel="Limpar os valores" hitSlop={6} style={[s.acao, { marginLeft: 6 }]}>
          <Feather name="rotate-ccw" size={17} color={cores.marinho} />
        </Pressable>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          ref={rolagem} onScroll={(ev) => { posicao.current = ev.nativeEvent.contentOffset.y; }} scrollEventThrottle={16}
          contentContainerStyle={{ padding: 16, paddingTop: 20, paddingBottom: 32 }} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
        >
          {aba === 'lote' && <TelaLote e={lote} set={setL} />}
          {aba === 'vazao' && <TelaVazao e={vazao} set={setV} lote={lote} setLote={setL} />}
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[s.barra, { paddingBottom: Math.max(insets.bottom, 8) }]}>
        {ABAS.map((a) => {
          const ativa = aba === a.id;
          const cor = ativa ? cores.marinho : cores.aba;
          return (
            <Pressable key={a.id} onPress={() => setAba(a.id)} accessibilityRole="tab"
              accessibilityState={{ selected: ativa }} accessibilityLabel={a.nome} style={s.aba}>
              <View style={[s.pilula, ativa && { backgroundColor: cores.ceuClaro }]}>
                <Feather name={a.icone} size={22} color={cor} />
              </View>
              <Text style={[s.abaTxt, { color: cor, fontFamily: ativa ? fontes.semibold : fontes.regular }]}>{a.nome}</Text>
            </Pressable>
          );
        })}
      </View>

      <Dialogo
        visivel={dialogo === 'limpar'} icone="rotate-ccw" titulo="Limpar os valores?"
        texto="A massa, as umidades e a vazão de água medida voltam ao padrão."
        confirmar="Limpar" aoConfirmar={limpar} aoCancelar={() => setDialogo(null)}
      />
      <Dialogo
        visivel={dialogo === 'vazio'} icone="share-2" titulo="Nada para compartilhar"
        texto="Preencha a massa de milho e as umidades na aba Lote."
        confirmar="Entendi" aoConfirmar={() => setDialogo(null)}
      />
    </View>
  );
}

export default function App() {
  const [ok, erro] = useFonts({
    Outfit_400Regular, Outfit_500Medium, Outfit_600SemiBold, Outfit_700Bold,
  });
  if (!ok && !erro) return null;
  return (
    <SafeAreaProvider>
      <Conteudo />
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  raiz: { flex: 1, backgroundColor: cores.fundo },
  topo: {
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 22,
    borderBottomLeftRadius: raio.xxl, borderBottomRightRadius: raio.xxl,
    backgroundColor: '#FFFFFF', boxShadow: '0px 6px 18px rgba(31,50,57,0.10)', zIndex: 1,
  },
  acao: { width: 34, height: 34, borderRadius: 17, backgroundColor: cores.ceuClaro, alignItems: 'center', justifyContent: 'center' },
  barra: { flexDirection: 'row', backgroundColor: cores.card, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 6 },
  aba: { flex: 1, alignItems: 'center' },
  pilula: { width: 68, height: 34, borderRadius: 17, overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
  abaTxt: { fontSize: 11, marginTop: 2 },
});
