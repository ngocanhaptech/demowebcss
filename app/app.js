// ============================================================================
// OPTIMIZED WEB BUILDER - IMPROVED LAYOUT CONTAINERS & BOOTSTRAP INTEGRATION
// ============================================================================

// Global variables
let elementId = 0;
let previewIframe = null;
let previewDoc = null;
let previewBody = null;
let currentSelectedElement = null;
let resizeHandlesContainer = null;
let isResizing = false;
let currentDevice = 'desktop'; // desktop, tablet, mobile

// Container data
const containerTypes = {
  section: {
    name: 'Section',
    icon: '📦',
    color: '#f8f9fa',
    borderColor: '#999',
    canContain: ['text', 'button', 'image', 'section', 'container', 'row', 'col']
  },
  container: {
    name: 'Container',
    icon: '📮',
    color: '#e7f3ff',
    borderColor: '#0066cc',
    canContain: ['text', 'button', 'image', 'section', 'container', 'row', 'col']
  },
  row: {
    name: 'Row',
    icon: '📋',
    color: '#f0fff0',
    borderColor: '#009900',
    canContain: ['col', 'text', 'button', 'image']
  },
  col: {
    name: 'Col',
    icon: '📊',
    color: '#fffaf0',
    borderColor: '#ff9900',
    canContain: ['text', 'button', 'image', 'section', 'container', 'row']
  }
};

// ============================================================================
// INITIALIZATION
// ============================================================================

function initializeIframe() {
  previewDoc = previewIframe.contentDocument || previewIframe.contentWindow.document;
  previewDoc.open();
  previewDoc.write(`<!DOCTYPE html>
<html>
<head>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
    body { margin: 0; padding: 20px; background: #fff; }
    .element { position: absolute; cursor: move; }
    .nested-element { position: relative !important; }
    .container-element { position: relative; overflow: auto; }
    .selected { outline: 3px solid #007bff !important; }
    .drag-over { background-color: rgba(0, 123, 255, 0.1) !important; border: 2px solid #007bff !important; }
    .container-label { 
      position: absolute; 
      top: 2px; 
      left: 4px; 
      font-size: 12px; 
      font-weight: bold; 
      background: white; 
      padding: 2px 6px;
      border-radius: 3px;
      pointer-events: none;
      z-index: 10;
    }
    .resize-handle {
      position: absolute;
      width: 8px;
      height: 8px;
      background: white;
      border: 2px solid #007bff;
      border-radius: 2px;
      z-index: 100;
    }
  </style>
</head>
<body></body>
</html>`);
  previewDoc.close();
  previewBody = previewDoc.body;
}

// ============================================================================
// ADD ELEMENT FUNCTIONS
// ============================================================================

function addText() {
  const textElement = previewDoc.createElement('div');
  textElement.className = 'element text-element';
  textElement.id = 'element-' + elementId++;
  textElement.innerText = 'Editable Text';
  textElement.style.left = '50px';
  textElement.style.top = '50px';
  textElement.style.fontSize = '16px';
  textElement.style.fontFamily = 'Arial';
  textElement.style.color = '#000000';
  textElement.style.fontWeight = 'normal';
  textElement.style.textAlign = 'left';
  textElement.style.textDecoration = 'none';
  textElement.style.fontStyle = 'normal';
  makeDraggable(textElement, previewDoc);
  addTextClickHandler(textElement);
  previewBody.appendChild(textElement);
}

function addImage() {
  const imgElement = previewDoc.createElement('img');
  imgElement.className = 'element image-element';
  imgElement.id = 'element-' + elementId++;
  imgElement.src = 'https://placehold.co/150';
  imgElement.style.left = '100px';
  imgElement.style.top = '100px';
  imgElement.style.width = '150px';
  imgElement.style.height = '150px';
  imgElement.style.borderStyle = 'none';
  imgElement.style.borderWidth = '0px';
  imgElement.style.borderRadius = '0px';
  imgElement.style.opacity = '1';
  imgElement.dataset.maintainAspectRatio = 'true';
  imgElement.dataset.originalWidth = '150';
  imgElement.dataset.originalHeight = '150';
  makeDraggable(imgElement, previewDoc);
  addImageClickHandler(imgElement);
  previewBody.appendChild(imgElement);
}

function addButton() {
  const btnElement = previewDoc.createElement('button');
  btnElement.className = 'element button-element';
  btnElement.id = 'element-' + elementId++;
  btnElement.innerText = 'Click Me';
  btnElement.style.left = '150px';
  btnElement.style.top = '150px';
  btnElement.style.fontSize = '16px';
  btnElement.style.fontFamily = 'Arial';
  btnElement.style.color = '#ffffff';
  btnElement.style.backgroundColor = '#007bff';
  btnElement.style.fontWeight = 'normal';
  btnElement.style.borderRadius = '5px';
  btnElement.style.padding = '10px 20px';
  btnElement.style.border = 'none';
  btnElement.style.cursor = 'move';
  makeDraggable(btnElement, previewDoc);
  addButtonClickHandler(btnElement);
  previewBody.appendChild(btnElement);
}

// ============================================================================
// CONTAINER ELEMENT FUNCTIONS
// ============================================================================

function addSection() {
  const section = createContainerElement('section');
  previewBody.appendChild(section);
}

