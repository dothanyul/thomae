
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

//               red        RO          orange       YO           yellow       YG           green      BG           blue        BP          purple       RP           red again
const colors = [[255,0,0], [255,63,0], [255,127,0], [255,191,0], [255,255,0], [127,204,0], [0,204,0], [0,145,178], [0,50,255], [96,0,193], [140,0,140], [189,0,127], [255,0,0]]

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
// TODO debug this, I think it's putting them in the wrong place or something sometimes
function scale() {
    let ct = canvas.getContext("2d");
    ct.font = '12px mono';
    ct.fillStyle = "#888";
    let max = 1, min = Math.floor(1/xmin);
    while (1/max >= xmax) max++;
    ct.fillText(max, Math.min((1/max - xmin) / (xmax - xmin) * canvas.width - 4 * max.toString().length, canvas.width - 8 * max.toString().length), 10);
    if (isFinite(min)) ct.fillText(min, (1/min - xmin) / (xmax - xmin) * canvas.width + 4, 10);
}

// draw a background, might do something interesting here or might not
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
//        let color = "#" + (y % scale >= 1 ? "00" : "44").repeat(3); // some close set bars for a y scale
        ct.strokeStyle = "#000";
        ct.strokeRect(0, y, canvas.width, 1);
    }
}

// draw Thomae's function on a negative-inverse y scale (with color corresponding to magnitude)
function thomaeInverse() {
    let ct = canvas.getContext("2d");
    if (power == 0) {
        for (let q = 1; q < maxq; q++) {
            for (let p = Math.floor(xmin * q) + (q == 1 ? 0 : 1); p <= xmax * q; p++) {
                if (gcd(Math.abs(p),q) == 1) {
                    ct.strokeStyle = color ? rainbow(q / canvas.height / yscale) : "#FFF";
                    ct.strokeRect((p/q - xmin) / (xmax - xmin) * canvas.width, q / yscale, 0, lines ? canvas.height - q / yscale : 2);
                }
            }
        }
    } else {
        for (let q = 1; q < maxq; q++) {
            for (let p = Math.floor(xmin * q) + (q == 1 ? 0 : 1); p <= xmax * q; p++) {
                if (gcd(Math.abs(p),q) == 1) {
                    height = canvas.height / Math.pow(q * yscale, 1 / power);
                    ct.strokeStyle = color ? rainbow(1 - height / canvas.height) : "#FFF";
                    ct.strokeRect((p/q - xmin) / (xmax - xmin) * canvas.width, canvas.height - height, 0, lines ? height : 2);
                }
            }
        }
    }
}

// TODO add option for a power scale, where you can change the denominator limit and the power?

// this function handles all keydown events
// left/right to scroll, up/down to zoom y around top, shift+up/down to zoom x around center
// zoom and scroll will be by some constant fraction of width or height
function keyHandler(keyEvent) {
    let width = xmax - xmin;
    switch (keyEvent.key) {

        case "i": // print some info about current state
            console.log("X axis: " + xmin + " to " + xmax);
            console.log("Y axis: " + -yscale * canvas.height + " to 0");
            let order = "Y axis scale: ";
            switch (power) {
                case 0: order += "negative inverse"; break;
                case 1: order += "linear"; break;
                case 2: order += "square root"; break;
                case 3: order += "cube root"; break;
                default: order += power + "th root"; break;
            }
            console.log(order);
            console.log("Denominator range: 1 to " + maxq);
            break;

        case "l": // toggle x scale labels
            labels = !labels;
            break;

        case "Enter": // toggle between lines and dots
            lines = !lines;
            break;

        case "c": // toggle color on/off
        case "C": // also case insensitive because why not
            color = !color;
            break;

        case " ": // increase/decrease root scale power (or switch to/from root scale/inverse scale)
            if (event.shiftKey) {
                if (power == 0) {
                    power = 0;
                } else if (power == 1) {
                    power = 0;
                    yscale = 0.5;
                } else {
                    power--;
                }
            } else {
                power++;
            }
            break;

        case "=": // increase resolution (upper limit on q)
        case "+": // case insensitive
            maxq *= 2;
            break;

        case "-": // decrease resolution
        case "_": // also case insensitive
            maxq /= 2;
            break;

        case "0": // reset zoom to default
            if (keyEvent.ctrlKey) {
                xmin = 0;
                xmax = 1;
                yscale = 1/2;
                maxq = canvas.height * yscale;
                break;
            }

        case "ArrowUp": // zoom in x or y
            if (keyEvent.shiftKey) {
                if (keyEvent.ctrlKey) {
                    xmin += width * motion * motion;
                    xmax -= width * motion * motion;
                    yscale *= (1 + motion * motion);
                } else {
                    xmin += width * motion;
                    xmax -= width * motion;
                    yscale *= (1 + motion);
                }
            } else {
                if (keyEvent.ctrlKey) {
                    yscale /= 1 + motion;
                } else {
                    yscale /= 1 + Math.pow(motion, 1/2);
                }
            }
            maxq = Math.max(maxq, canvas.height * yscale);
            break;

        case "ArrowDown": // zoom out x or y
            if (keyEvent.shiftKey) {
                if (keyEvent.ctrlKey) {
                    xmin -= width * motion * motion;
                    xmax += width * motion * motion;
                    yscale /= (1 + motion * motion);
                } else {
                    xmin -= width * motion;
                    xmax += width * motion;
                    yscale /= (1 + motion);
                }
            } else {
                if (keyEvent.ctrlKey) {
                    yscale *= 1 + motion;
                } else {
                    yscale *= 1 + Math.pow(motion, 1/2);
                }
            }
            maxq = Math.max(maxq, canvas.height * yscale);
            break;

        case "ArrowLeft": // scroll left
            if (keyEvent.ctrlKey) {
                xmax += width * motion * motion;
                xmin += width * motion * motion;
            } else {
                xmax += width * motion;
                xmin += width * motion;
            }
            break;

        case "ArrowRight": // scroll right
            if (keyEvent.ctrlKey) {
                xmax -= width * motion * motion;
                xmin -= width * motion * motion;
            } else {
                xmax -= width * motion;
                xmin -= width * motion;
            }
            break;

        default:
            console.log(keyEvent.key);
            return;
    }
    background();
    thomaeInverse();
    if (labels) scale();
}

// global so I don't have to worry about passing them to the handler
let canvas;
// scaling and moving factors
let xmin = 0, xmax = 1, yscale = 1/2, power = 0;
let maxq;
let motion = 1/16;
let labels = false, lines = true, color = true;

// setup config variables and start the program
function main() {
    canvas = document.getElementById("canvas");
    maxq = canvas.height * yscale;
    background();
    thomaeInverse();
    if (labels) scale();
    document.addEventListener("keydown", keyHandler);
}

// wait for the HTML to load
document.addEventListener("DOMContentLoaded", main);
