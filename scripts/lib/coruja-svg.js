// Desenho da coruja em SVG (string), compartilhado por gen-icons.js e gen-logos.js.
// A geometria vem de src/coruja.json (a mesma de src/Logo.tsx).
const P = require('../../src/coruja.json');

const MARINHO = '#1F3239';
const CEU = '#66BCE2';
const CORPO = '#F3F9FC';
const DEG = 'url(#corujaDegrade)'; // degradê sutil do escuro (traço e barriga)
const BARRIGA = DEG;

/** Coruja nas coordenadas do JSON (sem transformação). `mono` = tudo preto e sem preenchimento. */
function coruja(mono = false) {
  const c = mono ? '#000' : DEG, s = mono ? '#000' : CEU, W = P.traco;
  const olhos = P.olhos.map(([x, y]) => mono
    ? `<circle cx="${x}" cy="${y}" r="${P.raioOlho}" stroke="${c}" stroke-width="${W}"/>`
    : `<circle cx="${x}" cy="${y}" r="${P.raioOlho}" stroke="${c}" stroke-width="${W}" fill="#FFFFFF"/>
       <circle cx="${x}" cy="${y + 6}" r="${P.raioIris}" fill="${CEU}"/><circle cx="${x}" cy="${y + 6}" r="${P.raioPupila}" fill="${MARINHO}"/>
       <circle cx="${x - 16}" cy="${y - 12}" r="${P.raioBrilho}" fill="#FFFFFF"/>`).join('');
  const g = P.degrade;
  return `<g fill="none" stroke-linecap="round" stroke-linejoin="round">
    <defs><linearGradient id="corujaDegrade" gradientUnits="userSpaceOnUse" x1="${g.x1}" y1="${g.y1}" x2="${g.x2}" y2="${g.y2}"><stop offset="0" stop-color="${g.de}"/><stop offset="1" stop-color="${g.ate}"/></linearGradient></defs>
    ${mono ? '' : `<path d="${P.miolo}" fill="${CORPO}"/><path d="${P.barriga}" fill="${BARRIGA}"/>`}
    <path d="${P.testeira}" stroke="${c}" stroke-width="${W}"/>
    <path d="${P.corpo}" stroke="${c}" stroke-width="${W}"/>
    ${olhos}
    <path d="${P.barrigaE}" stroke="${c}" stroke-width="${W}"/>
    <path d="${P.barrigaD}" stroke="${c}" stroke-width="${W}"/>
    <polygon points="${P.bico}" stroke="${s}" stroke-width="${P.tracoBico}" fill="${mono ? 'none' : CEU}"/>
    ${mono ? '' : `<polygon points="${P.bicoMiolo}" fill="#FFFFFF" stroke="none"/>`}
  </g>`;
}

module.exports = { coruja, P, MARINHO, CEU };
