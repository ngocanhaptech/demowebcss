// builder.js

let elementId = 0;
const previewIframe = document.getElementById('preview');
const previewDoc = previewIframe.contentDocument;
const previewBody = previewDoc.body;

function addText() {
    const textElement = previewDoc.createElement('div');
    textElement.className = 'element';
    textElement.id = 'element-' + elementId++;
    textElement.innerText = 'Editable Text';
    textElement.contentEditable = true;
    textElement.style.left = '50px';
    textElement.style.top = '50px';
    makeDraggable(textElement, previewDoc);
    previewBody.appendChild(textElement);
}

function addImage() {
    const imgElement = previewDoc.createElement('img');
    imgElement.className = 'element';
    imgElement.id = 'element-' + elementId++;
    imgElement.src = 'https://via.placeholder.com/150';
    imgElement.style.left = '100px';
    imgElement.style.top = '100px';
    imgElement.style.width = '150px';
    makeDraggable(imgElement, previewDoc);
    previewBody.appendChild(imgElement);
}

function addButton() {
    const btnElement = previewDoc.createElement('button');
    btnElement.className = 'element';
    btnElement.id = 'element-' + elementId++;
    btnElement.innerText = 'Click Me';
    btnElement.style.left = '150px';
    btnElement.style.top = '150px';
    makeDraggable(btnElement, previewDoc);
    previewBody.appendChild(btnElement);
}

function makeDraggable(element, doc) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        doc.onmouseup = closeDragElement;
        doc.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
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
    }
}

function generateCode() {
    const codeOutput = document.getElementById('code-output');
    let htmlCode = '<div style="position: relative;">\n';
    
    Array.from(previewBody.children).forEach(child => {
        const clone = child.cloneNode(true);
        clone.style.position = 'absolute';
        clone.style.left = child.style.left;
        clone.style.top = child.style.top;
        clone.removeAttribute('id');
        clone.removeAttribute('class');
        clone.removeAttribute('contenteditable');
        htmlCode += '  ' + clone.outerHTML + '\n';
    });
    
    htmlCode += '</div>';
    codeOutput.textContent = htmlCode;
}