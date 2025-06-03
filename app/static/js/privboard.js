let canvas = document.getElementById("whiteboard");
let ctx = canvas.getContext("2d");

let drawing = false;
let currentTool = "draw";
let brushSize = 4;
let brushColor = "#ffffff";

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener("resize", resizeCanvas);
resizeCanvas();

canvas.addEventListener("mousedown", e => {
    drawing = true;
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener("mousemove", e => {
    if (!drawing) return;
    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = brushColor;
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
});

canvas.addEventListener("mouseup", () => {
    drawing = false;
    ctx.beginPath();
});

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function setTool(tool, el) {
    currentTool = tool;
    document.querySelectorAll('.tool-optn').forEach(btn => btn.classList.remove('active'));
    el.classList.add('active');
}

document.getElementById("brushSize").addEventListener("input", e => {
    brushSize = e.target.value;
    document.getElementById("brushDisplay").innerText = brushSize;
});

document.getElementById("color").addEventListener("input", e => {
    brushColor = e.target.value;
});

document.getElementById("imageLoader").addEventListener("change", function(e){
    let reader = new FileReader();
    reader.onload = function(event){
        let img = new Image();
        img.onload = function(){
            ctx.drawImage(img, 0, 0);
        }
        img.src = event.target.result;
    }
    reader.readAsDataURL(e.target.files[0]);
});
