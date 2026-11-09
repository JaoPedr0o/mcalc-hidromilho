// Gera as duas logos (npm run logos):
//   assets/logo/mcalc.svg             coruja + "Mcalc" grande
//   assets/logo/mcalc-hidramilho.svg  coruja + "Mcalc" + "HIDRAMILHO" (a usada no app)
// e grava src/lockup.json, com o layout calculado, que o app (src/LogoMcalc.tsx) usa igualzinho.
// Entradas: src/coruja.json (desenho), src/marca.json (letras vetorizadas do "Mcalc" e fonte do subtítulo).
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const { coruja } = require('./lib/coruja-svg');
const M = require('../src/marca.json');

const COR_SUB = '#447B94';
const OUT = path.join(__dirname, '..', 'assets', 'logo');

// Proporções (em fração da altura H da coruja). A haste da fonte do "Mcalc" é ~23% da altura da maiúscula;
// o traço da coruja fica na casa de 50–60% da haste, o que equilibra o peso entre desenho e nome.
const PROP = {
  A: { palavra: 0.58 },                      // só coruja + Mcalc: nome grande
  B: { palavra: 0.46, capSub: 0.125, folga: 0.08 }, // com HIDRAMILHO por baixo
  espaco: 0.12,                              // coruja ↔ palavra
  margem: 0.05,
};
// Medidas do desenho original do "Mcalc" (unidades do traço vetorizado). topoL/baseLetras/centroM são relativas ao topo da caixa; extX0 é a borda do M em coordenadas da caixa.
const MED = { topoL: 4, baseLetras: 602, centroM: 321, extX0: 68, extW: 2377 };

async function medirCoruja() {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 900" width="900" height="900">${coruja()}</svg>`;
  const { data, info } = await sharp(Buffer.from(svg)).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  let x0 = 1e9, y0 = 1e9, x1 = -1, y1 = -1;
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    if (data[(y * info.width + x) * 4 + 3] > 8) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  }
  return { x: x0, y: y0, w: x1 - x0 + 1, h: y1 - y0 + 1 };
}

const r = (n) => Math.round(n * 100) / 100;

(async () => {
  const ob = await medirCoruja();
  const H = ob.h, box = M.wordmark.box, pad = PROP.margem * H, cy = ob.h / 2; // origem: canto da caixa da coruja
  const gap = PROP.espaco * H;

  // ---- A: coruja + Mcalc
  const sA = (PROP.A.palavra * H) / box.h;
  const wA = box.w * sA;
  const A = {
    W: r(ob.w + gap + wA), H: r(H),
    palavra: { s: sA, tx: r(ob.w + gap - box.x * sA), ty: r(cy - (MED.centroM + box.y) * sA) },
  };
  // (o centro do M, em coordenadas da caixa, é MED.centroM; como o desenho é posicionado pela caixa, corrige-se box.y)
  A.palavra.ty = r(cy - MED.centroM * sA - 0 * box.y);
  A.palavra.ty = r(cy - MED.centroM * sA);

  // ---- B: coruja + Mcalc + HIDRAMILHO
  const sB = (PROP.B.palavra * H) / box.h;
  const wB = box.w * sB;
  const ext = MED.extW * sB;
  const ch = PROP.B.capSub * H;
  const u = ch / M.sub.capH; // unidades da fonte -> unidades do desenho
  // Folgas internas (side bearings) da primeira e da última letra, para alinhar a tinta às bordas do "Mcalc".
  // x de todos os pontos do contorno (comandos absolutos M/L/Q/C/Z, sempre em pares x y)
  const xs = (d) => (d.match(/-?\d*\.?\d+(?:e-?\d+)?/g) || []).map(Number).filter((_, i) => i % 2 === 0);
  const gs = M.sub.glyphs;
  const lsb = Math.min(...xs(gs[0].d)) * u;
  const rsb = (gs[gs.length - 1].adv - Math.max(...xs(gs[gs.length - 1].d))) * u;
  const natural = gs.reduce((s, g) => s + g.adv * u, 0) - lsb - rsb;
  const sp = (ext - natural) / (gs.length - 1);
  const pilha = (MED.baseLetras - MED.topoL) * sB + PROP.B.folga * H + ch;
  const topoPilha = cy - pilha / 2;
  const tyB = topoPilha - MED.topoL * sB;
  const baseLinha = topoPilha + (MED.baseLetras - MED.topoL) * sB + PROP.B.folga * H + ch;
  const txB = ob.w + gap - box.x * sB;
  const x0Sub = txB + MED.extX0 * sB - lsb; // tinta do H alinhada à borda esquerda do M
  let cx = x0Sub;
  const glyphX = M.sub.glyphs.map((g) => { const x = cx; cx += g.adv * u + sp; return r(x); });
  const B = {
    W: r(ob.w + gap + wB), H: r(H),
    palavra: { s: sB, tx: r(txB), ty: r(tyB) },
    sub: { u, base: r(baseLinha), glyphX },
  };

  const lockup = { owl: ob, pad: r(pad), cor: COR_SUB, A, B };
  fs.writeFileSync(path.join(__dirname, '..', 'src', 'lockup.json'), JSON.stringify(lockup, null, 2));

  const grad = `<linearGradient id="g" gradientUnits="userSpaceOnUse" x1="${box.x}" y1="0" x2="${box.x + box.w}" y2="0">${M.wordmark.stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</linearGradient>`;
  const palavra = (p) => `<g transform="translate(${p.tx} ${p.ty}) scale(${p.s})"><path d="${M.wordmark.d}" fill="url(#g)" fill-rule="evenodd"/></g>`;
  const doc = (L, miolo) =>
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${r(-pad)} ${r(-pad)} ${r(L.W + 2 * pad)} ${r(L.H + 2 * pad)}" width="${Math.round((L.W + 2 * pad) / 2)}" height="${Math.round((L.H + 2 * pad) / 2)}">
  <defs>${grad}</defs>
  <g transform="translate(${-ob.x} ${-ob.y})">${coruja()}</g>
  ${miolo}
</svg>
`;
  const sub = M.sub.glyphs.map((g, i) => `<path transform="translate(${B.sub.glyphX[i]} ${B.sub.base}) scale(${B.sub.u})" d="${g.d}" fill="${COR_SUB}"/>`).join('\n  ');

  fs.mkdirSync(OUT, { recursive: true });
  const svgA = doc(A, palavra(A.palavra));
  const svgB = doc(B, palavra(B.palavra) + '\n  ' + sub);
  fs.writeFileSync(path.join(OUT, 'mcalc.svg'), svgA);
  fs.writeFileSync(path.join(OUT, 'mcalc-hidramilho.svg'), svgB);
  await sharp(Buffer.from(svgA), { density: 220 }).flatten({ background: '#fff' }).png().toFile(path.join(OUT, 'mcalc.png'));
  await sharp(Buffer.from(svgB), { density: 220 }).flatten({ background: '#fff' }).png().toFile(path.join(OUT, 'mcalc-hidramilho.png'));
  console.log('ok', JSON.stringify({ owl: ob, A: A.W + 'x' + A.H, B: B.W + 'x' + B.H, espacamentoLetrasSub: r(sp) }));
})();