function addContainer() {
  const container = createContainerElement('container');
  previewBody.appendChild(container);
}

function addRow() {
  const row = createContainerElement('row');
  previewBody.appendChild(row);
}

function addCol() {
  const col = createContainerElement('col');
  previewBody.appendChild(col);
}

function createContainerElement(type) {
  const container = previewDoc.createElement('div');
  const typeData = containerTypes[type];
  container.className = 'element container-element ' + type + '-element';
  container.id = 'element-' + elementId++;
  container.dataset.containerType = type;
  container.dataset.canContain = JSON.stringify(typeData.canContain);

  // Set default styles
  container.style.padding = '20px';
  container.style.margin = '10px';
  container.style.minHeight = '100px';
  container.style.backgroundColor = typeData.color;
  container.style.borderStyle = 'dashed';
  container.style.borderWidth = '2px';
  container.style.borderColor = typeData.borderColor;
  container.style.borderRadius = '4px';
  container.style.boxShadow = 'none';

  // Set container-specific defaults
  if (type === 'section') {
    container.style.maxWidth = '100%';
    container.style.minWidth = 'auto';
  } else if (type === 'container') {
    container.style.maxWidth = '1200px';
    container.style.display = 'flex';
    container.style.flexDirection = 'row';
    container.style.alignItems = 'stretch';
    container.style.justifyContent = 'flex-start';
    container.dataset.order = '0';
  } else if (type === 'row') {
    container.style.display = 'flex';
    container.style.flexWrap = 'wrap';
    container.style.alignItems = 'stretch';
    container.style.justifyContent = 'flex-start';
    container.dataset.order = '0';
  } else if (type === 'col') {
    container.style.flex = '1';
    container.dataset.colSize = '12';
    container.dataset.colMd = 'auto';
    container.dataset.colLg = 'auto';
    container.dataset.order = '0';
    updateColClasses(container);
  }

  // Add label
  const label = previewDoc.createElement('div');
  label.className = 'container-label';
  label.textContent = typeData.icon + ' ' + typeData.name;
  container.appendChild(label);

  // Make container droppable and draggable
  makeDroppable(container);
  makeContainerDraggable(container);
  addContainerClickHandler(container);

  return container;
}

// ============================================================================
// IMPROVED: UPDATE COL CLASSES DYNAMICALLY
// ============================================================================

function updateColClasses(colElement) {
  if (!colElement.classList.contains('col-element')) return;

  const colSize = colElement.dataset.colSize || '12';
  const colMd = colElement.dataset.colMd || 'auto';
  const colLg = colElement.dataset.colLg || 'auto';

  // Remove all previous col classes
  const classArray = Array.from(colElement.classList);
  classArray.forEach(cls => {
    if (cls.match(/^col(-[a-z]+-)?(-\d+)?$/)) {
      colElement.classList.remove(cls);
    }
  });

  // Add new classes
  colElement.classList.add('col');
  if (colSize !== 'auto') {
    colElement.classList.add('col-' + colSize);
  }
  if (colMd !== 'auto') {
    colElement.classList.add('col-md-' + colMd);
  }
  if (colLg !== 'auto') {
    colElement.classList.add('col-lg-' + colLg);
  }
}

// ============================================================================
// IMPROVED: RESTRICT COL TO ONLY ROW
// ============================================================================

function canContainElement(container, element) {
  const containerType = container.dataset.containerType;
  const elementType = getElementType(element);

  // COL CAN ONLY BE INSIDE ROW - CRITICAL RULE
  if (elementType === 'col' && containerType !== 'row') {
    return false;
  }

  const canContain = JSON.parse(container.dataset.canContain || '[]');
  return canContain.includes(elementType);
}

function getElementType(element) {
  if (element.classList.contains('text-element')) return 'text';
  if (element.classList.contains('button-element')) return 'button';
  if (element.classList.contains('image-element')) return 'image';
  if (element.classList.contains('section-element')) return 'section';
  if (element.classList.contains('container-element')) {
    return element.dataset.containerType || 'container';
  }
  return 'unknown';
}

// ============================================================================
// IMPROVED: MAKE DROPPABLE - RESET POSITION ON DROP
// ============================================================================

function makeDroppable(container) {
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    container.classList.add('drag-over');
  });

  container.addEventListener('dragleave', (e) => {
    e.stopPropagation();
    if (e.target === container) {
      container.classList.remove('drag-over');
    }
  });

  container.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    container.classList.remove('drag-over');

    const draggedId = e.dataTransfer.getData('text/plain');
    const draggedElement = previewDoc.getElementById(draggedId);

    if (draggedElement && canContainElement(container, draggedElement)) {
      // IMPROVEMENT: Update position when dragging into container
      draggedElement.style.position = 'relative';
      draggedElement.style.left = 'auto';
      draggedElement.style.top = 'auto';
      draggedElement.classList.add('nested-element');
      container.appendChild(draggedElement);
    }
  });
}

// ============================================================================
// MAKE CONTAINER DRAGGABLE
// ============================================================================

function makeContainerDraggable(container) {
  container.draggable = true;
  container.addEventListener('dragstart', (e) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', container.id);
    container.style.opacity = '0.5';
  });

  container.addEventListener('dragend', (e) => {
    container.style.opacity = '1';
  });
}

