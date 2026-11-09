// Gera os ícones e a imagem da tela de abertura em assets/ (npm run icons).
// Marca Mcalc: coruja em traço azul-marinho com detalhes azul-céu e preenchimentos suaves, sobre fundo branco.
// A geometria vem de src/coruja.json, a mesma usada por src/Logo.tsx.
const sharp = require('sharp');

const { coruja: desenho } = require('./lib/coruja-svg');

/** Coruja na caixa 0..100 (mesma transformação de src/Logo.tsx). */
const coruja = (mono = false) => `<g transform="translate(-2.5 -7) scale(0.125)">${desenho(mono)}</g>`;

const FUNDO = '#FFFFFF';
const svg = (inner, fundo) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${fundo ? `<rect width="100" height="100" fill="${FUNDO}"/>` : ''}${inner}</svg>`;

/** Encolhe o desenho ao centro (a área segura do ícone adaptativo e da tela de abertura é ~2/3). */
const centro = (inner, s) => `<g transform="translate(${50 - 50 * s} ${50 - 50 * s}) scale(${s})">${inner}</g>`;

const out = (nome, conteudo, tamanho) =>
  sharp(Buffer.from(conteudo), { density: 400 }).resize(tamanho, tamanho).png().toFile('assets/' + nome);

(async () => {
  await out('icon.png', svg(centro(coruja(), 0.72), true), 1024);
  await out('android-icon-foreground.png', svg(centro(coruja(), 0.52)), 1024);
  await out('android-icon-background.png', svg('', true), 1024);
  await out('android-icon-monochrome.png', svg(centro(coruja(true), 0.52)), 1024);
  // Tela de abertura: só a marca, fundo transparente (a cor de fundo vem do plugin, em app.json).
  await out('splash-icon.png', svg(centro(coruja(), 0.62)), 1024);
  await out('favicon.png', svg(centro(coruja(), 0.8), true), 96);
  console.log('ok');
})();
