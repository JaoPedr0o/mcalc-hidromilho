// Gera scripts/preview/telas.html com a aba Vazão em alguns casos (abra no navegador).
import React from 'react';
// @ts-ignore -- ferramenta de desenvolvimento, sem tipos de react-dom
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { TelaVazao, EstadoVazao } from '../../src/TelaVazao';
import type { EstadoLote } from '../../src/TelaLote';

const base: EstadoVazao = { vazaoMilho: '6000', unidade: 'kg/h', vazaoReal: '20', canoPol: '3/4"' };
const lote: EstadoLote = { massa: '12000', uAtual: '20', uAlvo: '35' };
const tela = (t: string, e: EstadoVazao) => (
  <div style={{ width: 390, background: '#F5F8FC', padding: 16, margin: 8, fontFamily: 'sans-serif', boxSizing: 'border-box' }}>
    <div style={{ fontSize: 12, color: '#777', marginBottom: 8 }}>{t}</div>
    <TelaVazao e={e} set={() => {}} lote={lote} setLote={() => {}} />
  </div>
);
const html = renderToStaticMarkup(
  <div style={{ display: 'flex', alignItems: 'flex-start', flexWrap: 'wrap' }}>
    {tela('6.000 kg/h · cano 3/4" escolhido', base)}
    {tela('10 t/h · cano pequeno (1/2") → aviso', { ...base, vazaoMilho: '10', unidade: 't/h', canoPol: '1/2"' })}
  </div>,
);
writeFileSync(join(__dirname, 'telas.html'), `<!doctype html><meta charset="utf-8"><body style="margin:0;background:#eee">${html}</body>`);
console.log('ok');
