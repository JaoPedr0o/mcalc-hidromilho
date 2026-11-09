import React from 'react';
import Svg, { Rect, Path, Circle, G, Polygon, Defs, LinearGradient, Stop } from 'react-native-svg';
import { cores } from './theme';
import C from './coruja.json';

// Coruja da marca Mcalc: traço escuro, bico e pés azul-céu, olhos com íris e pupila.
// A geometria fica em coruja.json (coordenadas do logotipo) e também alimenta scripts/lib/coruja-svg.js.

export function Coruja({
  cor, ceu = cores.ceu, corpo = '#F3F9FC', barriga, preencher = true, normalizada = true,
}: { cor?: string; ceu?: string; corpo?: string; barriga?: string; preencher?: boolean; normalizada?: boolean }) {
  const W = C.traco;
  // Sem `cor`, o escuro usa um degradê sutil (de azul-aço, em cima, ao escuro, embaixo), como na logo.
  const escuro = cor ?? 'url(#corujaDegrade)';
  const pupila = cor ?? cores.marinho;
  const g = C.degrade;
  return (
    // `normalizada`: encaixa o desenho na caixa 0..100 (para ícones). Sem isso, usa as coordenadas originais.
    <G transform={normalizada ? 'translate(-2.5 -7) scale(0.125)' : undefined} fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Defs>
        <LinearGradient id="corujaDegrade" gradientUnits="userSpaceOnUse" x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2}>
          <Stop offset="0" stopColor={g.de} />
          <Stop offset="1" stopColor={g.ate} />
        </LinearGradient>
      </Defs>
      {preencher && <Path d={C.miolo} fill={corpo} stroke="none" />}
      {preencher && <Path d={C.barriga} fill={barriga ?? escuro} stroke="none" />}
      <Path d={C.testeira} stroke={escuro} strokeWidth={W} />
      <Path d={C.corpo} stroke={escuro} strokeWidth={W} />
      {C.olhos.map(([x, y]) => (
        <G key={x}>
          <Circle cx={x} cy={y} r={C.raioOlho} stroke={escuro} strokeWidth={W} fill={preencher ? '#FFFFFF' : 'none'} />
          {preencher && <Circle cx={x} cy={y + 6} r={C.raioIris} fill={ceu} stroke="none" />}
          {preencher && <Circle cx={x} cy={y + 6} r={C.raioPupila} fill={pupila} stroke="none" />}
          {preencher && <Circle cx={x - 16} cy={y - 12} r={C.raioBrilho} fill="#FFFFFF" stroke="none" />}
        </G>
      ))}
      <Path d={C.barrigaE} stroke={escuro} strokeWidth={W} />
      <Path d={C.barrigaD} stroke={escuro} strokeWidth={W} />
      <Polygon points={C.bico} stroke={ceu} strokeWidth={C.tracoBico} fill={preencher ? ceu : 'none'} />
      {preencher && <Polygon points={C.bicoMiolo} fill="#FFFFFF" stroke="none" />}
    </G>
  );
}

export function Logo({ size = 64, fundo = true }: { size?: number; fundo?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {fundo && <Rect x="0" y="0" width="100" height="100" rx="24" fill="#FFFFFF" />}
      <G transform={fundo ? 'translate(11 11) scale(0.78)' : undefined}>
        <Coruja />
      </G>
    </Svg>
  );
}
