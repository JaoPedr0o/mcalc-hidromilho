const React = require('react');
module.exports = { LinearGradient: ({ colors, style, children }) => React.createElement('div', { style: { display: 'flex', flexDirection: 'column', boxSizing: 'border-box', background: `linear-gradient(135deg, ${colors[0]}, ${colors[colors.length - 1]})`, ...(Array.isArray(style) ? Object.assign({}, ...style) : style) } }, children) };
