
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

// list of all primes up to n
function primes(n) {
    let ret = [];
    for (let i = 2; i <= n; i++) {
        ret.push(i);
    }
    for (i = 0; i < Math.sqrt(ret.length); i++) {
        ret = ret.filter(n => n <= ret[i] || n % ret[i] > 0);
    }
    return ret;
}

// largest prime factor of a number
function factor(a) {
    let ret = 1;
    for (let p of primes(a)) {
        if (a % p == 0) ret = p;
    }
    return ret;
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
    n = !isFinite(n) ? 0 : (n % 1 + 1) % 1;
    const index = Math.floor(n * (colors.length - 1));
    let ret = "#";
    for (let channel=0; channel<3; channel++) {
        ret += hex((colors[index][channel] + (colors[index+1][channel] - colors[index][channel]) * (n * (colors.length - 1) - index)) * factor);
    }
    return ret;
}

// change zoom of the window
// zoom, fine, vert, up are booleans
function move(settings, zoom, fine, vert, up) {
    let step;
    if (zoom) {
        step = up ? 1 / (1 + motion) : 1 + motion;
        step = fine ? Math.pow(step, 1/6) : step;
        if (vert) {
            settings.yscl /= step;
        } else {
            settings.xscl *= step;
        }
    } else {
        step = motion * (fine ? 1/3 : 2) * (up ? 1 : -1);
        if (vert) {
            settings.ymin += step;
        } else {
            settings.xcen -= settings.xscl * step;
        }
    }
}

function writesound(settings) {
    console.log("Not yet implemented");
    return;
}

// these functions actually draw things

// put some x axis scale labels on
// TODO debug this, I think it's putting them in the wrong place or something sometimes
function scale(settings, canvas) {
    let ct = canvas.getContext("2d");
    ct.font = '12px mono';
    ct.fillStyle = "#888";
    let max = 1, min = Math.floor(1/xmin);
    while (1/max >= xmax) max++;
    ct.fillText(max, Math.min((1/max - xmin) / (xmax - xmin) * canvas.width - 4 * max.toString().length, canvas.width - 8 * max.toString().length), 10);
    if (isFinite(min)) ct.fillText(min, (1/min - xmin) / (xmax - xmin) * canvas.width + 4, 10);
}

