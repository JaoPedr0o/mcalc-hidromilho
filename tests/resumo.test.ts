import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { montarResumo } from '../src/resumo';

const vazaoVazia = { vazaoMilho: '', unidade: 'kg/h' as const, vazaoReal: '', canoPol: '' };

describe('montarResumo', () => {
  test('lote preenchido: massa, umidades e água', () => {
    const r = montarResumo({ massa: '1000', uAtual: '12', uAlvo: '35' }, vazaoVazia);
    assert.ok(r);
    assert.match(r, /Lote: 1\.000 kg de milho/);
    assert.match(r, /12,0% → almejada: 35,0%/);
    assert.match(r, /Água a adicionar: 353,8 L \(0,354 L\/kg\)/);
    assert.doesNotMatch(r, /Vazão/);
  });
  test('com vazão de milho válida, inclui a vazão de água em L/min', () => {
    const r = montarResumo({ massa: '1000', uAtual: '12', uAlvo: '35' }, { ...vazaoVazia, vazaoMilho: '6000' });
    assert.ok(r);
    assert.match(r, /Vazão de milho: 6\.000 kg\/h/);
    assert.match(r, /Vazão de água: 35,4 L\/min/);
  });
  test('vazão em t/h é convertida para kg/h', () => {
    const r = montarResumo({ massa: '500', uAtual: '12', uAlvo: '35' }, { ...vazaoVazia, vazaoMilho: '6', unidade: 't/h' });
    assert.ok(r);
    assert.match(r, /Vazão de milho: 6\.000 kg\/h/);
  });
  test('sem massa ou com umidade inválida: null', () => {
    assert.equal(montarResumo({ massa: '', uAtual: '12', uAlvo: '35' }, vazaoVazia), null);
    assert.equal(montarResumo({ massa: '1000', uAtual: '12', uAlvo: '120' }, vazaoVazia), null);
  });
});
