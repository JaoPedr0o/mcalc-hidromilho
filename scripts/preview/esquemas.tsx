// Gera scripts/preview/esquemas.html com o diagrama do processo (abra no navegador).
import React from 'react';
// @ts-ignore -- ferramenta de desenvolvimento, sem tipos de react-dom
import { renderToStaticMarkup } from 'react-dom/server';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { EsquemaProcesso } from '../../src/Processo';

const caixa = (t: string, el: React.ReactElement) => (
  <div style={{ width: 420, background: '#fff', borderRadius: 24, padding: 18, margin: 12, boxShadow: '0 2px 10px rgba(0,0,0,.1)', fontFamily: 'sans-serif' }}>
    <div style={{ fontSize: 12, color: '#777', marginBottom: 6 }}>{t}</div>{el}
  </div>
);
const html = renderToStaticMarkup(
  <div style={{ display: 'flex', flexWrap: 'wrap', background: '#F5F8FC', padding: 8 }}>
    {caixa('EsquemaProcesso', <EsquemaProcesso milho="10.000 kg/h" agua="38,5 L/min" umid="35%" />)}
  </div>,
);
writeFileSync(join(__dirname, 'esquemas.html'), `<!doctype html><meta charset="utf-8"><body style="margin:0">${html}</body>`);
console.log('ok');
