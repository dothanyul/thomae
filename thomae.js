
// get the deepest integer root of an integer
// (i.e. if n is not a perfect power, return n, but e.g. return 3 for 3, 9, 27, 81, ...)
function root(n) {
    if (n == 1 || n == 0) return n;
    let k = 2;
    while (true) {
        let r = Math.pow(n, 1/k);
        if (r % 1 == 0) {
            return root(Math.pow(n, 1/k));
        }
        if (Math.pow(2, k) > n) {
            return n;
        }
        k++;
    }
}

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
const colors = [[255,0,0], [255,63,0], [255,127,0], [255,191,0], [255,255,0], [127,204,0], [0,204,0], [0,140,168], [0,35,204], [76,0,153], [127,0,127], [189,0,102], [255,0,0]]

// n should be a float and the period of the rainbow is 1; factor is the relative brightness of the colors
function rainbow(n, factor=1) {
    n %= 1;
    if (n<0) {
        n += 1;
    }
    let index = Math.floor(n * (colors.length - 1));
    let ret = "#";
    for (let channel=0; channel<3; channel++) {
        ret += hex((colors[index][channel] + (colors[index+1][channel] - colors[index][channel]) * (n * (colors.length - 1) - index)) * factor);
    }
    return ret;
}

// these functions actually draw things

// put some x axis scale labels on
function scale() {
    let ct = canvas.getContext("2d");
    ct.font = '12px mono';
    ct.fillStyle = "#888";
    let max = 1, min = Math.floor(1/xmin);
    while (1/max >= xmax) max++;
    ct.fillText(max, Math.min((1/max - xmin) / (xmax - xmin) * canvas.width - 4 * max.toString().length, canvas.width - 8 * max.toString().length), 10);
    if (isFinite(min)) ct.fillText(min, (1/min - xmin) / (xmax - xmin) * canvas.width + 4, 10);
}

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
//        let color = "#" + (y % scale >= 1 ? "00" : "44").repeat(3);
        ct.strokeStyle = "#000";
        ct.strokeRect(0, y, canvas.width, 1);
    }
}

// draw Thomae's function on a negative-inverse y scale (with color corresponding to magnitude)
function thomaeInverse() {
    let ct = canvas.getContext("2d");
    for (let q = 1; q < canvas.height * yscale; q++) {
        for (let p = Math.floor(xmin * q) + (q == 1 ? 0 : 1); p <= xmax * q; p++) {
            if (gcd(Math.abs(p),q) == 1) {
                ct.strokeStyle = rainbow(q / rate / yscale);
                ct.strokeRect((p/q - xmin) / (xmax - xmin) * canvas.width, Math.floor(q / yscale), 0, canvas.height);
            }
        }
    }
}

// draw Thomae's function on a negative-linear y scale (with color corresponding to magnitude)
function thomaeLinear() {
    let ct = canvas.getContext("2d");
    ct.strokeStyle = "white";
    for (let q = 1; q < canvas.height / Math.sqrt(yscale * (xmax - xmin)) / 4; q++) {
        for (let p = Math.floor(xmin * q) + (q == 1 ? 0 : 1); p <= xmax * q; p++) {
            if (gcd(Math.abs(p),q) == 1) {
//                ct.strokeStyle = rainbow( 1 / q / yscale);
                ct.strokeRect((p/q - xmin) / (xmax - xmin) * canvas.width, canvas.height * 2 / q / yscale, 0, -canvas.height * 2 / q / yscale);
            }
        }
    }
}

// this function handles the interface for zooming
// left/right to scroll, up/down to zoom y around top, shift+up/down to zoom x around center
// zoom and scroll will be by 10% of current width or height
// spacebar to toggle linear on/off, shift+spacebar to toggle inverse on/off
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
            } else if (keyEvent.ctrlKey) {
                labels = !labels;
            } else {
                drawLinear = !drawLinear;
            }
            break;
        case "0":
            if (keyEvent.ctrlKey) {
                xmin = 0;
                xmax = 1;
                yscale = 1/2;
                break;
            }
        default:
            return;
    }
    background();
    if (drawLinear) thomaeLinear();
    if (drawInverse) thomaeInverse();
    if (labels) scale();
}

// global so I don't have to worry about passing them to the handler
let canvas;
const rate = 1076;
// scaling and moving factors
let xmin = 0, xmax = 0.1, yscale = 1/10;
let motion = 1/16;
let drawInverse = true, drawLinear = true, labels = false;

// setup config variables and start the program
function main() {
    canvas = document.getElementById("canvas");
    background();
    if (drawLinear) thomaeLinear();
    if (drawInverse) thomaeInverse();
    if (labels) scale();
    document.addEventListener("keydown", keyHandler);
}

// wait for the HTML to load
document.addEventListener("DOMContentLoaded", main);
