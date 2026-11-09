import React from 'react';
import { Defs, LinearGradient, Stop, Path, Rect, Circle, G, Line, Text as T } from 'react-native-svg';
import { cores, fontes } from './theme';
import { Arte, Materiais, Grao, Gota } from './Esquema';

// Diagrama do processo real do grão úmido, em vista lateral e sem animação (leve):
// carreta → bazuca → moinho (preso ao trator) → água entra por uma mangueira na saída do moinho
// → milho molhado cai no bolsão (vala forrada de plástico, em corte).

const CHAO = 200;

function Pinturas() {
  return (
    <Defs>
      <LinearGradient id="prVermelho" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#D2493A" /><Stop offset="1" stopColor="#A12E22" /></LinearGradient>
      <LinearGradient id="prAzul" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#2F72BC" /><Stop offset="1" stopColor="#1B4F8C" /></LinearGradient>
      <LinearGradient id="prTubo" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#FBF7EC" /><Stop offset="0.5" stopColor="#E7DFCB" /><Stop offset="1" stopColor="#B8AE96" /></LinearGradient>
      <LinearGradient id="prFarelo" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#F0D283" /><Stop offset="1" stopColor="#CFA64A" /></LinearGradient>
      <LinearGradient id="prSolo" x1="0" y1="0" x2="0" y2="1"><Stop offset="0" stopColor="#EADFC2" /><Stop offset="1" stopColor="#D9C99F" /></LinearGradient>
    </Defs>
  );
}

/** Etiqueta branca; com `alvo`, uma linha até a peça. */
function Etiqueta({ x, y, texto, alvo }: { x: number; y: number; texto: string; alvo?: [number, number] }) {
  const w = 12 + texto.length * 5.3;
  return (
    <G>
      {alvo ? (
        <G>
          <Line x1={x + w / 2} y1={y + 8} x2={alvo[0]} y2={alvo[1]} stroke={cores.marinho} strokeWidth="1" opacity={0.7} />
          <Circle cx={alvo[0]} cy={alvo[1]} r="2.4" fill={cores.marinho} stroke="#fff" strokeWidth="1" />
        </G>
      ) : null}
      <Rect x={x} y={y} width={w} height="16" rx="8" fill="#fff" stroke="#C9D8DF" strokeWidth="1" />
      <T x={x + w / 2} y={y + 11.2} fontSize="9.4" fontFamily={fontes.bold} fill={cores.marinhoEscuro} textAnchor="middle">{texto}</T>
    </G>
  );
}

function Roda({ cx, cy, r, aro }: { cx: number; cy: number; r: number; aro: string }) {
  return (
    <G>
      <Circle cx={cx} cy={cy} r={r} fill="#232323" />
      <Circle cx={cx} cy={cy} r={r * 0.62} fill={aro} />
      <Circle cx={cx} cy={cy} r={r * 0.2} fill="#5A5A5A" />
    </G>
  );
}

type Props = { milho?: string; agua?: string; umid?: string };