// ============================================================================
// ADD CLICK HANDLERS
// ============================================================================

function addContainerClickHandler(container) {
  container.addEventListener('click', (e) => {
    e.stopPropagation();
    openContainerPropertiesPanel(container);
  });
}

function addTextClickHandler(element) {
  element.addEventListener('click', (e) => {
    if (!element.style.cursor || element.style.cursor === 'move') {
      e.stopPropagation();
    }
  });
}

function addButtonClickHandler(element) {
  element.addEventListener('click', (e) => {
    if (!element.style.cursor || element.style.cursor === 'move') {
      e.stopPropagation();
    }
  });
}

function addImageClickHandler(element) {
  element.addEventListener('click', (e) => {
    if (!element.style.cursor || element.style.cursor === 'move') {
      e.stopPropagation();
    }
  });
}

// ============================================================================
// MAKE ELEMENT DRAGGABLE
// ============================================================================

function makeDraggable(element, doc) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  let isDragging = false;

  element.draggable = true;
  element.addEventListener('dragstart', (e) => {
    e.stopPropagation();
    e.dataTransfer.setData('text/plain', element.id);
    element.style.opacity = '0.5';
  });

  element.addEventListener('dragend', (e) => {
    element.style.opacity = '1';
  });

  element.onmousedown = dragMouseDown;

  function dragMouseDown(e) {
    if (isResizing) return;
    e.preventDefault();
    e.stopPropagation();
    pos3 = e.clientX;
    pos4 = e.clientY;
    doc.onmouseup = closeDragElement;
    doc.onmousemove = elementDrag;
    isDragging = false;
  }

  function elementDrag(e) {
    e.preventDefault();
    isDragging = true;
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    element.style.top = (element.offsetTop - pos2) + "px";
    element.style.left = (element.offsetLeft - pos1) + "px";
  }

  function closeDragElement() {
    doc.onmouseup = null;
    doc.onmousemove = null;
    if (!isDragging) {
      if (element.classList.contains('text-element')) {
        openPropertiesPanel(element);
      } else if (element.classList.contains('button-element')) {
        openButtonPropertiesPanel(element);
      } else if (element.classList.contains('image-element')) {
        openImagePropertiesPanel(element);
      }
    }
  }
}

// ============================================================================
// PROPERTIES PANELS
// ============================================================================

function openContainerPropertiesPanel(container) {
  if (currentSelectedElement) {
    currentSelectedElement.classList.remove('selected');
    removeResizeHandles();
  }
  currentSelectedElement = container;
  container.classList.add('selected');

  const containerType = container.dataset.containerType;
  const typeData = containerTypes[containerType];

  const propertiesPanel = document.getElementById('properties-panel');
  const containerProperties = document.getElementById('container-properties');
  const propertiesTitle = document.getElementById('properties-title');

  propertiesPanel.classList.remove('hidden');
  containerProperties.classList.remove('hidden');
  document.getElementById('text-properties').classList.add('hidden');
  document.getElementById('button-properties').classList.add('hidden');
  document.getElementById('image-properties').classList.add('hidden');

  propertiesTitle.textContent = typeData.name + ' Properties';

  // Populate common properties
  document.getElementById('prop-container-type').value = typeData.name;
  document.getElementById('prop-container-padding').value = container.style.padding || '20px';
  document.getElementById('prop-container-margin').value = container.style.margin || '10px';
  document.getElementById('prop-container-bg').value = rgbToHex(container.style.backgroundColor) || '#ffffff';
  document.getElementById('prop-container-border-style').value = container.style.borderStyle || 'none';
  document.getElementById('prop-container-border-width').value = container.style.borderWidth || '0px';
  document.getElementById('prop-container-border-color').value = rgbToHex(container.style.borderColor) || '#000000';
  document.getElementById('prop-container-box-shadow').value = container.style.boxShadow === 'none' ? '' : container.style.boxShadow;

  // Type-specific fields
  const sectionsToHide = ['container-max-width-group', 'container-min-width-group', 'container-max-height-group', 
                          'container-min-height-group', 'container-flex-direction-group', 'container-align-items-group', 
                          'container-justify-content-group', 'container-order-group', 'container-col-size-group', 
                          'container-col-md-group', 'container-col-lg-group'];
  sectionsToHide.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // Show relevant fields based on type
  if (containerType === 'section' || containerType === 'container') {
    document.getElementById('container-max-width-group').style.display = 'block';
    document.getElementById('container-min-width-group').style.display = 'block';
    document.getElementById('container-max-height-group').style.display = 'block';
    document.getElementById('container-min-height-group').style.display = 'block';
    document.getElementById('prop-container-max-width').value = container.style.maxWidth || '';
    document.getElementById('prop-container-min-width').value = container.style.minWidth || 'auto';
    document.getElementById('prop-container-max-height').value = container.style.maxHeight || 'auto';
    document.getElementById('prop-container-min-height').value = container.style.minHeight || '100px';
  }

  if (containerType === 'container') {
    document.getElementById('container-flex-direction-group').style.display = 'block';
    document.getElementById('container-align-items-group').style.display = 'block';
    document.getElementById('container-justify-content-group').style.display = 'block';
    document.getElementById('container-order-group').style.display = 'block';
    document.getElementById('prop-flex-direction').value = container.style.flexDirection || 'row';
    document.getElementById('prop-align-items').value = container.style.alignItems || 'stretch';
    document.getElementById('prop-justify-content').value = container.style.justifyContent || 'flex-start';
    document.getElementById('prop-container-order').value = container.dataset.order || '0';
  }

  if (containerType === 'row') {
    document.getElementById('container-align-items-group').style.display = 'block';
    document.getElementById('container-justify-content-group').style.display = 'block';
    document.getElementById('container-order-group').style.display = 'block';
    document.getElementById('prop-align-items').value = container.style.alignItems || 'stretch';
    document.getElementById('prop-justify-content').value = container.style.justifyContent || 'flex-start';
    document.getElementById('prop-container-order').value = container.dataset.order || '0';
  }

  if (containerType === 'col') {
    document.getElementById('container-col-size-group').style.display = 'block';
    document.getElementById('container-col-md-group').style.display = 'block';
    document.getElementById('container-col-lg-group').style.display = 'block';
    document.getElementById('container-order-group').style.display = 'block';
    document.getElementById('prop-col-size').value = container.dataset.colSize || '12';
    document.getElementById('prop-col-md').value = container.dataset.colMd || 'auto';
    document.getElementById('prop-col-lg').value = container.dataset.colLg || 'auto';
    document.getElementById('prop-container-order').value = container.dataset.order || '0';
  }
}

