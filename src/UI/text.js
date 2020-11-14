import PDFJSAnnotate from '../PDFJSAnnotate';
import { appendChild } from '../render/appendChild';
import {
  BORDER_COLOR,
  findSVGAtPoint,
  getMetadata,
  convertToSvgPoint
} from './utils';

let _enabled = false;
let divWrapper;
let input;
let span;
let button;
let originY;
let originX;
let svg;
let rect;
let _textSize;
let _textColor;
let _fontFamily;

/**
 * Handle document.mouseup event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMouseup(e) {
  let anchor = document.createElement('a');

  if (input || !(svg = findSVGAtPoint(e.clientX, e.clientY)) || !e.target.classList.contains('annotationLayer')) {
    return;
  }

  rect = svg.getBoundingClientRect();
  originY = e.clientY;
  originX = e.clientX;

  divWrapper = document.createElement('div');
  divWrapper.style.position = 'absolute';
  divWrapper.style.width = '210px';

  input = document.createElement('input');
  input.setAttribute('id', 'pdf-annotate-text-input');
  input.setAttribute('placeholder', 'Enter text');
  input.style.border = `3px solid ${BORDER_COLOR}`;
  input.style.borderRadius = '3px';
  input.style.position = 'absolute';
  input.style.top = 0;
  input.style.left = 0;
  input.style.fontSize = `${_textSize}px`;
  input.style.fontFamily = _fontFamily;
  input.style.width = '100%';
  input.readOnly = 'true';

  span = document.createElement('span');
  span.setAttribute('id', 'pdf-annotate-text-span');
  span.style.cssText = input.style.cssText;
  span.style.fontFamily = '"Times New Roman", Times, serif';
  span.style.fontSize = '16px';
  span.style.lineHeight = '1.2em';
  span.style.top = '26px';

  button = document.createElement('button');
  button.setAttribute('id', 'pdf-annotate-text-button');
  button.style.position = 'absolute';
  button.style.right = '-42px';
  button.style.top = '13px';
  button.style.background = '#4caf50';
  button.style.color = 'white';
  button.style.border = 'none';
  button.style.padding = '2px 10px';
  button.addEventListener('click', handleInputBlur);
  button.innerHTML = "OK";

  anchor.innerHTML = '×';
  anchor.setAttribute('href', 'javascript://');
  anchor.style.background = '#fff';
  anchor.style.borderRadius = '20px';
  anchor.style.border = '1px solid #bbb';
  anchor.style.color = '#bbb';
  anchor.style.fontSize = '16px';
  anchor.style.padding = '2px';
  anchor.style.textAlign = 'center';
  anchor.style.textDecoration = 'none';
  anchor.style.position = 'absolute';
  anchor.style.top = '-15px';
  anchor.style.right = '-10px';
  anchor.style.width = '25px';
  anchor.style.height = '25px';
  anchor.style.lineHeight = '17px';

  // input.addEventListener('blur', handleInputBlur);
  input.addEventListener('saving', handleInputBlur);
  input.addEventListener('keyup', handleInputKeyup);
  anchor.addEventListener('click', closeInput);
  anchor.addEventListener('mouseover', () => {
    anchor.style.color = '#35A4DC';
    anchor.style.borderColor = '#999';
    anchor.style.boxShadow = '0 1px 1px #ccc';
  });
  anchor.addEventListener('mouseout', () => {
    anchor.style.color = '#bbb';
    anchor.style.borderColor = '#bbb';
    anchor.style.boxShadow = '';
  });
  input.addEventListener('change', function(){
    let maxY = rect.height - 40;
    let maxX = rect.width - parseInt(divWrapper.style.width);
    let positionY = originY - rect.top;
    let positionX = originX - rect.left;
    divWrapper.style.top = `${positionY >= maxY ? maxY : positionY}px`;
    divWrapper.style.left = `${positionX >= maxX ? maxX : positionX}px`;
    span.style.top = input.offsetHeight - 3 + 'px';
    if (span.innerHTML.length == 0)
      span.remove();
  });

  divWrapper.appendChild(input);
  divWrapper.appendChild(span);
  divWrapper.appendChild(button);
  divWrapper.appendChild(anchor);
  // document.body.appendChild(input);
  svg.parentNode.appendChild(divWrapper);
  // input.value = 'Patrick Edson';
  // span.innerHTML = 'Patrick Edson <br> Test';
  // input.dispatchEvent(new Event('change'));
  // input.focus();
}

/**
 * Handle input.blur event
 */
function handleInputBlur() {
  saveText();
}

/**
 * Handle input.keyup event
 *
 * @param {Event} e The DOM event to handle
 */
function handleInputKeyup(e) {
  if (e.keyCode === 27) {
    closeInput();
  } else if (e.keyCode === 13) {
    saveText();
  }
}

/**
 * Save a text annotation from input
 */
function saveText() {
  let textButton = document.querySelector("button.text.active");
  let textButtonSignTYpe;
  let extraContent = span;
  if (textButton)
    textButtonSignTYpe = textButton.getAttribute('data-sign-type');
  if (input.value.trim().length > 0) {
    let clientX = parseInt(originX, 10);
    let clientY = parseInt(originY, 10);
    // let svg = findSVGAtPoint(clientX, clientY);
    if (!svg) {
      return;
    }
    let height = _textSize;
    let { documentId, pageNumber, viewport } = getMetadata(svg);
    let scale = 1 / viewport.scale;
    // let rect = svg.getBoundingClientRect();
    let pt = convertToSvgPoint([
      parseInt(divWrapper.style.left), 
      parseInt(divWrapper.style.top) + height], svg, viewport);
    let annotation = {
      type: 'textbox',
      size: _textSize * scale,
      color: _textColor,
      content: input.value.trim(),
      x: pt[0],
      y: pt[1],
      rotation: -viewport.rotation,
      fontFamily: _fontFamily,
      signType: textButtonSignTYpe
    }
    if (extraContent)
      annotation['extraContent'] = extraContent.innerHTML;

    PDFJSAnnotate.getStoreAdapter().addAnnotation(documentId, pageNumber, annotation)
      .then((annotation) => {
        appendChild(svg, annotation);
      });
  }
  
  closeInput();
}

/**
 * Close the input
 */
function closeInput() {
  // let svg = findSVGAtPoint(originX, originY);
  if (input) {
    input.removeEventListener('blur', handleInputBlur);
    input.removeEventListener('keyup', handleInputKeyup);
    // document.body.removeChild(input);
    svg.parentNode.removeChild(divWrapper);

    input = null;
  }
}

/**
 * Set the text attributes
 *
 * @param {Number} textSize The size of the text
 * @param {String} textColor The color of the text
 */
export function setText(textSize = 12, textColor = '000000', fontFamily = '"Times New Roman", Times, serif') {
  _textSize = parseInt(textSize, 10);
  _textColor = textColor;
  _fontFamily = fontFamily;
}


/**
 * Enable text behavior
 */
export function enableText() {
  if (_enabled) { return; }

  _enabled = true;
  document.addEventListener('mouseup', handleDocumentMouseup);
}


/**
 * Disable text behavior
 */
export function disableText() {
  if (!_enabled) { return; }

  _enabled = false;
  document.removeEventListener('mouseup', handleDocumentMouseup);
}