// draw a background, might do something interesting here or might not
function background(settings, canvas) {
    let ct = canvas.getContext("2d");
    let scale = 5 / settings.yscl;
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

// draw Thomae's function
function thomae(settings, canvas) {
    const xmin = settings.xcen - settings.xscl / 2, xmax = settings.xcen + settings.xscl / 2;
    const maxq = Math.ceil(settings.maxq);
    const zero = settings.ymin * canvas.height;
    const size = canvas.width / maxq * settings.xscl / 2;
    const ct = canvas.getContext("2d");
    let x, y, top, bottom;

    function draw(q) {
        //                                                if maxq < 1, increment by 1/maxq
        for (let p = Math.floor(xmin * q); p <= xmax * q; p += Math.floor(1 / Math.min(1, settings.maxq))) {
            if (gcd(Math.abs(p),q) == 1 && (p != 0 || q == 1)) {
                // scaled and translated
                x = (p / q - xmin) / settings.xscl * canvas.width;
                // scaled but not translated
                y = (settings.power == 0 ? q / maxq :
                    p % q == 0 ?
                        Math.pow(factor(Math.abs(p) / q), 1 / settings.power) :
                        Math.pow(q, -1 / settings.power)
                ) / settings.yscl * canvas.height;
                // translated and inverted for the canvas
                top = !isFinite(y) ? -1 : canvas.height - zero - y;
                bottom = !isFinite(y) ? canvas.height + 1 : canvas.height - zero + y;
                ct.strokeStyle = !settings.color ? "#FFF" :
                    settings.rbf % 2 == 0 ? rainbow(y / canvas.height * settings.yscl / settings.rbp) :
                    rainbow(q / maxq / settings.rbp);
                if (settings.lines) {
                    if (settings.inside) {
                        if (bottom > 0 && top < canvas.height) ct.strokeRect(x, top, 0, bottom - top);
                    } else {
                        if (top >= 0) ct.strokeRect(x, 0, 0, top);
                        if (bottom <= canvas.height) ct.strokeRect(x, bottom, 0, canvas.height - bottom);
                    }
                } else {
                    ct.fillStyle = ct.strokeStyle;
                    if (top > -1) ct.fillRect(x, top - 1, size + 1, size + 1);
                    if (bottom < canvas.height + 1) ct.fillRect(x, bottom - 1, size + 1, size + 1);
                }
            }
        }
    }

    if (settings.inside != (settings.power == 0)) {
        for (let q = 1; q <= Math.max(1, maxq); q++) {
            draw(q);
        }
    } else {
        for (let q = Math.max(1, maxq); q > 0; q--) {
            draw(q);
        }
    }
}

// this function handles all keydown events
function keyHandler(settings, canvas, keyEvent) {
    let step;
    switch (keyEvent.key) {

        case "i": // print some info about current state
            console.log("X axis: " + (settings.xcen - settings.xscl / 2) + " to " + (settings.xcen + settings.xscl / 2));
            console.log("Y axis: " + (settings.ymin + " to " + (settings.ymin + settings.yscl)));
            const yscale =
                settings.power == 0 ? "negative inverse" :
                settings.power == 1 ? "linear" :
                settings.power == 2 ? "square root" :
                settings.power == 3 ? "cube root" :
                settings.power + "th root";
            console.log("Y axis scale: " + yscale);
            console.log("Denominator range: 1 to " + settings.maxq);
            break;

        case "l": // toggle x scale labels
            settings.labels = !settings.labels;
            break;

        case ".": // toggle between lines and dots
            settings.lines = !settings.lines;
            break;

        case ">": // toggle drawing inside and outside (shift+.)
            if (settings.lines) settings.inside = !settings.inside; else return;
            break;

        case "c": // toggle color on/off
        case "C": // also case insensitive because why not
            settings.color = !settings.color;
            break;

        case "0": // reset zoom to default
            for (s of ["xcen", "xscl", "ymin", "yscl", "rbp", "rbf"]) {
                settings[s] = defs[s];
            }
            settings.maxq = canvas.height * settings.yscl;
            break;

        case "s": // write the sound array to a file - TODO
        case "S": // also case sensitive bc why not
            writeSound(settings);
            return;

        // zoom/pan - shift = zoom, ctrl = fine control
        // move(settings, zoom, fine, vert, up): settings
        case "ArrowUp":
            move(settings, keyEvent.shiftKey, keyEvent.ctrlKey, true, !keyEvent.shiftKey);
            break;
        case "ArrowDown":
            move(settings, keyEvent.shiftKey, keyEvent.ctrlKey, true, keyEvent.shiftKey);
            break;
        case "ArrowLeft":
            move(settings, keyEvent.shiftKey, keyEvent.ctrlKey, false, false);
            break;
        case "ArrowRight":
            move(settings, keyEvent.shiftKey, keyEvent.ctrlKey, false, true);
            break;

        case "Enter": // change resolution
            settings.maxq *= Math.pow(2, (keyEvent.shiftKey ? -1 : 1) * (keyEvent.ctrlKey ? 1/6 : 1));
            break;

        case "\\": // change rainbow
        case "|":
            if (settings.color) {
                if (keyEvent.altKey) {
                    settings.rbf++;
                    break;
                }
                step = motion * (keyEvent.ctrlKey ? 1/2 : 3);
                settings.rbp *= keyEvent.shiftKey ? 1 + step : 1 / (1 + step);
            }
            break;

        case " ": // increase/decrease root scale power (or switch to/from root scale/inverse scale)
            step = keyEvent.ctrlKey ? 1/16 : 1;
            if (keyEvent.shiftKey) {
                if (settings.power - step <= 0) {
                    settings.power = 0;
                } else {
                    settings.power -= step;
                }
            } else {
                settings.power += step;
            }
            break;

        default:
            console.log(keyEvent.key);
            return;
    }
    background(settings, canvas);
    thomae(settings, canvas);
    if (settings.labels) scale(settings, canvas);
}

// global so I don't have to worry about passing them to the handler
let canvas;
// scaling and moving factors
const defs = {
    xcen: 0.5,
    xscl: 1,
    ymin: 0,
    yscl: 1,
    power: 1,
    rbp: 1,
    rbf: 0,
    labels: false,
    lines: true,
    inside: true,
    color: true
};
let settings = {};
for (s of Object.keys(defs)) {
    settings[s] = defs[s];
}
const motion = 1/64;

// setup config variables and start the program
function main() {
    canvas = document.getElementById("canvas");
    settings.maxq = canvas.height * 3/4;
    background(settings, canvas);
    thomae(settings, canvas);
    if (settings.labels) scale(settings, canvas);
    document.addEventListener("keydown", (keyEvent) => keyHandler(settings, canvas, keyEvent));
}

// wait for the HTML to load
document.addEventListener("DOMContentLoaded", main);