function applyContainerProperties() {
  if (!currentSelectedElement || !currentSelectedElement.classList.contains('container-element')) return;

  const container = currentSelectedElement;
  const containerType = container.dataset.containerType;

  container.style.padding = document.getElementById('prop-container-padding').value;
  container.style.margin = document.getElementById('prop-container-margin').value;
  container.style.backgroundColor = document.getElementById('prop-container-bg').value;
  container.style.borderStyle = document.getElementById('prop-container-border-style').value;
  container.style.boxShadow = document.getElementById('prop-container-box-shadow').value || 'none';

  if (container.style.borderStyle !== 'none') {
    container.style.borderWidth = document.getElementById('prop-container-border-width').value;
    container.style.borderColor = document.getElementById('prop-container-border-color').value;
  } else {
    container.style.borderWidth = '0px';
  }

  if (containerType === 'section' || containerType === 'container') {
    container.style.maxWidth = document.getElementById('prop-container-max-width').value;
    container.style.minWidth = document.getElementById('prop-container-min-width').value;
    container.style.maxHeight = document.getElementById('prop-container-max-height').value;
    container.style.minHeight = document.getElementById('prop-container-min-height').value;
  }

  if (containerType === 'container') {
    container.style.flexDirection = document.getElementById('prop-flex-direction').value;
    container.style.alignItems = document.getElementById('prop-align-items').value;
    container.style.justifyContent = document.getElementById('prop-justify-content').value;
    container.dataset.order = document.getElementById('prop-container-order').value;
    container.style.order = container.dataset.order;
  }

  if (containerType === 'row') {
    container.style.alignItems = document.getElementById('prop-align-items').value;
    container.style.justifyContent = document.getElementById('prop-justify-content').value;
    container.dataset.order = document.getElementById('prop-container-order').value;
    container.style.order = container.dataset.order;
  }

  // IMPROVEMENT: Update col classes when properties change
  if (containerType === 'col') {
    container.dataset.colSize = document.getElementById('prop-col-size').value;
    container.dataset.colMd = document.getElementById('prop-col-md').value;
    container.dataset.colLg = document.getElementById('prop-col-lg').value;
    container.dataset.order = document.getElementById('prop-container-order').value;
    container.style.order = container.dataset.order;
    updateColClasses(container); // UPDATE CLASSES DYNAMICALLY
  }
}

function openPropertiesPanel(element) {
  if (currentSelectedElement) {
    currentSelectedElement.classList.remove('selected');
    removeResizeHandles();
  }
  currentSelectedElement = element;
  element.classList.add('selected');

  const propertiesPanel = document.getElementById('properties-panel');
  const textProperties = document.getElementById('text-properties');
  const propertiesTitle = document.getElementById('properties-title');

  propertiesPanel.classList.remove('hidden');
  textProperties.classList.remove('hidden');
  document.getElementById('button-properties').classList.add('hidden');
  document.getElementById('image-properties').classList.add('hidden');
  document.getElementById('container-properties').classList.add('hidden');
  propertiesTitle.textContent = 'Text Properties';

  document.getElementById('prop-text-content').value = element.innerText;
  document.getElementById('prop-font-size').value = element.style.fontSize || '16px';
  document.getElementById('prop-font-family').value = element.style.fontFamily || 'Arial';
  document.getElementById('prop-text-color').value = rgbToHex(element.style.color) || '#000000';
  document.getElementById('prop-font-weight').value = element.style.fontWeight || 'normal';
  document.getElementById('prop-text-align').value = element.style.textAlign || 'left';
  document.getElementById('prop-text-decoration').value = element.style.textDecoration || 'none';
  document.getElementById('prop-font-style').value = element.style.fontStyle || 'normal';
}

