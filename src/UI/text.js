import PDFJSAnnotate from '../PDFJSAnnotate';
import { appendChild } from '../render/appendChild';
import {
  BORDER_COLOR,
  findSVGAtPoint,
  getMetadata,
  convertToSvgPoint
} from './utils';

let _enabled = false;
let input;
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
  if (input || !(svg = findSVGAtPoint(e.clientX, e.clientY))) {
    return;
  }

  rect = svg.getBoundingClientRect();
  originY = e.clientY;
  originX = e.clientX;

  input = document.createElement('input');
  input.setAttribute('id', 'pdf-annotate-text-input');
  input.setAttribute('placeholder', 'Enter text');
  input.style.border = `3px solid ${BORDER_COLOR}`;
  input.style.borderRadius = '3px';
  input.style.position = 'absolute';
  input.style.top = `${originY - rect.top}px`;
  input.style.left = `${originX - rect.left}px`;
  input.style.fontSize = `${_textSize}px`;
  input.style.fontFamily = _fontFamily;

  // input.addEventListener('blur', handleInputBlur);
  input.addEventListener('saving', handleInputBlur);
  input.addEventListener('keyup', handleInputKeyup);

  // document.body.appendChild(input);
  svg.parentNode.appendChild(input);
  input.focus();
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
      clientX - rect.left, 
      clientY -  rect.top + height], svg, viewport);
    let annotation = {
        type: 'textbox',
        size: _textSize * scale,
        color: _textColor,
        content: input.value.trim(),
        x: pt[0],
        y: pt[1],
        rotation: -viewport.rotation,
        fontFamily: _fontFamily
    }
    console.log(pageNumber);

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
    svg.parentNode.removeChild(input);

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

