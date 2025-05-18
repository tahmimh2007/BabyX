const canvas = document.getElementById('whiteboard');
const ctx = canvas.getContext('2d');

// buffer for previews for shapes and selections
const buffer = document.createElement('canvas');
const bctx = buffer.getContext('2d');

// resize canvas and fill
function fit() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    buffer.width = canvas.width;
    buffer.height = canvas.height;

    ctx.fillStyle = '#131313';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

window.addEventListener('resize', fit);
fit();


let tool = 'draw';
let drawing = false;
let sx = 0, sy = 0; // start coords for shapes and selection
let selection = null;
let movingSel = false; // am dragging

const colorPicker = document.getElementById('color');
const brushSize = document.getElementById('brushSize');

/* tool switch */
function setTool(t, el) {
    tool = t;

    canvas.style.cursor = {
        eraser: 'cell',
        text: 'text',
        select: 'crosshair',
        move: selection ? 'move' : 'not-allowed'
    }[t] || 'crosshair';

    document.querySelectorAll('.tool-optn').forEach(b => b.style.backgroundColor = '');
    el && (el.style.backgroundColor = 'rgba(255,255,255,0.25)');
}

window.setTool = setTool;

// blending and alpa matches tool
function setBlend(t) {
    if (t === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.globalAlpha = 1;
    } else if (t === 'highlight') { // pen tool
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 0.1;
    } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = 1;
    }
}

function inRect(px, py, r) {
    return r && px >= r.x && px <= r.x + r.w && py >= r.y && py <= r.y + r.h;
}

// start interaction
canvas.addEventListener('mousedown', e => {
    const x = e.offsetX;
    const y = e.offsetY;
    sx = x;
    sy = y;

    // TEXT TOOL
    if (tool === 'text') {
        const txt = prompt('Enter text (use \\n for new lines):');
        if (txt) {
            ctx.fillStyle = colorPicker.value;
            ctx.font = '18px sans-serif';
            ctx.textBaseline = 'top';
            txt.split('\\n').forEach((ln, i) => ctx.fillText(ln, x, y + i * 22));
            sync();
        }
        return;
    }

    // MOVE TOOL if IN selection then drag
    if (tool === 'move' && selection && inRect(x, y, selection)) {
        movingSel = true;
        selection.dx = x - selection.x;
        selection.dy = y - selection.y;
        return;
    }

    // SELECT TOOL
    if (tool === 'select') {
        drawing = true;
        bctx.clearRect(0, 0, canvas.width, canvas.height);
        bctx.drawImage(canvas, 0, 0);
        return;
    }

    // FREEHAND & SHAPES
    if (['draw', 'eraser', 'highlight'].includes(tool)) {
        drawing = true;
        setBlend(tool);
        ctx.lineCap = 'round';
        ctx.lineWidth = brushSize.value;
        ctx.beginPath();
        ctx.moveTo(x, y);
    } else if (['line', 'rect', 'circle'].includes(tool)) {
        drawing = true;
        bctx.clearRect(0, 0, canvas.width, canvas.height);
        bctx.drawImage(canvas, 0, 0);
    }
});

canvas.addEventListener('mousemove', e => {
    const x = e.offsetX;
    const y = e.offsetY;

    // MOVE
    if (movingSel && selection) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(buffer, 0, 0);
        ctx.putImageData(selection.img, x - selection.dx, y - selection.dy);
        return;
    }

    if (!drawing) return;

    // FREEHAND
    if (['draw', 'eraser', 'highlight'].includes(tool)) {
        ctx.lineTo(x, y);
        ctx.strokeStyle = colorPicker.value;
        ctx.stroke();
    }

    // PREVIEW SHAPES & SELECTION
    else if (['line', 'rect', 'circle', 'select'].includes(tool)) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(buffer, 0, 0);

        ctx.strokeStyle = tool === 'select' ? '#fff8' : colorPicker.value + '88';
        ctx.setLineDash(tool === 'select' ? [6] : []);
        ctx.lineWidth = tool === 'select' ? 1 : brushSize.value;

        if (tool === 'line') {
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(x, y);
            ctx.stroke();
        } else if (tool === 'rect' || tool === 'select') {
            ctx.strokeRect(sx, sy, x - sx, y - sy);
        } else if (tool === 'circle') {
            const r = Math.hypot(x - sx, y - sy);
            ctx.beginPath();
            ctx.arc(sx, sy, r, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.setLineDash([]);
    }
});

