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

  image.setAttributeNS('http://www.w3.org/1999/xlink','href',a.src);
  image.setAttribute('style', 'width: ' + a.width);

  return image;
}
