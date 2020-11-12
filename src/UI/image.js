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
let imageSrc;
let button;
let originY;
let originX;
let svg;
let rect;

/**
 * Handle document.mouseup event
 *
 * @param {Event} e The DOM event to handle
 */
function handleDocumentMouseup(e) {
  let anchor = document.createElement('a');

  if (input || !(svg = findSVGAtPoint(e.clientX, e.clientY))) {
    return;
  }

  rect = svg.getBoundingClientRect();
  originY = e.clientY;
  originX = e.clientX;

  divWrapper = document.createElement('div');
  divWrapper.style.position = 'absolute';
  divWrapper.style.width = '210px';

  imageSrc = document.querySelector('button.image.active').dataset.imageSrc;

  input = document.createElement('img');
  input.setAttribute('id', 'pdf-annotate-image');
  input.setAttribute('src', imageSrc);
  input.style.border = `3px solid ${BORDER_COLOR}`;
  input.style.borderRadius = '3px';
  input.style.position = 'absolute';
  input.style.top = 0;
  input.style.left = 0;
  input.style.width = '250px';
  input.readOnly = 'true';

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
  });

  divWrapper.appendChild(input);
  divWrapper.appendChild(button);
  divWrapper.appendChild(anchor);
  // document.body.appendChild(input);
  svg.parentNode.appendChild(divWrapper);

  let imageButton = document.querySelector("button.image.active");
  if (imageButton && imageButton.getAttribute('data-sign-type') == 'rubric')
    document.getElementById('pdf-annotate-image').style.width = '150px';

  document.getElementById('pdf-annotate-image').parentElement.style.width = document.getElementById('pdf-annotate-image').offsetWidth + 'px';
  document.getElementById('pdf-annotate-image').dispatchEvent(new Event('change'));
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
  let imageButton = document.querySelector("button.image.active");
  let imageButtonSignTYpe;
  if (imageButton)
    imageButtonSignTYpe = imageButton.getAttribute('data-sign-type');
  if (!svg) {
    return;
  }
  let { documentId, pageNumber, viewport } = getMetadata(svg);
  let pt = convertToSvgPoint([
    parseInt(divWrapper.style.left), 
    parseInt(divWrapper.style.top)], svg, viewport);
  let annotation = {
    type: 'image',
    x: pt[0],
    y: pt[1],
    rotation: -viewport.rotation,
    src: imageSrc,
    width: '210px',
    signType: imageButtonSignTYpe
  }
  if (annotation['signType'] == 'rubric')
    annotation['width'] = '110px';

  PDFJSAnnotate.getStoreAdapter().addAnnotation(documentId, pageNumber, annotation)
    .then((annotation) => {
      appendChild(svg, annotation);
    });
  
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
 * Enable text behavior
 */
export function enableImage() {
  if (_enabled) { return; }

  _enabled = true;
  document.addEventListener('mouseup', handleDocumentMouseup);
}


/**
 * Disable text behavior
 */
export function disableImage() {
  if (!_enabled) { return; }

  _enabled = false;
  document.removeEventListener('mouseup', handleDocumentMouseup);
}

