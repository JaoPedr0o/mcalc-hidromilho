// Ferramenta de desenvolvimento (ver tsconfig.json desta pasta): react-native vira HTML comum,
// só para conferir o layout no navegador. É uma aproximação (não é o motor de layout do celular).
const React = require('react');
const flat = (style) => {
  const out = {};
  const walk = (s) => { if (!s) return; if (Array.isArray(s)) s.forEach(walk); else Object.assign(out, s); };
  walk(typeof style === 'function' ? style({ pressed: false }) : style);
  return out;
};
const css = (style, bloco) => {
  const o = flat(style);
  const r = { boxSizing: 'border-box', ...(bloco ? { display: 'flex', flexDirection: 'column' } : {}), ...o };
  const par = (k, a, b) => { if (o[k] != null) { r[a] = o[k]; r[b] = o[k]; delete r[k]; } };
  par('paddingHorizontal', 'paddingLeft', 'paddingRight'); par('paddingVertical', 'paddingTop', 'paddingBottom');
  par('marginHorizontal', 'marginLeft', 'marginRight'); par('marginVertical', 'marginTop', 'marginBottom');
  if (typeof r.lineHeight === 'number') r.lineHeight = r.lineHeight + 'px';
  if (r.flex === 1) { r.flex = '1 1 0%'; r.minWidth = 0; }
  return r;
};
const View = ({ style, children }) => React.createElement('div', { style: css(style, true) }, children);
const Text = ({ style, children }) => React.createElement('span', { style: css(style, false) }, children);
const Pressable = ({ style, children }) => React.createElement('div', { style: css(style, true) }, typeof children === 'function' ? children({ pressed: false }) : children);
const TextInput = ({ value, style }) => React.createElement('input', { value, readOnly: true, style: { ...css(style, false), border: 0, background: 'transparent', outline: 0 } });
const StyleSheet = { create: (x) => x };
module.exports = { View, Text, Pressable, TextInput, StyleSheet };
