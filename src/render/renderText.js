import setAttributes from '../utils/setAttributes';
import normalizeColor from '../utils/normalizeColor';

/**
 * Create SVGTextElement from an annotation definition.
 * This is used for anntations of type `textbox`.
 *
 * @param {Object} a The annotation definition
 * @return {SVGTextElement} A text to be rendered
 */
export default function renderText(a) {

  // Text should be rendered at 0 degrees relative to
  // document rotation
  let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  let extra_text = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
  let x = a.x;
  let y = a.y;

  setAttributes(text, {
    x: x,
    y: y,
    fill: normalizeColor(a.color || '#000'),
    fontSize: a.size,
    transform: `rotate(${a.rotation}, ${x}, ${y})`,
    fontFamily: a.fontFamily
  });
  text.innerHTML = a.content;

  if (a.extraContent) {
    let contents = [];
    setAttributes(extra_text, {
      x: x,
      dy: '1.2em',
      fill: normalizeColor(a.color || '#000'),
      fontSize: '12px',
      transform: `rotate(${a.rotation}, ${x}, ${y + 20})`,
      fontFamily: '"Times New Roman", Times, serif'
    });
    extra_text.innerHTML = a.extraContent;
    a.extraContent.split('<br>').forEach(function(item, index){
      if (index > 0)
        extra_text = extra_text.cloneNode(true);
      extra_text.innerHTML = item;
      contents.push(extra_text);
    });
    contents.forEach(function(item){
      text.appendChild(item);
    });
  }

  var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.appendChild(text);

  return g;
}
