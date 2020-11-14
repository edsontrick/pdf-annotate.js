import setAttributes from '../utils/setAttributes';

/**
 * Create SVGTextElement from an annotation definition.
 * This is used for anntations of type `textbox`.
 *
 * @param {Object} a The annotation definition
 * @return {SVGTextElement} A text to be rendered
 */
export default function renderImage(a) {

  // Text should be rendered at 0 degrees relative to
  // document rotation
  let image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
  let text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  let extra_text = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
  let x = a.x;
  let y = a.y;

  setAttributes(image, {
    x: x,
    y: y,
    transform: `rotate(${a.rotation}, ${x}, ${y})`,
    src: a.src,
    width: a.width,
    signType: a.signType
  });

  setAttributes(text, {
    x: x,
    y: y + a.height,
    fill: '#000',
    fontSize: '16px',
    transform: `rotate(${a.rotation}, ${x}, ${y + a.height})`,
    fontFamily: '"Times New Roman", Times, serif'
  });

  if (a.extraContent) {
    let contents = [];
    setAttributes(extra_text, {
      x: x,
      dy: '1.2em',
      fill: '#000',
      fontSize: '12px',
      transform: `rotate(${a.rotation}, ${x}, ${y})`,
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

  image.setAttributeNS('http://www.w3.org/1999/xlink','href',a.src);
  image.setAttribute('style', 'width: ' + a.width);

  var g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  if (a.extraContent)
    g.appendChild(text);
  g.appendChild(image);

  return g;
}