export function EsquemaProcesso({ milho = 'Milho', agua = 'Água', umid = '30–40%' }: Props) {
  return (
    <Arte largura={360} altura={242} rotulo="Esquema: a carreta joga o milho pela bazuca no moinho preso ao trator; uma mangueira injeta a água na saída do moinho e o milho molhado cai no bolsão">
      <Materiais />
      <Pinturas />

      {/* chão */}
      <Rect x="0" y={CHAO} width="360" height="42" fill="url(#prSolo)" />
      <Rect x="0" y={CHAO} width="360" height="1.5" fill="#C9B88C" />

      {/* trator (atrás do bolsão) */}
      <G transform={`translate(206 ${CHAO})`}>
        <Path d="M56 -56 L104 -50 Q116 -48 118 -38 L118 -22 L56 -22 Z" fill="url(#prAzul)" stroke="#12335C" strokeWidth="1" strokeLinejoin="round" />
        <Rect x="6" y="-27" width="106" height="9" rx="3" fill="#13304F" />
        <Rect x="100" y="-74" width="3" height="26" fill="#2B2B2B" />
        <Roda cx={100} cy={-13} r={13} aro="#E08A1F" />
        <Rect x="14" y="-56" width="3" height="32" fill="#2A2A2A" /><Rect x="44" y="-56" width="3" height="32" fill="#2A2A2A" />
        <Rect x="6" y="-62" width="58" height="6" rx="2.5" fill="#ECEEEF" stroke="#BFC4C7" strokeWidth="0.8" />
        <Rect x="20" y="-38" width="16" height="8" rx="3" fill="#2D3A44" />
        <Path d="M0 -28 C0 -62 56 -62 56 -28 L50 -28 C50 -50 6 -50 6 -28 Z" fill="#17457F" />
        <Roda cx={28} cy={-26} r={26} aro="#E08A1F" />
      </G>

      {/* carreta com a carga de milho */}
      <Rect x="12" y="158" width="4" height="42" fill="#3A3A3A" />
      <Roda cx={46} cy={182} r={18} aro="#B9382A" />
      <Roda cx={74} cy={182} r={18} aro="#B9382A" />
      <Path d="M12 96 C 30 82 90 82 108 96 Z" fill="#E7BE48" />
      {[[34, 90], [52, 87], [70, 88], [88, 90], [60, 92]].map(([x, y], i) => <Grao key={i} x={x} y={y} r={i * 50} s={0.9} />)}
      <Path d="M8 96 L112 96 L112 128 L98 146 L26 146 L8 128 Z" fill="url(#prVermelho)" stroke="#7E2319" strokeWidth="1.4" strokeLinejoin="round" />
      <Rect x="5" y="93" width="110" height="6" rx="3" fill="#8E2A20" />
      <Rect x="6" y="146" width="108" height="8" rx="2" fill="#3A3A3A" />
      <Rect x="40" y="154" width="40" height="8" fill="#3A3A3A" />
      <T x="60" y="126" fontSize="13" fontFamily={fontes.bold} fill="#fff" opacity={0.85} textAnchor="middle" letterSpacing="1.5">CARRETA</T>

      {/* bazuca: tubo de descarga da carreta até o funil do moinho */}
      <G transform="translate(28 78) rotate(9.1)">
        <Rect x="-6" y="-9" width="18" height="18" rx="5" fill="#CFC6B2" stroke="#9A907B" strokeWidth="1" />
        <Rect x="0" y="-6" width="128" height="12" rx="6" fill="url(#prTubo)" stroke="#8F8670" strokeWidth="1.2" />
        {[34, 70, 104].map((x) => <Rect key={x} x={x} y="-7" width="5" height="14" rx="2" fill="#CBBFA6" stroke="#9A907B" strokeWidth="0.6" />)}
      </G>
      <Path d="M146 98 L158 100 L156 110 L148 108 Z" fill="#CFC6B2" stroke="#9A907B" strokeWidth="1" strokeLinejoin="round" />
      {[[152, 112, 20], [150, 120, 90]].map(([x, y, r], i) => <Grao key={i} x={x} y={y} r={r} s={0.7} />)}

      {/* moinho, preso ao trator por braços */}
      <Path d="M196 150 L214 174 M196 158 L214 180" stroke="#33444D" strokeWidth="3" strokeLinecap="round" />
      <Path d="M136 104 L202 104 L180 124 L158 124 Z" fill="url(#prVermelho)" stroke="#7E2319" strokeWidth="1.3" strokeLinejoin="round" />
      <Rect x="133" y="101" width="72" height="5" rx="2.5" fill="#8E2A20" />
      <Rect x="153" y="124" width="34" height="36" rx="3" fill="url(#prVermelho)" stroke="#7E2319" strokeWidth="1.3" />
      <Rect x="187" y="128" width="9" height="28" rx="2" fill="#E08A1F" stroke="#9A5A10" strokeWidth="1" />
      <Circle cx="170" cy="142" r="9.5" fill="#2C353C" stroke="#C9D1D6" strokeWidth="1.6" />
      <Path d="M170 134 V150 M162 142 H178" stroke="#C9D1D6" strokeWidth="2" strokeLinecap="round" />
      <Path d="M158 160 L182 160 L176 172 L164 172 Z" fill="#B9382A" stroke="#7E2319" strokeWidth="1.2" strokeLinejoin="round" />

      {/* bolsão: vala forrada de plástico, em corte, cheia de milho molhado */}
      <Path d={`M150 ${CHAO} C152 ${CHAO + 10} 158 ${CHAO + 14} 168 ${CHAO + 14} L332 ${CHAO + 14} C342 ${CHAO + 14} 348 ${CHAO + 10} 350 ${CHAO} Z`} fill="url(#prFarelo)" />
      <Path d={`M150 ${CHAO} C152 ${CHAO + 10} 158 ${CHAO + 14} 168 ${CHAO + 14} L332 ${CHAO + 14} C342 ${CHAO + 14} 348 ${CHAO + 10} 350 ${CHAO} Z`} fill="#8A5F1E" opacity={0.38} />
      <Path d={`M150 ${CHAO} C152 ${CHAO + 10} 158 ${CHAO + 14} 168 ${CHAO + 14} L332 ${CHAO + 14} C342 ${CHAO + 14} 348 ${CHAO + 10} 350 ${CHAO}`} fill="none" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      <Path d={`M150 ${CHAO} C158 ${CHAO - 8} 166 ${CHAO - 14} 174 ${CHAO - 14} C 188 ${CHAO - 14} 212 ${CHAO - 6} 246 ${CHAO - 4} C 290 ${CHAO - 3} 326 ${CHAO - 2} 346 ${CHAO} Z`} fill="url(#prFarelo)" />
      <Path d={`M150 ${CHAO} C158 ${CHAO - 8} 166 ${CHAO - 14} 174 ${CHAO - 14} C 188 ${CHAO - 14} 212 ${CHAO - 6} 246 ${CHAO - 4} C 290 ${CHAO - 3} 326 ${CHAO - 2} 346 ${CHAO} Z`} fill="#8A5F1E" opacity={0.3} />
      <Path d={`M142 ${CHAO} q8 -10 16 -2 M344 ${CHAO} q8 -10 14 -2`} stroke="#fff" strokeWidth="2.6" fill="none" strokeLinecap="round" />

      {/* mangueira de água: do chão até o bico de latão na saída do moinho, com registro */}
      <Path d={`M-4 ${CHAO - 8} H110 C126 ${CHAO - 8} 138 ${CHAO - 10} 146 ${CHAO - 20}`} stroke="#161616" strokeWidth="6.5" fill="none" strokeLinecap="round" />
      <Path d={`M-4 ${CHAO - 8} H110 C126 ${CHAO - 8} 138 ${CHAO - 10} 146 ${CHAO - 20}`} stroke="#7CC8F0" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeDasharray="5 8" opacity={0.9} />
      <Rect x="62" y={CHAO - 14} width="16" height="12" rx="3.5" fill="url(#latao)" stroke="#8B6A0E" strokeWidth="0.9" />
      <Rect x="68" y={CHAO - 24} width="4" height="10" rx="1.5" fill="#7B5E10" />
      <Rect x="58" y={CHAO - 29} width="22" height="5" rx="2.5" fill="#D93B2B" stroke="#8F1F14" strokeWidth="0.6" />
      <Path d={`M146 ${CHAO - 20} L161 ${CHAO - 28}`} stroke="#8B6A0E" strokeWidth="7" strokeLinecap="round" />
      <Path d={`M146 ${CHAO - 20} L161 ${CHAO - 28}`} stroke="url(#latao)" strokeWidth="4.6" strokeLinecap="round" />

      {/* água e milho moído caindo da saída */}
      <Path d={`M163 ${CHAO - 28} Q171 ${CHAO - 32} 175 ${CHAO - 20}`} stroke="#8FD0FF" strokeWidth="2" fill="none" strokeLinecap="round" />
      <Gota x={174} y={CHAO - 22} s={0.55} />
      <Gota x={178} y={CHAO - 31} s={0.45} />
      {[[172, 172, 20], [179, 176, 90], [175, 181, 140]].map(([x, y, r], i) => <Grao key={i} x={x} y={y + 2} r={r} s={0.62} molhado={i > 0} />)}

      {/* números */}
      <T x="8" y="15" fontSize="10" fontFamily={fontes.semibold} fill={cores.textoSuave}>Milho seco</T>
      <T x="8" y="29" fontSize="11.5" fontFamily={fontes.bold} fill={cores.texto}>{milho}</T>
      <T x="226" y="15" fontSize="10" fontFamily={fontes.semibold} fill={cores.agua}>Água</T>
      <T x="226" y="29" fontSize="11.5" fontFamily={fontes.bold} fill={cores.agua}>{agua}</T>

      {/* nomes */}
      <Etiqueta x={78} y={46} texto="Bazuca" alvo={[88, 86]} />
      <Etiqueta x={150} y={62} texto="Moinho" alvo={[170, 110]} />
      <Etiqueta x={2} y={218} texto="Registro" alvo={[70, CHAO - 5]} />
      <Etiqueta x={64} y={218} texto="Água entra aqui" alvo={[158, CHAO - 27]} />
      <Etiqueta x={218} y={222} texto={`Bolsão · umidade ${umid}`} alvo={[262, CHAO + 8]} />
    </Arte>
  );
}