function applyProperties() {
  if (!currentSelectedElement) return;
  currentSelectedElement.innerText = document.getElementById('prop-text-content').value;
  currentSelectedElement.style.fontSize = document.getElementById('prop-font-size').value;
  currentSelectedElement.style.fontFamily = document.getElementById('prop-font-family').value;
  currentSelectedElement.style.color = document.getElementById('prop-text-color').value;
  currentSelectedElement.style.fontWeight = document.getElementById('prop-font-weight').value;
  currentSelectedElement.style.textAlign = document.getElementById('prop-text-align').value;
  currentSelectedElement.style.textDecoration = document.getElementById('prop-text-decoration').value;
  currentSelectedElement.style.fontStyle = document.getElementById('prop-font-style').value;
}

function openButtonPropertiesPanel(element) {
  if (currentSelectedElement) {
    currentSelectedElement.classList.remove('selected');
    removeResizeHandles();
  }
  currentSelectedElement = element;
  element.classList.add('selected');

  const propertiesPanel = document.getElementById('properties-panel');
  const buttonProperties = document.getElementById('button-properties');
  const propertiesTitle = document.getElementById('properties-title');

  propertiesPanel.classList.remove('hidden');
  document.getElementById('text-properties').classList.add('hidden');
  buttonProperties.classList.remove('hidden');
  document.getElementById('image-properties').classList.add('hidden');
  document.getElementById('container-properties').classList.add('hidden');
  propertiesTitle.textContent = 'Button Properties';

  document.getElementById('prop-button-text').value = element.innerText;
  document.getElementById('prop-button-font-size').value = element.style.fontSize || '16px';
  document.getElementById('prop-button-font-family').value = element.style.fontFamily || 'Arial';
  document.getElementById('prop-button-text-color').value = rgbToHex(element.style.color) || '#ffffff';
  document.getElementById('prop-button-bg-color').value = rgbToHex(element.style.backgroundColor) || '#007bff';
  document.getElementById('prop-button-font-weight').value = element.style.fontWeight || 'normal';

  const borderRadius = element.style.borderRadius || '5px';
  const radiusValue = parseInt(borderRadius);
  document.getElementById('prop-button-border-radius').value = radiusValue;
  document.getElementById('border-radius-value').textContent = radiusValue + 'px';
  document.getElementById('prop-button-padding').value = element.style.padding || '10px 20px';
}

function applyButtonProperties() {
  if (!currentSelectedElement) return;
  currentSelectedElement.innerText = document.getElementById('prop-button-text').value;
  currentSelectedElement.style.fontSize = document.getElementById('prop-button-font-size').value;
  currentSelectedElement.style.fontFamily = document.getElementById('prop-button-font-family').value;
  currentSelectedElement.style.color = document.getElementById('prop-button-text-color').value;
  currentSelectedElement.style.backgroundColor = document.getElementById('prop-button-bg-color').value;
  currentSelectedElement.style.fontWeight = document.getElementById('prop-button-font-weight').value;
  currentSelectedElement.style.borderRadius = document.getElementById('prop-button-border-radius').value + 'px';
  currentSelectedElement.style.padding = document.getElementById('prop-button-padding').value;
}

function openImagePropertiesPanel(element) {
  if (currentSelectedElement) {
    currentSelectedElement.classList.remove('selected');
    removeResizeHandles();
  }
  currentSelectedElement = element;
  element.classList.add('selected');

  showResizeHandles(element);

  const propertiesPanel = document.getElementById('properties-panel');
  const imageProperties = document.getElementById('image-properties');
  const propertiesTitle = document.getElementById('properties-title');

  propertiesPanel.classList.remove('hidden');
  document.getElementById('text-properties').classList.add('hidden');
  document.getElementById('button-properties').classList.add('hidden');
  imageProperties.classList.remove('hidden');
  document.getElementById('container-properties').classList.add('hidden');
  propertiesTitle.textContent = 'Image Properties';

  document.getElementById('prop-image-url').value = element.src || '';
  document.getElementById('prop-image-width').value = element.style.width || '150px';
  document.getElementById('prop-image-height').value = element.style.height || '150px';
  document.getElementById('prop-maintain-aspect').checked = element.dataset.maintainAspectRatio === 'true';

  const borderStyle = element.style.borderStyle || 'none';
  document.getElementById('prop-image-border-style').value = borderStyle;
  toggleBorderControls(borderStyle);

  const borderWidth = element.style.borderWidth ? parseInt(element.style.borderWidth) : 0;
  document.getElementById('prop-image-border-width').value = borderWidth;
  document.getElementById('border-width-value').textContent = borderWidth + 'px';
  document.getElementById('prop-image-border-color').value = rgbToHex(element.style.borderColor) || '#000000';

  const borderRadius = element.style.borderRadius ? parseInt(element.style.borderRadius) : 0;
  document.getElementById('prop-image-border-radius').value = borderRadius;
  document.getElementById('image-border-radius-value').textContent = borderRadius + 'px';

  const opacity = element.style.opacity ? Math.round(parseFloat(element.style.opacity) * 100) : 100;
  document.getElementById('prop-image-opacity').value = opacity;
  document.getElementById('image-opacity-value').textContent = opacity + '%';
}

