import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import * as c from '../src/calc';

const perto = (a: number, b: number, tol = 1e-6) =>
  assert.ok(Math.abs(a - b) <= tol, `esperado ${b}, obtido ${a}`);

describe('parseNum / fmt', () => {
  test('aceita vírgula e ponto', () => { perto(c.parseNum('12,5'), 12.5); perto(c.parseNum('12.5'), 12.5); });
  test('ignora espaços', () => perto(c.parseNum('  7 '), 7));
  test('vazio, texto e null viram NaN', () => {
    assert.ok(isNaN(c.parseNum(''))); assert.ok(isNaN(c.parseNum('   ')));
    assert.ok(isNaN(c.parseNum('abc'))); assert.ok(isNaN(c.parseNum(null as any)));
  });
  test('fmt usa vírgula e casas', () => {
    assert.equal(c.fmt(26.1356), '26,14'); assert.equal(c.fmt(3, 0), '3'); assert.equal(c.fmt(0.3539, 3), '0,354');
  });
  test('fmt de valor inválido', () => { assert.equal(c.fmt(NaN), '—'); assert.equal(c.fmt(Infinity), '—'); });
});

describe('umidade <-> MS', () => {
  test('85% MS = 15% umidade', () => { perto(c.msParaUmidade(85), 15); perto(c.umidadeParaMS(15), 85); });
  test('é involutiva', () => perto(c.umidadeParaMS(c.msParaUmidade(63.2)), 63.2));
  test('complementoTexto', () => {
    assert.equal(c.complementoTexto('15'), '85'); assert.equal(c.complementoTexto('12,5'), '87,5');
    assert.equal(c.complementoTexto(''), ''); assert.equal(c.complementoTexto('x'), '');
  });
});

describe('calcAguaTotal (substitui o Solver)', () => {
  test('caso da planilha: 73,86 kg, MS 88%, alvo 35% → 26,14 L', () => {
    const a = c.calcAguaTotal(73.86, 12, 35);
    perto(a, 26.14, 0.01); perto(a / 73.86, 0.3539, 0.001);
  });
  test('verificação: umidade resultante volta ao alvo (várias combinações)', () => {
    for (const m of [1, 50, 73.86, 1000, 25000])
      for (const u0 of [0, 5, 12, 20, 29.9])
        for (const ua of [30, 33, 35, 38, 40]) {
          const agua = c.calcAguaTotal(m, u0, ua);
          perto(c.calcUmidadeResultante(m, u0, agua), ua, 1e-9);
        }
  });
  test('é proporcional à massa', () => perto(c.calcAguaTotal(200, 12, 35), 2 * c.calcAguaTotal(100, 12, 35), 1e-9));
  test('alvo == atual → zero água', () => perto(c.calcAguaTotal(100, 35, 35), 0, 1e-9));
  test('alvo menor que atual → água negativa', () => assert.ok(c.calcAguaTotal(100, 40, 35) < 0));
  test('mais umidade alvo → mais água', () => assert.ok(c.calcAguaTotal(100, 12, 40) > c.calcAguaTotal(100, 12, 30)));
  test('condição da planilha B16 (alvo − resultante) ≈ 0', () => {
    perto(35 - c.calcUmidadeResultante(73.86, 12, 26.14), 0, 0.01);
  });
});

describe('calcUmidadeResultante', () => {
  test('sem água mantém a umidade', () => perto(c.calcUmidadeResultante(100, 12, 0), 12, 1e-9));
  test('100 kg a 12% + 100 L → 56%', () => perto(c.calcUmidadeResultante(100, 12, 100), 56, 1e-9));
  test('aumenta com a água', () => assert.ok(c.calcUmidadeResultante(100, 12, 30) > c.calcUmidadeResultante(100, 12, 20)));
});

describe('vazão', () => {
  test('água por kg: 20% → 35% = 0,2308 L/kg', () => perto(c.calcAguaPorKg(20, 35), 0.230769, 1e-5));
  test('coerente com calcAguaTotal / massa', () => perto(c.calcAguaPorKg(12, 35), c.calcAguaTotal(100, 12, 35) / 100, 1e-12));
  test('exemplo do prompt: 10.000 kg/h → ≈2.308 L/h (38,5 L/min)', () => {
    const lh = c.calcVazaoAgua(10000, 20, 35);
    perto(lh, 2307.69, 0.01); perto(lh / 60, 38.46, 0.01);
  });
  test('vazão zero de milho → zero de água', () => perto(c.calcVazaoAgua(0, 20, 35), 0));
  test('umidadePorVazao devolve o alvo com a vazão calculada', () => {
    perto(c.umidadePorVazao(10000, c.calcVazaoAgua(10000, 20, 35), 20), 35, 1e-9);
  });
  test('vazão de água zero mantém umidade atual', () => perto(c.umidadePorVazao(5000, 0, 15), 15, 1e-9));
  test('água a menos reduz a umidade; a mais aumenta', () => {
    const ideal = c.calcVazaoAgua(10000, 20, 35);
    assert.ok(c.umidadePorVazao(10000, ideal * 0.8, 20) < 35);
    assert.ok(c.umidadePorVazao(10000, ideal * 1.2, 20) > 35);
  });
  test('vazaoParaKgH', () => { perto(c.vazaoParaKgH(2.5, 't/h'), 2500); perto(c.vazaoParaKgH(2500, 'kg/h'), 2500); });
  test('coerência de lote: vazão × tempo = água total', () => {
    const lh = c.calcVazaoAgua(10000, 20, 35), horas = 20000 / 10000;
    perto(lh * horas, 20000 * c.calcAguaPorKg(20, 35), 1e-6);
  });
});

