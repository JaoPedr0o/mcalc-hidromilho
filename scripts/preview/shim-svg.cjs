const React = require('react');
const tag = (name) => ({ children, ...props }) => React.createElement(name, props, children);
const Svg = ({ children, accessibilityLabel, ...props }) => React.createElement('svg', { ...props, 'aria-label': accessibilityLabel, style: { display: 'block' } }, children);
module.exports = {
  __esModule: true, default: Svg,
  Defs: tag('defs'), LinearGradient: tag('linearGradient'), RadialGradient: tag('radialGradient'), Stop: tag('stop'), ClipPath: tag('clipPath'),
  Path: tag('path'), Rect: tag('rect'), Ellipse: tag('ellipse'), Circle: tag('circle'), G: tag('g'), Line: tag('line'), Text: tag('text'),
};