function applyImageProperties() {
  if (!currentSelectedElement) return;

  const newUrl = document.getElementById('prop-image-url').value;
  const newWidth = document.getElementById('prop-image-width').value;
  const newHeight = document.getElementById('prop-image-height').value;
  const maintainAspect = document.getElementById('prop-maintain-aspect').checked;
  const borderStyle = document.getElementById('prop-image-border-style').value;
  const borderWidth = document.getElementById('prop-image-border-width').value;
  const borderColor = document.getElementById('prop-image-border-color').value;
  const borderRadius = document.getElementById('prop-image-border-radius').value;
  const opacity = document.getElementById('prop-image-opacity').value;

  if (newUrl) {
    currentSelectedElement.src = newUrl;
  }

  if (maintainAspect) {
    const widthNum = parseFloat(newWidth);
    const originalWidth = parseFloat(currentSelectedElement.dataset.originalWidth || 150);
    const originalHeight = parseFloat(currentSelectedElement.dataset.originalHeight || 150);
    const aspectRatio = originalHeight / originalWidth;
    currentSelectedElement.style.width = newWidth;
    currentSelectedElement.style.height = 'auto';
    currentSelectedElement.dataset.maintainAspectRatio = 'true';
  } else {
    currentSelectedElement.style.width = newWidth;
    currentSelectedElement.style.height = newHeight;
    currentSelectedElement.dataset.maintainAspectRatio = 'false';
  }

  currentSelectedElement.style.borderStyle = borderStyle;
  if (borderStyle !== 'none') {
    currentSelectedElement.style.borderWidth = borderWidth + 'px';
    currentSelectedElement.style.borderColor = borderColor;
  } else {
    currentSelectedElement.style.borderWidth = '0px';
  }

  currentSelectedElement.style.borderRadius = borderRadius + 'px';
  currentSelectedElement.style.opacity = (opacity / 100).toString();

  if (currentSelectedElement.classList.contains('image-element')) {
    updateResizeHandles(currentSelectedElement);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function toggleBorderControls(borderStyle) {
  const borderWidthGroup = document.getElementById('border-width-group');
  const borderColorGroup = document.getElementById('border-color-group');
  if (borderStyle === 'none') {
    borderWidthGroup.style.display = 'none';
    borderColorGroup.style.display = 'none';
  } else {
    borderWidthGroup.style.display = 'block';
    borderColorGroup.style.display = 'block';
  }
}

function toggleContainerBorderControls(borderStyle) {
  const borderWidthGroup = document.getElementById('container-border-width-group');
  const borderColorGroup = document.getElementById('container-border-color-group');
  if (borderStyle === 'none') {
    if (borderWidthGroup) borderWidthGroup.style.display = 'none';
    if (borderColorGroup) borderColorGroup.style.display = 'none';
  } else {
    if (borderWidthGroup) borderWidthGroup.style.display = 'block';
    if (borderColorGroup) borderColorGroup.style.display = 'block';
  }
}

function closePropertiesPanel() {
  const propertiesPanel = document.getElementById('properties-panel');
  propertiesPanel.classList.add('hidden');
  if (currentSelectedElement) {
    currentSelectedElement.classList.remove('selected');
    removeResizeHandles();
    currentSelectedElement = null;
  }
}

function rgbToHex(rgb) {
  if (!rgb) return '#000000';
  if (rgb.startsWith('#')) return rgb;
  const result = rgb.match(/\d+/g);
  if (!result) return '#000000';
  const r = parseInt(result[0]);
  const g = parseInt(result[1]);
  const b = parseInt(result[2]);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// ============================================================================
// RESIZE HANDLES FOR IMAGES
// ============================================================================

function showResizeHandles(element) {
  removeResizeHandles();
  const rect = element.getBoundingClientRect();
  const parentRect = previewBody.getBoundingClientRect();

  resizeHandlesContainer = previewDoc.createElement('div');
  resizeHandlesContainer.id = 'resize-handles';
  resizeHandlesContainer.style.position = 'absolute';
  resizeHandlesContainer.style.left = (element.offsetLeft - 4) + 'px';
  resizeHandlesContainer.style.top = (element.offsetTop - 4) + 'px';
  resizeHandlesContainer.style.width = (element.offsetWidth + 8) + 'px';
  resizeHandlesContainer.style.height = (element.offsetHeight + 8) + 'px';
  resizeHandlesContainer.style.zIndex = '99';
  resizeHandlesContainer.style.pointerEvents = 'none';

  const positions = [
    { name: 'tl', top: '-4px', left: '-4px', cursor: 'nwse-resize' },
    { name: 'tc', top: '-4px', left: 'calc(50% - 4px)', cursor: 'ns-resize' },
    { name: 'tr', top: '-4px', right: '-4px', cursor: 'nesw-resize' },
    { name: 'rc', top: 'calc(50% - 4px)', right: '-4px', cursor: 'ew-resize' },
    { name: 'br', bottom: '-4px', right: '-4px', cursor: 'nwse-resize' },
    { name: 'bc', bottom: '-4px', left: 'calc(50% - 4px)', cursor: 'ns-resize' },
    { name: 'bl', bottom: '-4px', left: '-4px', cursor: 'nesw-resize' },
    { name: 'lc', top: 'calc(50% - 4px)', left: '-4px', cursor: 'ew-resize' }
  ];

  positions.forEach(pos => {
    const handle = previewDoc.createElement('div');
    handle.className = 'resize-handle';
    handle.style.position = 'absolute';
    handle.style.width = '8px';
    handle.style.height = '8px';
    handle.style.background = 'white';
    handle.style.border = '2px solid #007bff';
    handle.style.borderRadius = '2px';
    handle.style.cursor = pos.cursor;
    handle.style.pointerEvents = 'auto';

    if (pos.top) handle.style.top = pos.top;
    if (pos.bottom) handle.style.bottom = pos.bottom;
    if (pos.left) handle.style.left = pos.left;
    if (pos.right) handle.style.right = pos.right;

    handle.addEventListener('mousedown', (e) => {
      isResizing = true;
      resizeImage(e, element, pos.name);
    });

    resizeHandlesContainer.appendChild(handle);
  });

  previewBody.appendChild(resizeHandlesContainer);
}

function resizeImage(e, element, position) {
  e.preventDefault();
  const startX = e.clientX;
  const startY = e.clientY;
  const startWidth = element.offsetWidth;
  const startHeight = element.offsetHeight;
  const startLeft = element.offsetLeft;
  const startTop = element.offsetTop;
  const aspectRatio = startHeight / startWidth;

  function onMouseMove(e) {
    let deltaX = e.clientX - startX;
    let deltaY = e.clientY - startY;

    let newWidth = startWidth;
    let newHeight = startHeight;
    let newLeft = startLeft;
    let newTop = startTop;

    if (element.dataset.maintainAspectRatio === 'true') {
      if (position.includes('c') && !position.includes('l') && !position.includes('r')) {
        newHeight = Math.max(20, startHeight + deltaY);
        newWidth = newHeight / aspectRatio;
      } else if (position.includes('c') && (position.includes('l') || position.includes('r'))) {
        newWidth = Math.max(20, startWidth + (position.includes('l') ? -deltaX : deltaX));
        newHeight = newWidth * aspectRatio;
      } else {
        newWidth = Math.max(20, startWidth + deltaX);
        newHeight = newWidth * aspectRatio;
      }
    } else {
      if (position.includes('r')) newWidth = Math.max(20, startWidth + deltaX);
      if (position.includes('l')) newWidth = Math.max(20, startWidth - deltaX);
      if (position.includes('b')) newHeight = Math.max(20, startHeight + deltaY);
      if (position.includes('t')) newHeight = Math.max(20, startHeight - deltaY);
    }

    if (position.includes('l')) newLeft = startLeft + (startWidth - newWidth);
    if (position.includes('t')) newTop = startTop + (startHeight - newHeight);

    element.style.width = newWidth + 'px';
    element.style.height = newHeight + 'px';
    element.style.left = newLeft + 'px';
    element.style.top = newTop + 'px';

    updateResizeHandles(element);

    document.getElementById('prop-image-width').value = newWidth + 'px';
    document.getElementById('prop-image-height').value = newHeight + 'px';
  }

  function onMouseUp() {
    previewDoc.removeEventListener('mousemove', onMouseMove);
    previewDoc.removeEventListener('mouseup', onMouseUp);
    isResizing = false;
  }

  previewDoc.addEventListener('mousemove', onMouseMove);
  previewDoc.addEventListener('mouseup', onMouseUp);
}

function updateResizeHandles(element) {
  if (resizeHandlesContainer) {
    resizeHandlesContainer.style.left = (element.offsetLeft - 4) + 'px';
    resizeHandlesContainer.style.top = (element.offsetTop - 4) + 'px';
    resizeHandlesContainer.style.width = (element.offsetWidth + 8) + 'px';
    resizeHandlesContainer.style.height = (element.offsetHeight + 8) + 'px';
  }
}

function removeResizeHandles() {
  if (resizeHandlesContainer && resizeHandlesContainer.parentNode) {
    resizeHandlesContainer.parentNode.removeChild(resizeHandlesContainer);
    resizeHandlesContainer = null;
  }
}

// ============================================================================
// DEVICE PREVIEW
// ============================================================================

function setDevicePreview(device) {
  currentDevice = device;
  
  // ✅ Thêm null check
  const previewContainer = document.getElementById('preview-container');
  const previewIframe = document.getElementById('preview');
  
  if (!previewContainer || !previewIframe) {
    console.error('Preview elements not found. Check HTML IDs.');
    return; // Dừng hàm nếu element không tồn tại
  }

  const devices = {
    desktop: { width: '100%', maxWidth: '1200px', height: 'auto', centered: false },
    tablet: { width: '768px', height: '1024px', centered: true },
    mobile: { width: '375px', height: '667px', centered: true }
  };

  const config = devices[device];
  previewIframe.style.width = config.width;
  previewIframe.style.maxWidth = config.maxWidth || 'none';
  previewIframe.style.height = config.height;

  if (config.centered) {
    previewContainer.style.display = 'flex';
    previewContainer.style.justifyContent = 'center';
    previewContainer.style.alignItems = 'flex-start';
  } else {
    previewContainer.style.display = 'block';
  }

  ['desktop-btn', 'tablet-btn', 'mobile-btn'].forEach(id => {
    const btn = document.getElementById(id);
    if (btn) { // ✅ Thêm check này
      btn.classList.toggle('active', (id.split('-')[0] === device));
    }
  });
}


// ============================================================================
// GENERATE CODE
// ============================================================================

function generateCode() {
  const codeOutput = document.getElementById('code-output');
  let htmlCode = '<!DOCTYPE html>\n<html>\n<head>\n';
  htmlCode += '  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">\n';
  htmlCode += '  <style>\n    body { margin: 0; padding: 20px; }\n  </style>\n';
  htmlCode += '</head>\n<body>\n';

  Array.from(previewBody.children).forEach(child => {
    htmlCode += generateElementCode(child, 1);
  });

  htmlCode += '</body>\n</html>';
  codeOutput.textContent = htmlCode;
}

function generateElementCode(element, depth) {
  const indent = '  '.repeat(depth);
  let code = '';

  if (element.classList.contains('container-label')) {
    return '';
  }

  if (element.classList.contains('container-element')) {
    const type = element.dataset.containerType;
    const style = getElementInlineStyles(element);

    if (type === 'col') {
      const colSize = element.dataset.colSize || '12';
      const colMd = element.dataset.colMd || 'auto';
      const colLg = element.dataset.colLg || 'auto';
      let classes = 'col';
      if (colSize !== 'auto') classes += ' col-' + colSize;
      if (colMd !== 'auto') classes += ' col-md-' + colMd;
      if (colLg !== 'auto') classes += ' col-lg-' + colLg;
      code += indent + '<div class="' + classes + '"' + (style ? ' style="' + style + '"' : '') + '>\n';
    } else if (type === 'row') {
      code += indent + '<div class="row"' + (style ? ' style="' + style + '"' : '') + '>\n';
    } else if (type === 'container') {
      code += indent + '<div class="container"' + (style ? ' style="' + style + '"' : '') + '>\n';
    } else {
      code += indent + '<section' + (style ? ' style="' + style + '"' : '') + '>\n';
    }

    Array.from(element.children).forEach(child => {
      code += generateElementCode(child, depth + 1);
    });

    if (type === 'col') {
      code += indent + '</div>\n';
    } else if (type === 'row') {
      code += indent + '</div>\n';
    } else if (type === 'container') {
      code += indent + '</div>\n';
    } else {
      code += indent + '</section>\n';
    }
  } else if (element.classList.contains('text-element')) {
    const style = getElementInlineStyles(element);
    code += indent + '<div' + (style ? ' style="' + style + '"' : '') + '>' + element.innerText + '</div>\n';
  } else if (element.classList.contains('button-element')) {
    const style = getElementInlineStyles(element);
    code += indent + '<button' + (style ? ' style="' + style + '"' : '') + '>' + element.innerText + '</button>\n';
  } else if (element.classList.contains('image-element')) {
    const style = getElementInlineStyles(element);
    code += indent + '<img src="' + element.src + '"' + (style ? ' style="' + style + '"' : '') + ' />\n';
  }

  return code;
}

function getElementInlineStyles(element) {
  let styles = [];
  for (let i = 0; i < element.style.length; i++) {
    const propName = element.style[i];
    const value = element.style.getPropertyValue(propName);
    if (value && value !== 'auto' && value !== 'none' && propName !== 'cursor') {
      styles.push(propName + ': ' + value);
    }
  }
  return styles.join('; ');
}

// ============================================================================
// INITIALIZE ON LOAD
// ============================================================================

document.addEventListener('DOMContentLoaded', function() {
  previewIframe = document.getElementById('preview');
  initializeIframe();

  // Attach event listeners
  if (document.getElementById('add-text-btn')) document.getElementById('add-text-btn').addEventListener('click', addText);
  if (document.getElementById('add-image-btn')) document.getElementById('add-image-btn').addEventListener('click', addImage);
  if (document.getElementById('add-button-btn')) document.getElementById('add-button-btn').addEventListener('click', addButton);
  if (document.getElementById('add-section-btn')) document.getElementById('add-section-btn').addEventListener('click', addSection);
  if (document.getElementById('add-container-btn')) document.getElementById('add-container-btn').addEventListener('click', addContainer);
  if (document.getElementById('add-row-btn')) document.getElementById('add-row-btn').addEventListener('click', addRow);
  if (document.getElementById('add-col-btn')) document.getElementById('add-col-btn').addEventListener('click', addCol);
  if (document.getElementById('generate-code-btn')) document.getElementById('generate-code-btn').addEventListener('click', generateCode);
  if (document.getElementById('apply-properties-btn')) document.getElementById('apply-properties-btn').addEventListener('click', applyProperties);
  if (document.getElementById('apply-button-properties-btn')) document.getElementById('apply-button-properties-btn').addEventListener('click', applyButtonProperties);
  if (document.getElementById('apply-image-properties-btn')) document.getElementById('apply-image-properties-btn').addEventListener('click', applyImageProperties);
  if (document.getElementById('apply-container-properties-btn')) document.getElementById('apply-container-properties-btn').addEventListener('click', applyContainerProperties);
  if (document.getElementById('close-panel-btn')) document.getElementById('close-panel-btn').addEventListener('click', closePropertiesPanel);
  if (document.getElementById('desktop-btn')) document.getElementById('desktop-btn').addEventListener('click', () => setDevicePreview('desktop'));
  if (document.getElementById('tablet-btn')) document.getElementById('tablet-btn').addEventListener('click', () => setDevicePreview('tablet'));
  if (document.getElementById('mobile-btn')) document.getElementById('mobile-btn').addEventListener('click', () => setDevicePreview('mobile'));

  setDevicePreview('desktop');
  previewBody.addEventListener('click', closePropertiesPanel);
});
