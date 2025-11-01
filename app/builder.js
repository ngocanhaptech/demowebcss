// builder.js

let elementId = 0;

function addText() {
    const textElement = document.createElement('div');
    textElement.className = 'element';
    textElement.id = 'element-' + elementId++;
    textElement.innerText = 'Editable Text';
    textElement.contentEditable = true;
    textElement.style.left = '50px';
    textElement.style.top = '50px';
    makeDraggable(textElement);
    document.getElementById('preview').appendChild(textElement);
}

function addImage() {
    const imgElement = document.createElement('img');
    imgElement.className = 'element';
    imgElement.id = 'element-' + elementId++;
    imgElement.src = 'https://via.placeholder.com/150';
    imgElement.style.left = '100px';
    imgElement.style.top = '100px';
    imgElement.style.width = '150px';
    makeDraggable(imgElement);
    document.getElementById('preview').appendChild(imgElement);
}

function addButton() {
    const btnElement = document.createElement('button');
    btnElement.className = 'element';
    btnElement.id = 'element-' + elementId++;
    btnElement.innerText = 'Click Me';
    btnElement.style.left = '150px';
    btnElement.style.top = '150px';
    makeDraggable(btnElement);
    document.getElementById('preview').appendChild(btnElement);
}

function makeDraggable(element) {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    element.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        document.onmousemove = elementDrag;
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
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

function generateCode() {
    const preview = document.getElementById('preview');
    const codeOutput = document.getElementById('code-output');
    let htmlCode = '<div style="position: relative;">\n';
    
    Array.from(preview.children).forEach(child => {
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