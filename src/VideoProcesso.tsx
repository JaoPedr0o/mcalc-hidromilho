import React from 'react';
import { View, Text, Animated, AppState, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useVideoPlayer, VideoView } from 'expo-video';
import { cores, fontes } from './theme';

// Vídeo do processo (bazuca → moinho → água → bolsão). As legendas já estão gravadas no vídeo.
// Toca sozinho, em loop e sem som, fundido com o branco do cartão. A tela de vazão só monta este
// componente enquanto a aba está aberta, então o vídeo para ao trocar de aba; aqui ele também
// pausa quando o app vai para segundo plano.
const FONTE = require('../assets/processo-milho-app.mp4');
// O vídeo ocupa a largura do cartão e mostra quase todo o quadro (só corta ~9% da altura, que é margem vazia).
const PROPORCAO_CARTAO = 9 / 14.5;
const FADE = 56; // altura do degradê que funde o vídeo com o branco do cartão
const BRANCO = cores.card;
const BRANCO_MEIO = 'rgba(255,255,255,0.55)';
const BRANCO_0 = 'rgba(255,255,255,0)';
const SUAVE = 0.7; // segundos de fusão com o branco ao terminar e ao recomeçar, para o loop não dar corte

export function VideoProcesso() {
  const [veu] = React.useState(() => new Animated.Value(1)); // branco por cima do vídeo: 1 = tudo branco
  const player = useVideoPlayer(FONTE, (p) => {
    p.loop = true;
    p.muted = true;
    p.timeUpdateEventInterval = 0.05;
  });

  React.useEffect(() => {
    player.play();
    const estado = AppState.addEventListener('change', (e) => {
      if (e === 'active') player.play(); else player.pause();
    });
    // No começo o branco some devagar; perto do fim ele volta, e o recomeço entra de novo pelo branco.
    const tempo = player.addListener('timeUpdate', ({ currentTime }) => {
      const fim = player.duration - currentTime;
      const entrada = currentTime < SUAVE ? 1 - currentTime / SUAVE : 0;
      const saida = player.duration > 0 && fim < SUAVE ? 1 - fim / SUAVE : 0;
      veu.setValue(Math.max(entrada, saida));
    });
    return () => { estado.remove(); tempo.remove(); };
  }, [player, veu]);

  return (
    <View style={s.raiz}>
      <Text style={s.titulo}>Como funciona o processo</Text>
      <View style={s.cartao} accessibilityLabel="Vídeo do processo" accessibilityRole="image">
        <VideoView player={player} nativeControls={false} contentFit="cover" pointerEvents="none" style={StyleSheet.absoluteFill} />
        <LinearGradient colors={[BRANCO, BRANCO_MEIO, BRANCO_0]} locations={[0, 0.35, 1]} pointerEvents="none" style={[s.fade, { top: 0 }]} />
        <LinearGradient colors={[BRANCO_0, BRANCO_MEIO, BRANCO]} locations={[0, 0.65, 1]} pointerEvents="none" style={[s.fade, { bottom: 0 }]} />
        <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: BRANCO, opacity: veu }]} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  raiz: { alignItems: 'center', marginHorizontal: -20 }, // -20 anula o padding do Card para o vídeo ir de ponta a ponta
  titulo: { fontFamily: fontes.medium, fontSize: 13, color: cores.textoSuave, marginBottom: 8 },
  cartao: { alignSelf: 'stretch', aspectRatio: PROPORCAO_CARTAO, backgroundColor: BRANCO, overflow: 'hidden' },
  fade: { position: 'absolute', left: 0, right: 0, height: FADE },
});