describe('statusUmidade (faixa 30–40, alvo 35)', () => {
  test('constantes', () => { assert.equal(c.FAIXA_MIN, 30); assert.equal(c.FAIXA_MAX, 40); assert.equal(c.ALVO_IDEAL, 35); });
  test('ok no centro', () => { for (const u of [32, 35, 38]) assert.equal(c.statusUmidade(u), 'ok'); });
  test('atenção perto dos limites', () => {
    for (const u of [30, 31.9, 38.1, 40]) assert.equal(c.statusUmidade(u), 'atencao', String(u));
  });
  test('fora da faixa', () => { for (const u of [29.99, 10, 40.01, 60]) assert.equal(c.statusUmidade(u), 'fora', String(u)); });
});

describe('sugerirCorrecao', () => {
  test('no alvo → nenhuma', () => assert.equal(c.sugerirCorrecao(100, 35, 12).tipo, 'nenhuma'));
  test('seco → adicionar água; resultado chega a 35%', () => {
    const r = c.sugerirCorrecao(100, 30, 12);
    assert.equal(r.tipo, 'agua'); perto(r.quantidade, 7.6923, 1e-3);
    perto((30 * 100 + 100 * r.quantidade) / (100 + r.quantidade), 35, 1e-9);
  });
  test('úmido → adicionar milho seco; resultado chega a 35%', () => {
    const r = c.sugerirCorrecao(100, 40, 12);
    assert.equal(r.tipo, 'milho');
    perto((40 * 100 + 12 * r.quantidade) / (100 + r.quantidade), 35, 1e-9);
  });
  test('alvo customizado', () => {
    const r = c.sugerirCorrecao(100, 30, 12, 32);
    perto((30 * 100 + 100 * r.quantidade) / (100 + r.quantidade), 32, 1e-9);
  });
});

describe('validações', () => {
  test('lote válido', () => assert.equal(c.validarLote(73.86, 12, 35), ''));
  test('massa inválida', () => { for (const m of [NaN, 0, -5]) assert.match(c.validarLote(m, 12, 35), /massa/); });
  test('umidade atual inválida', () => { for (const u of [NaN, -1, 100, 120]) assert.match(c.validarLote(10, u, 35), /atual/); });
  test('umidade alvo inválida', () => { for (const u of [NaN, 0, 100]) assert.match(c.validarLote(10, 12, u), /almejada/); });
  test('alvo ≤ atual', () => { assert.match(c.validarLote(10, 35, 35), /maior/); assert.match(c.validarLote(10, 40, 35), /maior/); });
  test('fronteiras aceitas', () => { assert.equal(c.validarLote(10, 0, 35), ''); assert.equal(c.validarLote(10, 12, 99.9), ''); });
  test('vazão', () => {
    assert.equal(c.validarVazao(10000, 20, 35), '');
    for (const v of [NaN, 0, -1]) assert.match(c.validarVazao(v, 20, 35), /vaz/i);
    assert.match(c.validarVazao(10000, 40, 35), /maior/);
  });
  test('entradas com vírgula passam', () => {
    assert.equal(c.validarLote(c.parseNum('73,86'), c.parseNum('12'), c.parseNum('35,5')), '');
  });
});

describe('gerarCSV', () => {
  test('cabeçalho + linhas com vírgula decimal', () => {
    const csv = c.gerarCSV([
      { data: '15/10/2026 10:00', massa: 73.86, uInicial: 12, agua: 26.14, uCalc: 35.0032, uMed: 34.5 },
      { data: '15/10/2026 11:00', massa: 100, uInicial: 12, agua: 30, uCalc: 33 },
    ]).split('\n');
    assert.equal(csv.length, 3);
    assert.ok(csv[0].startsWith('data;massa_kg'));
    assert.equal(csv[1], '15/10/2026 10:00;73,86;12;26,14;35,00;34,5');
    assert.equal(csv[2], '15/10/2026 11:00;100;12;30;33,00;');
  });
  test('lista vazia → só cabeçalho', () => assert.equal(c.gerarCSV([]).split('\n').length, 1));
});

describe('cano de água', () => {
  test('velocidade: 38,5 L/min em 3/4" (DI 21,6 mm) ≈ 1,75 m/s', () => perto(c.velocidadeAgua(38.46, 21.6), 1.749, 0.01));
  test('velocidade cai com o diâmetro maior', () => assert.ok(c.velocidadeAgua(40, 27.8) < c.velocidadeAgua(40, 21.6)));
  test('vazão máxima é coerente com a velocidade', () => {
    for (const cano of c.CANOS) perto(c.velocidadeAgua(c.vazaoMaximaCano(cano.di), cano.di), c.V_MAX_REC, 1e-9);
  });
  test('1/2" comporta ≈ 34 L/min a 2,5 m/s', () => perto(c.vazaoMaximaCano(17), 34.05, 0.1));
  test('menorCano escolhe o primeiro que não passa do limite', () => {
    assert.equal(c.menorCano(20)?.pol, '1/2"');
    assert.equal(c.menorCano(38.46)?.pol, '3/4"');
    assert.equal(c.menorCano(59)?.pol, '1"');
  });
  test('menorCano sem opção devolve undefined', () => assert.equal(c.menorCano(5000), undefined));
  test('status da velocidade', () => {
    assert.equal(c.statusVelocidade(1.5), 'ok'); assert.equal(c.statusVelocidade(2.8), 'atencao');
    assert.equal(c.statusVelocidade(0.2), 'atencao'); assert.equal(c.statusVelocidade(3.5), 'fora');
  });
  test('acharCano', () => { assert.equal(c.acharCano('1"')?.dn, 32); assert.equal(c.acharCano('x'), undefined); });
  test('milho: kg/min e kg/s', () => { perto(c.kgHParaKgMin(600), 10); perto(c.kgHParaKgS(3600), 1); });
});
