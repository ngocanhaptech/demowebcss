// Global variables
let elementId = 0;
const previewIframe = document.getElementById('preview');
let previewDoc = null;
let previewBody = null;
let currentSelectedElement = null;
let resizeHandlesContainer = null;
let isResizing = false;

// Initialize iframe
function initializeIframe() {
    previewDoc = previewIframe.contentDocument || previewIframe.contentWindow.document;
    previewDoc.open();
    previewDoc.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body {
                    margin: 0;
                    padding: 20px;
                    font-family: Arial, sans-serif;
                    position: relative;
                    min-height: 100vh;
                }
                .element {
                    position: absolute;
                    cursor: move;
                    padding: 8px;
                    min-width: 50px;
                    min-height: 30px;
                    transition: box-shadow 0.2s ease;
                }
                .element:hover {
                    box-shadow: 0 0 0 2px rgba(33, 128, 141, 0.3);
                }
                .element.selected {
                    box-shadow: 0 0 0 3px rgba(33, 128, 141, 0.6) !important;
                }
                .resize-handles {
                    position: absolute;
                    pointer-events: none;
                    z-index: 1000;
                }
                .resize-handle {
                    position: absolute;
                    width: 8px;
                    height: 8px;
                    background: #ffffff;
                    border: 2px solid #007bff;
                    border-radius: 2px;
                    pointer-events: all;
                    z-index: 1001;
                }
                .resize-handle.tl { top: -4px; left: -4px; cursor: nwse-resize; }
                .resize-handle.tc { top: -4px; left: calc(50% - 4px); cursor: ns-resize; }
                .resize-handle.tr { top: -4px; right: -4px; cursor: nesw-resize; }
                .resize-handle.rc { top: calc(50% - 4px); right: -4px; cursor: ew-resize; }
                .resize-handle.br { bottom: -4px; right: -4px; cursor: nwse-resize; }
                .resize-handle.bc { bottom: -4px; left: calc(50% - 4px); cursor: ns-resize; }
                .resize-handle.bl { bottom: -4px; left: -4px; cursor: nesw-resize; }
                .resize-handle.lc { top: calc(50% - 4px); left: -4px; cursor: ew-resize; }
            </style>
        </head>
        <body>
        </body>
        </html>
    `);
    previewDoc.close();
    previewBody = previewDoc.body;
}

// Add Text Element
function addText() {
    const textElement = previewDoc.createElement('div');
    textElement.className = 'element text-element';
    textElement.id = 'element-' + elementId++;
    textElement.innerText = 'Editable Text';
    textElement.contentEditable = false; // Changed to false to prevent inline editing
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

// Add Image Element
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

// Add Button Element
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

// Make element draggable
function makeDraggable(element, doc) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;
    
    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        
        // Don't drag if resizing
        if (isResizing) {
            return;
        }
        
        e.preventDefault();
        e.stopPropagation();
        
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        doc.onmouseup = closeDragElement;
        doc.onmousemove = elementDrag;
        
        isDragging = false;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        
        isDragging = true;
        
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        element.style.top = (element.offsetTop - pos2) + "px";
        element.style.left = (element.offsetLeft - pos1) + "px";
    }

    function closeDragElement(e) {
        doc.onmouseup = null;
        doc.onmousemove = null;
        
        // If not dragging, treat as a click
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

// Add click handler for text elements
function addTextClickHandler(element) {
    element.addEventListener('click', function(e) {
        if (!element.style.cursor || element.style.cursor === 'move') {
            e.stopPropagation();
        }
    });
}

// Add click handler for button elements
function addButtonClickHandler(element) {
    element.addEventListener('click', function(e) {
        if (!element.style.cursor || element.style.cursor === 'move') {
            e.stopPropagation();
        }
    });
}

// Add click handler for image elements
function addImageClickHandler(element) {
    element.addEventListener('click', function(e) {
        if (!element.style.cursor || element.style.cursor === 'move') {
            e.stopPropagation();
        }
    });
}

// Open properties panel for text element
function openPropertiesPanel(element) {
    // Remove previous selection
    if (currentSelectedElement) {
        currentSelectedElement.classList.remove('selected');
        removeResizeHandles();
    }
    
    // Set current selection
    currentSelectedElement = element;
    element.classList.add('selected');
    
    // Show properties panel
    const propertiesPanel = document.getElementById('properties-panel');
    const textProperties = document.getElementById('text-properties');
    const buttonProperties = document.getElementById('button-properties');
    const propertiesTitle = document.getElementById('properties-title');
    
    propertiesPanel.classList.remove('hidden');
    textProperties.classList.remove('hidden');
    buttonProperties.classList.add('hidden');
    propertiesTitle.textContent = 'Text Properties';
    
    // Populate properties
    document.getElementById('prop-text-content').value = element.innerText;
    document.getElementById('prop-font-size').value = element.style.fontSize || '16px';
    document.getElementById('prop-font-family').value = element.style.fontFamily || 'Arial';
    document.getElementById('prop-text-color').value = rgbToHex(element.style.color) || '#000000';
    document.getElementById('prop-font-weight').value = element.style.fontWeight || 'normal';
    document.getElementById('prop-text-align').value = element.style.textAlign || 'left';
    document.getElementById('prop-text-decoration').value = element.style.textDecoration || 'none';
    document.getElementById('prop-font-style').value = element.style.fontStyle || 'normal';
}

// Open properties panel for button element
function openButtonPropertiesPanel(element) {
    // Remove previous selection
    if (currentSelectedElement) {
        currentSelectedElement.classList.remove('selected');
        removeResizeHandles();
    }
    
    // Set current selection
    currentSelectedElement = element;
    element.classList.add('selected');
    
    // Show properties panel
    const propertiesPanel = document.getElementById('properties-panel');
    const textProperties = document.getElementById('text-properties');
    const buttonProperties = document.getElementById('button-properties');
    const propertiesTitle = document.getElementById('properties-title');
    
    propertiesPanel.classList.remove('hidden');
    textProperties.classList.add('hidden');
    buttonProperties.classList.remove('hidden');
    propertiesTitle.textContent = 'Button Properties';
    
    // Populate button properties
    document.getElementById('prop-button-text').value = element.innerText;
    document.getElementById('prop-button-font-size').value = element.style.fontSize || '16px';
    document.getElementById('prop-button-font-family').value = element.style.fontFamily || 'Arial';
    document.getElementById('prop-button-text-color').value = rgbToHex(element.style.color) || '#ffffff';
    document.getElementById('prop-button-bg-color').value = rgbToHex(element.style.backgroundColor) || '#007bff';
    document.getElementById('prop-button-font-weight').value = element.style.fontWeight || 'normal';
    
    // Handle border radius
    const borderRadius = element.style.borderRadius || '5px';
    const radiusValue = parseInt(borderRadius);
    document.getElementById('prop-button-border-radius').value = radiusValue;
    document.getElementById('border-radius-value').textContent = radiusValue + 'px';
    
    document.getElementById('prop-button-padding').value = element.style.padding || '10px 20px';
}

// Open properties panel for image element
function openImagePropertiesPanel(element) {
    // Remove previous selection
    if (currentSelectedElement) {
        currentSelectedElement.classList.remove('selected');
        removeResizeHandles();
    }
    
    // Set current selection
    currentSelectedElement = element;
    element.classList.add('selected');
    
    // Show resize handles for image
    showResizeHandles(element);
    
    // Show properties panel
    const propertiesPanel = document.getElementById('properties-panel');
    const textProperties = document.getElementById('text-properties');
    const buttonProperties = document.getElementById('button-properties');
    const imageProperties = document.getElementById('image-properties');
    const propertiesTitle = document.getElementById('properties-title');
    
    propertiesPanel.classList.remove('hidden');
    textProperties.classList.add('hidden');
    buttonProperties.classList.add('hidden');
    imageProperties.classList.remove('hidden');
    propertiesTitle.textContent = 'Image Properties';
    
    // Populate image properties
    document.getElementById('prop-image-url').value = element.src || '';
    document.getElementById('prop-image-width').value = element.style.width || '150px';
    document.getElementById('prop-image-height').value = element.style.height || '150px';
    document.getElementById('prop-maintain-aspect').checked = element.dataset.maintainAspectRatio === 'true';
    
    const borderStyle = element.style.borderStyle || 'none';
    document.getElementById('prop-image-border-style').value = borderStyle;
    
    // Show/hide border controls based on border style
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

// Toggle border controls visibility
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

// Close properties panel
function closePropertiesPanel() {
    const propertiesPanel = document.getElementById('properties-panel');
    propertiesPanel.classList.add('hidden');
    
    if (currentSelectedElement) {
        currentSelectedElement.classList.remove('selected');
        removeResizeHandles();
        currentSelectedElement = null;
    }
}

// Apply properties to selected element
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

// Apply button properties to selected button element
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

// Apply image properties to selected image element
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
    
    // Update image source
    if (newUrl) {
        currentSelectedElement.src = newUrl;
    }
    
    // Handle aspect ratio
    if (maintainAspect) {
        // Store the aspect ratio calculation
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
    
    // Update border
    currentSelectedElement.style.borderStyle = borderStyle;
    if (borderStyle !== 'none') {
        currentSelectedElement.style.borderWidth = borderWidth + 'px';
        currentSelectedElement.style.borderColor = borderColor;
    } else {
        currentSelectedElement.style.borderWidth = '0px';
    }
    
    // Update border radius
    currentSelectedElement.style.borderRadius = borderRadius + 'px';
    
    // Update opacity
    currentSelectedElement.style.opacity = (opacity / 100).toString();
    
    // Update resize handles position
    if (currentSelectedElement.classList.contains('image-element')) {
        updateResizeHandles(currentSelectedElement);
    }
}

// Convert RGB to Hex
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

// Generate HTML Code
function generateCode() {
    const codeOutput = document.getElementById('code-output');
    let htmlCode = '<div style="position: relative; min-height: 400px;">\n';
    
    Array.from(previewBody.children).forEach(child => {
        const clone = child.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.left = child.style.left;
        clone.style.top = child.style.top;
        
        // Copy all text styles for text elements
        if (child.classList.contains('text-element')) {
            clone.style.fontSize = child.style.fontSize;
            clone.style.fontFamily = child.style.fontFamily;
            clone.style.color = child.style.color;
            clone.style.fontWeight = child.style.fontWeight;
            clone.style.textAlign = child.style.textAlign;
            clone.style.textDecoration = child.style.textDecoration;
            clone.style.fontStyle = child.style.fontStyle;
        }
        
        // Copy all button styles for button elements
        if (child.classList.contains('button-element')) {
            clone.style.fontSize = child.style.fontSize;
            clone.style.fontFamily = child.style.fontFamily;
            clone.style.color = child.style.color;
            clone.style.backgroundColor = child.style.backgroundColor;
            clone.style.fontWeight = child.style.fontWeight;
            clone.style.borderRadius = child.style.borderRadius;
            clone.style.padding = child.style.padding;
            clone.style.border = 'none';
        }
        
        // Copy all image styles for image elements
        if (child.classList.contains('image-element')) {
            clone.style.width = child.style.width;
            clone.style.height = child.style.height;
            clone.style.borderStyle = child.style.borderStyle;
            if (child.style.borderStyle !== 'none') {
                clone.style.borderWidth = child.style.borderWidth;
                clone.style.borderColor = child.style.borderColor;
            }
            clone.style.borderRadius = child.style.borderRadius;
            clone.style.opacity = child.style.opacity;
        }
        
        clone.removeAttribute('id');
        clone.removeAttribute('class');
        clone.removeAttribute('contenteditable');
        clone.removeAttribute('data-maintain-aspect-ratio');
        clone.removeAttribute('data-original-width');
        clone.removeAttribute('data-original-height');
        clone.style.cursor = 'default';
        
        htmlCode += '  ' + clone.outerHTML + '\n';
    });
    
    htmlCode += '</div>';
    codeOutput.textContent = htmlCode;
}

// Create resize handles for image
function showResizeHandles(imageElement) {
    removeResizeHandles();
    
    const container = previewDoc.createElement('div');
    container.className = 'resize-handles';
    container.id = 'resize-handles';
    
    // Create 8 handles
    const handles = [
        { class: 'tl', cursor: 'nwse-resize' },  // top-left
        { class: 'tc', cursor: 'ns-resize' },    // top-center
        { class: 'tr', cursor: 'nesw-resize' },  // top-right
        { class: 'rc', cursor: 'ew-resize' },    // right-center
        { class: 'br', cursor: 'nwse-resize' },  // bottom-right
        { class: 'bc', cursor: 'ns-resize' },    // bottom-center
        { class: 'bl', cursor: 'nesw-resize' },  // bottom-left
        { class: 'lc', cursor: 'ew-resize' }     // left-center
    ];
    
    handles.forEach(handleInfo => {
        const handle = previewDoc.createElement('div');
        handle.className = 'resize-handle ' + handleInfo.class;
        handle.dataset.position = handleInfo.class;
        addResizeHandler(handle, imageElement);
        container.appendChild(handle);
    });
    
    previewBody.appendChild(container);
    resizeHandlesContainer = container;
    updateResizeHandles(imageElement);
}

// Remove resize handles
function removeResizeHandles() {
    if (resizeHandlesContainer) {
        resizeHandlesContainer.remove();
        resizeHandlesContainer = null;
    }
}

// Update resize handles position
function updateResizeHandles(imageElement) {
    if (!resizeHandlesContainer) return;
    
    const rect = imageElement.getBoundingClientRect();
    const iframeRect = previewIframe.getBoundingClientRect();
    
    resizeHandlesContainer.style.left = imageElement.offsetLeft + 'px';
    resizeHandlesContainer.style.top = imageElement.offsetTop + 'px';
    resizeHandlesContainer.style.width = imageElement.offsetWidth + 'px';
    resizeHandlesContainer.style.height = imageElement.offsetHeight + 'px';
}

// Add resize handler to handle
function addResizeHandler(handle, imageElement) {
    handle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        isResizing = true;
        const position = handle.dataset.position;
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = imageElement.offsetWidth;
        const startHeight = imageElement.offsetHeight;
        const startLeft = imageElement.offsetLeft;
        const startTop = imageElement.offsetTop;
        const maintainAspect = imageElement.dataset.maintainAspectRatio === 'true';
        const aspectRatio = startHeight / startWidth;
        
        function onMouseMove(e) {
            const deltaX = e.clientX - startX;
            const deltaY = e.clientY - startY;
            
            let newWidth = startWidth;
            let newHeight = startHeight;
            let newLeft = startLeft;
            let newTop = startTop;
            
            // Calculate new dimensions based on handle position
            switch(position) {
                case 'tl': // top-left
                    newWidth = startWidth - deltaX;
                    newHeight = maintainAspect ? newWidth * aspectRatio : startHeight - deltaY;
                    newLeft = startLeft + deltaX;
                    newTop = maintainAspect ? startTop + (startHeight - newHeight) : startTop + deltaY;
                    break;
                case 'tc': // top-center
                    newHeight = startHeight - deltaY;
                    newTop = startTop + deltaY;
                    newWidth = startWidth; // width unchanged
                    break;
                case 'tr': // top-right
                    newWidth = startWidth + deltaX;
                    newHeight = maintainAspect ? newWidth * aspectRatio : startHeight - deltaY;
                    newTop = maintainAspect ? startTop + (startHeight - newHeight) : startTop + deltaY;
                    break;
                case 'rc': // right-center
                    newWidth = startWidth + deltaX;
                    newHeight = startHeight; // height unchanged
                    break;
                case 'br': // bottom-right
                    newWidth = startWidth + deltaX;
                    newHeight = maintainAspect ? newWidth * aspectRatio : startHeight + deltaY;
                    break;
                case 'bc': // bottom-center
                    newHeight = startHeight + deltaY;
                    newWidth = startWidth; // width unchanged
                    break;
                case 'bl': // bottom-left
                    newWidth = startWidth - deltaX;
                    newHeight = maintainAspect ? newWidth * aspectRatio : startHeight + deltaY;
                    newLeft = startLeft + deltaX;
                    break;
                case 'lc': // left-center
                    newWidth = startWidth - deltaX;
                    newLeft = startLeft + deltaX;
                    newHeight = startHeight; // height unchanged
                    break;
            }
            
            // Apply minimum size constraints
            if (newWidth < 20) {
                newWidth = 20;
                newLeft = startLeft; // Don't move if at minimum
            }
            if (newHeight < 20) {
                newHeight = 20;
                newTop = startTop; // Don't move if at minimum
            }
            
            // Apply new dimensions
            imageElement.style.width = newWidth + 'px';
            imageElement.style.height = newHeight + 'px';
            imageElement.style.left = newLeft + 'px';
            imageElement.style.top = newTop + 'px';
            
            // Update properties panel
            document.getElementById('prop-image-width').value = newWidth + 'px';
            document.getElementById('prop-image-height').value = newHeight + 'px';
            
            // Update resize handles
            updateResizeHandles(imageElement);
        }
        
        function onMouseUp(e) {
            previewDoc.removeEventListener('mousemove', onMouseMove);
            previewDoc.removeEventListener('mouseup', onMouseUp);
            isResizing = false;
        }
        
        previewDoc.addEventListener('mousemove', onMouseMove);
        previewDoc.addEventListener('mouseup', onMouseUp);
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize iframe
    initializeIframe();
    
    // Attach event listeners
    document.getElementById('add-text-btn').addEventListener('click', addText);
    document.getElementById('add-image-btn').addEventListener('click', addImage);
    document.getElementById('add-button-btn').addEventListener('click', addButton);
    document.getElementById('generate-code-btn').addEventListener('click', generateCode);
    document.getElementById('close-properties').addEventListener('click', closePropertiesPanel);
    document.getElementById('apply-properties').addEventListener('click', applyProperties);
    document.getElementById('apply-button-properties').addEventListener('click', applyButtonProperties);
    
    // Border radius slider update
    document.getElementById('prop-button-border-radius').addEventListener('input', function(e) {
        document.getElementById('border-radius-value').textContent = e.target.value + 'px';
    });
    
    // Image properties event listeners
    document.getElementById('apply-image-properties').addEventListener('click', applyImageProperties);
    
    // Image border style change
    document.getElementById('prop-image-border-style').addEventListener('change', function(e) {
        toggleBorderControls(e.target.value);
    });
    
    // Image border width slider
    document.getElementById('prop-image-border-width').addEventListener('input', function(e) {
        document.getElementById('border-width-value').textContent = e.target.value + 'px';
    });
    
    // Image border radius slider
    document.getElementById('prop-image-border-radius').addEventListener('input', function(e) {
        document.getElementById('image-border-radius-value').textContent = e.target.value + 'px';
    });
    
    // Image opacity slider
    document.getElementById('prop-image-opacity').addEventListener('input', function(e) {
        document.getElementById('image-opacity-value').textContent = e.target.value + '%';
    });
    
    // Click outside to deselect
    setTimeout(() => {
        previewDoc.addEventListener('click', function(e) {
            // Check if click is on body (not on any element)
            if (e.target === previewBody) {
                if (currentSelectedElement) {
                    currentSelectedElement.classList.remove('selected');
                    removeResizeHandles();
                    currentSelectedElement = null;
                }
                closePropertiesPanel();
            }
        });
    }, 100);
});