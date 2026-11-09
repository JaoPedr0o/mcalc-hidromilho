import React from 'react';
import Svg, { Path, Defs, LinearGradient, Stop, G } from 'react-native-svg';
import { Coruja } from './Logo';
import M from './marca.json';
import L from './lockup.json';

// Logos completas: coruja + "Mcalc". O layout (tamanhos, posições, espaços) vem de lockup.json,
// gerado por scripts/gen-logos.js: é o mesmo das imagens em assets/logo/.
//   'mcalc'      → coruja + Mcalc grande
//   'hidramilho' → coruja + Mcalc + HIDRAMILHO (a usada no app)
const STOPS = M.wordmark.stops as [number, string][];

export function LogoMcalc({ altura = 72, variante = 'hidramilho' }: { altura?: number; variante?: 'mcalc' | 'hidramilho' }) {
  const lay = variante === 'mcalc' ? L.A : L.B;
  const larg = lay.W + 2 * L.pad, alt = lay.H + 2 * L.pad;
  const box = M.wordmark.box, p = lay.palavra;
  const sub = variante === 'hidramilho' ? L.B.sub : null;
  return (
    <Svg
      width={(altura * larg) / alt} height={altura} viewBox={`${-L.pad} ${-L.pad} ${larg} ${alt}`}
      accessibilityRole="image" accessibilityLabel={variante === 'mcalc' ? 'Mcalc' : 'Mcalc Hidramilho'}
    >
      <Defs>
        <LinearGradient id="mcalcDegrade" gradientUnits="userSpaceOnUse" x1={box.x} y1={0} x2={box.x + box.w} y2={0}>
          {STOPS.map(([o, c]) => <Stop key={o} offset={o} stopColor={c} />)}
        </LinearGradient>
      </Defs>
      <G transform={`translate(${-L.owl.x} ${-L.owl.y})`}>
        <Coruja normalizada={false} />
      </G>
      <G transform={`translate(${p.tx} ${p.ty}) scale(${p.s})`}>
        <Path d={M.wordmark.d} fill="url(#mcalcDegrade)" fillRule="evenodd" />
      </G>
      {sub && M.sub.glyphs.map((g, i) => (
        <Path key={i} transform={`translate(${sub.glyphX[i]} ${sub.base}) scale(${sub.u})`} d={g.d} fill={L.cor} />
      ))}
    </Svg>
  );
}