// end interaction, commit change
canvas.addEventListener('mouseup', e => {
    const x = e.offsetX;
    const y = e.offsetY;

    // MOVE FINISH
    if (movingSel) {
        movingSel = false;
        selection.x = x - selection.dx;
        selection.y = y - selection.dy;
        sync();
        return;
    }

    // SELECTION FINISH
    if (drawing && tool === 'select') {
        const rx = Math.min(sx, x), ry = Math.min(sy, y);
        const w = Math.abs(x - sx), h = Math.abs(y - sy);
        if (w >= 5 && h >= 5) {
            selection = {x: rx, y: ry, w, h, img: ctx.getImageData(rx, ry, w, h)};
            bctx.drawImage(canvas, 0, 0);
        }
        drawing = false;
        sync();
        return;
    }

    // FLOOD
    if (tool === 'fill') {
        floodFill(x, y, hexToRgba(colorPicker.value));
        return;
    }

    // SHAPE
    if (drawing && ['line', 'rect', 'circle'].includes(tool)) {
        ctx.strokeStyle = colorPicker.value;
        ctx.lineWidth = brushSize.value;
        if (tool === 'line') {
            ctx.beginPath();
            ctx.moveTo(sx, sy);
            ctx.lineTo(x, y);
            ctx.stroke();
        } else if (tool === 'rect') {
            ctx.strokeRect(sx, sy, x - sx, y - sy);
        } else {
            const r = Math.hypot(x - sx, y - sy);
            ctx.beginPath();
            ctx.arc(sx, sy, r, 0, Math.PI * 2);
            ctx.stroke();
        }
    }

    // COMMIT FREEHAND
    if (drawing && ['draw', 'eraser', 'highlight'].includes(tool)) ctx.closePath();

    drawing = false;
    setBlend('draw');
    sync();
});

// cancel drawing on mouse leave
canvas.addEventListener('mouseout', () => {
    drawing = false;
    ctx.closePath();
    setBlend('draw');
});

// IMAGE UPLOAD
document.getElementById('imageLoader').addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            buffer.width = canvas.width;
            buffer.height = canvas.height;
            bctx.clearRect(0, 0, buffer.width, buffer.height);
            bctx.drawImage(canvas, 0, 0);

            sync();
        };
        img.src = ev.target.result;
    };
    reader.readAsDataURL(file);

    e.target.value = '';
});

// FLOOD FILL
function floodFill(startX, startY, fill) {
    const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const d = img.data, W = canvas.width, H = canvas.height,
        idx = (x, y) => (y * W + x) * 4,
        tgt = d.slice(idx(startX, startY), idx(startX, startY) + 4);

    if (tgt[0] === fill[0] && tgt[1] === fill[1] && tgt[2] === fill[2]) return;

    const st = [[startX, startY]],
        eq = i => d[i] === tgt[0] && d[i + 1] === tgt[1] && d[i + 2] === tgt[2] && d[i + 3] === tgt[3],
        set = i => {
            d[i] = fill[0];
            d[i + 1] = fill[1];
            d[i + 2] = fill[2];
            d[i + 3] = 255;
        };

    while (st.length) {
        const [x, y] = st.pop(), i = idx(x, y);
        if (!eq(i)) continue;
        set(i);
        x > 0 && st.push([x - 1, y]);
        x < W - 1 && st.push([x + 1, y]);
        y > 0 && st.push([x, y - 1]);
        y < H - 1 && st.push([x, y + 1]);
    }
    ctx.putImageData(img, 0, 0);
    sync();
}

function hexToRgba(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255, 255];
}

// SYNC SOCKET
const socket = io();

function sync() {
    socket.emit('sync_canvas', {image: canvas.toDataURL()});
}

socket.on('sync_canvas', d => {
    const img = new Image();
    img.onload = () => ctx.drawImage(img, 0, 0);
    img.src = d.image;
});
socket.on('clear', () => {
    ctx.fillStyle = '#131313';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    selection = null;
});

window.clearCanvas = () => {
    ctx.fillStyle = '#131313';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    socket.emit('clear');
};
window.saveCanvas = () => {
    const a = document.createElement('a');
    a.download = 'whiteboard.png';
    a.href = canvas.toDataURL();
    a.click();
};