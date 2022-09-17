
// a and b should be positive integers
function gcd(a, b) {
    if (!a) {
        return 1;
    }
    if (b % a == 0) {
        return a;
    }
    return gcd(b % a, a);
}

// n should be a number between 0 and 255 inclusive
function hex(n) {
    let upper = Math.floor(n / 16) % 16;
    let lower = Math.floor(n % 16);
    return String.fromCharCode(upper + (upper < 10 ? 48 : 55)) + String.fromCharCode(lower + (lower < 10 ? 48 : 55));
}

//        red         RO          orange       YO           yellow       YG           green      BG           blue        BP          purple       RP           red again
colors = [[255,0,0], [255,63,0], [255,127,0], [255,191,0], [255,255,0], [127,204,0], [0,204,0], [0,140,168], [0,35,204], [76,0,153], [127,0,127], [189,0,102], [255,0,0]]

// n should be a float and the period of the rainbow is 1; factor is the relative brightness of the colors
function rainbow(n, factor=1) {
    n %= 1;
    let index = Math.floor(n * (colors.length - 1));
    let ret = "#";
    for (let channel=0; channel<3; channel++) {
        ret += hex((colors[index][channel] + (colors[index+1][channel] - colors[index][channel]) * (n * (colors.length - 1) - index)) * factor);
    }
    return ret;
}

// these functions actually draw things

// background, currently putting some close set bars behind just to have a y scale
function background() {
    let ct = canvas.getContext("2d");
    let scale = 5 / yscale;
    while (scale < 10) {
        scale *= 2;
    }
    while (scale > 20) {
        scale /= 2;
    }
    for (let y=0; y<canvas.height; y++) {
        let color = "#" + (y % scale >= 1 ? "44" : "00").repeat(3);
        ct.strokeStyle = color;
        ct.strokeRect(0, y, canvas.width, 1);
    }
}

// draw Thomae's function on a negative-inverse y scale (with color corresponding to magnitude)
// rate controls rainbow period, min and max are x extremes (y scale is constant)
function thomae() {
    let ct = canvas.getContext("2d");
    for (let q = 1; q < canvas.height * yscale; q++) {
        for (let p = Math.floor(xmin * q); p <= xmax * q; p++) {
            if (gcd(Math.abs(p),q) == 1) {
                if (drawInverse) {
                    ct.strokeStyle = rainbow(q / rate / yscale);
                    ct.strokeRect((p/q - xmin) / (xmax - xmin) * canvas.width, Math.floor(q / yscale), 0, canvas.height);
                }
                if (drawLinear) {
                    ct.strokeStyle = "white";
                    ct.strokeRect((p/q - xmin) / (xmax - xmin) * canvas.width, canvas.height * 2 / q / yscale, 0, -canvas.height * 2);
                }
            }
        }
    }
}

// this function handles the interface for zooming
// left/right to scroll, up/down to zoom y around top, shift+up/down to zoom x around center
// zoom and scroll will be by 10% of current width or height
function keyHandler(keyEvent) {
    switch (keyEvent.key) {
        case "ArrowUp":
            if (keyEvent.shiftKey) {
                xmin += (xmax - xmin) * motion;
                xmax += (xmax - xmin) * motion;
            } else {
                yscale /= 1 + motion;
            }
            break;
        case "ArrowDown":
            if (keyEvent.shiftKey) {
                xmin -= (xmax - xmin) * motion;
                xmax -= (xmax - xmin) * motion;
            } else {
                yscale *= 1 + motion;
            }
            break;
        case "ArrowLeft":
            if (keyEvent.ctrlKey) {
                if (keyEvent.shiftKey) {
                    xmin = xmax - (xmax - xmin) * (1 + motion);
                } else {
                    xmax = xmin + (xmax - xmin) / (1 + motion);
                }
            } else {
                let width = xmax - xmin;
                xmax -= width * motion;
                xmin -= width * motion;
            }
            break;
        case "ArrowRight":
            if (keyEvent.ctrlKey) {
                if (keyEvent.shiftKey) {
                    xmax = xmin + (xmax - xmin) * (1 + motion);
                } else {
                    xmin = xmax - (xmax - xmin) / (1 + motion);
                }
            } else {
                let width = xmax - xmin;
                xmax += width * motion;
                xmin += width * motion;
            }
            break;
        case " ":
            if (keyEvent.shiftKey) {
                drawInverse = !drawInverse;
            } else {
                drawLinear = !drawLinear;
            }
            break;
        default:
            console.log(keyEvent.key);
            return;
    }
    background();
    thomae();
}

// global so I don't have to worry about passing them to the handler
let canvas;
const rate = 1076;
// scaling and moving factors
let xmin = 0, xmax = 1, yscale = 0.5;
let motion = 1/16;
let drawInverse = true, drawLinear = false;

// setup config variables and start the program
function main() {
    canvas = document.getElementById("canvas");
    background();
    thomae();
    document.addEventListener("keydown", keyHandler);
}

// wait for the HTML to load
document.addEventListener("DOMContentLoaded", main);
