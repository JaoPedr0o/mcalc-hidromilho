import React from 'react';
import { View } from 'react-native';
import Svg, {
  Defs, LinearGradient, RadialGradient, Stop, Path, Ellipse, G,
} from 'react-native-svg';

// IMPORTANTE (React Native): um <Svg width="100%"> sem altura fica com altura 0 e some na tela
// (na web aparece, no Expo Go não). Por isso toda arte vai dentro de uma View com aspectRatio e o
// Svg ocupa 100% dela.
export function Arte({ largura, altura, rotulo, children }: { largura: number; altura: number; rotulo: string; children: React.ReactNode }) {
  return (
    <View style={{ width: '100%', aspectRatio: largura / altura }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${largura} ${altura}`} accessibilityLabel={rotulo}>
        {children}
      </Svg>
    </View>
  );
}

const GRAO = 'M0 -5 C3.2 -5 4.8 -1.6 4.2 2 C3.7 4.4 1.8 5.6 0 5.6 C-1.8 5.6 -3.7 4.4 -4.2 2 C-4.8 -1.6 -3.2 -5 0 -5 Z';
const GOTA = 'M0 -7.5 C0 -7.5 -5.2 -1.2 -5.2 2.6 C-5.2 5.5 -2.9 7.8 0 7.8 C2.9 7.8 5.2 5.5 5.2 2.6 C5.2 -1.2 0 -7.5 0 -7.5 Z';

/** Materiais compartilhados pelos dois desenhos (gradientes de aço, PVC, milho e água). */
export function Materiais() {
  return (
    <Defs>
      <LinearGradient id="aco" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#F1F4F6" />
        <Stop offset="0.35" stopColor="#CBD3D9" />
        <Stop offset="1" stopColor="#7E8B95" />
      </LinearGradient>
      <LinearGradient id="acoEscuro" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#8C98A1" />
        <Stop offset="1" stopColor="#4A555E" />
      </LinearGradient>
      <LinearGradient id="motor" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#4FA36A" />
        <Stop offset="1" stopColor="#1F5A36" />
      </LinearGradient>
      <LinearGradient id="pvc" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#9FD7FF" />
        <Stop offset="0.4" stopColor="#3F9FE6" />
        <Stop offset="1" stopColor="#1B66A8" />
      </LinearGradient>
      <LinearGradient id="latao" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#F2D56B" />
        <Stop offset="1" stopColor="#A67C12" />
      </LinearGradient>
      <LinearGradient id="grao" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#FFF0AE" />
        <Stop offset="0.6" stopColor="#F7D154" />
        <Stop offset="1" stopColor="#DDB234" />
      </LinearGradient>
      <LinearGradient id="graoMolhado" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#F7DB7E" />
        <Stop offset="0.6" stopColor="#E4B53F" />
        <Stop offset="1" stopColor="#B98E27" />
      </LinearGradient>
      <LinearGradient id="monte" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#F0CB52" />
        <Stop offset="1" stopColor="#B58E22" />
      </LinearGradient>
      <LinearGradient id="agua" x1="0" y1="0" x2="1" y2="1">
        <Stop offset="0" stopColor="#B8E6FF" />
        <Stop offset="1" stopColor="#2A8FD0" />
      </LinearGradient>
      <LinearGradient id="concreto" x1="0" y1="0" x2="0" y2="1">
        <Stop offset="0" stopColor="#E7EAE5" />
        <Stop offset="1" stopColor="#C9CEC7" />
      </LinearGradient>
      <RadialGradient id="roda" cx="0.5" cy="0.5" r="0.5">
        <Stop offset="0" stopColor="#B7C0C7" />
        <Stop offset="0.45" stopColor="#6B7680" />
        <Stop offset="0.5" stopColor="#2B2F33" />
        <Stop offset="1" stopColor="#1B1D20" />
      </RadialGradient>
    </Defs>
  );
}

export function Grao({ x, y, r = 0, s = 1, molhado = false }: { x: number; y: number; r?: number; s?: number; molhado?: boolean }) {
  return (
    <G transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
      <Path d={GRAO} fill={molhado ? 'url(#graoMolhado)' : 'url(#grao)'} stroke={molhado ? '#9A7418' : '#B8901F'} strokeWidth={0.45} />
      <Ellipse cx={-1.3} cy={-2.2} rx={1.1} ry={1.9} fill="#FFFFFF" opacity={molhado ? 0.6 : 0.42} />
    </G>
  );
}

export function Gota({ x, y, s = 1, opacidade = 1 }: { x: number; y: number; s?: number; opacidade?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${s})`} opacity={opacidade}>
      <Path d={GOTA} fill="url(#agua)" stroke="#1F78B4" strokeWidth={0.6} />
      <Ellipse cx={-1.6} cy={1.2} rx={1} ry={2} fill="#FFFFFF" opacity={0.85} />
    </G>
  );
}
