const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");
c.imageSmoothingEnabled = false;

// canvas.width = 1024;
// canvas.height = 576;

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

export { canvas, c };