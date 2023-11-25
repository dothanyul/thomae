// draw.js
// draw thomae's function

// the three options for line style - above, below, or neither
const line = {
    over: "over",
    under: "under",
    point: "point"
}

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

// tell whether a straight line from start to stop will intersect canvas
function visible(canvas, start, stop) {
    if (!(start && stop)) return false;
    // one endpoint is on the canvas
    if ((start.x > 0 && start.y > 0 && start.x < canvas.width && start.y < canvas.height) ||
        (stop.x > 0 && stop.y > 0 && stop.x < canvas.width && stop.y < canvas.height)) {
        return true;
    }
    // start and stop are both above, below, left, or right of the canvas
    if ((start.x > canvas.width && stop.x > canvas.width) ||
        (start.y > canvas.height && stop.y > canvas.height) ||
        (start.x < 0 && stop.x < 0) ||
        (start.y < 0 && stop.y < 0)) {
        return false;
    }
    // ensure start isn't right of stop
    if (start.x > stop.x) {
        let temp = { x: stop.x, y: stop.y };
        stop = { x: start.x, y: start.y };
        start = { x: temp.x, y: temp.y };
    }
    
    // stop.x > 0 and start.x < canvas.width
    if (start.y <= stop.y) {
        if (start.x < 0) {
            // intersection with x=0 is above the top left corner
            if (start.y + (stop.y - start.y) / (stop.x - start.x) * -start.x > canvas.height) {
                return false;
            }
            return true;
        } else {
            // intersection with x=xmax is below the bottom right corner
            if (start.y + (stop.y - start.y) / (stop.x - start.x) * (canvas.width - start.x) < 0) {
                return false;
            }
            return true;
        }
    } else {
        if (start.x < 0) {
            // intersection with x=0 is below the bottom left corner
            if (start.y + (stop.y - start.y) / (stop.x - start.x) * -start.x < 0) {
                return false;
            }
            return true;
        } else {
            // intersection with x=xmax is above the top right corner
            if (start.y + (stop.y - start.y) / (stop.x - start.x) * (canvas.width - start.x) > canvas.height) {
                return false;
            }
            return true;
        }
    }
}

// draw a background, might do something interesting here or might not
function background(settings, canvas) {
    const ct = canvas.getContext("2d");
    ct.strokeStyle = "#000";
    ct.fillStyle = "#000";
    ct.fillRect(0, 0, canvas.width, canvas.height);
}

function writesound(settings) {
    console.log("Not yet implemented");
    return;
}

// xscl determines zoom in θ, yscl determines zoom in r
function toPolar(settings, canvas, t, x) {
    const xmin = settings.xcen - settings.yscl * canvas.width / canvas.height / 2;
    const theta = (t % 1) * 2 * Math.PI * settings.xscl + settings.roll;
    return t * settings.xscl > 1 ? undefined : {
        x: (x / settings.yscl * Math.cos(theta) - xmin) * canvas.height / settings.yscl,
        y: (x / settings.yscl * Math.sin(theta) - settings.ymin) * canvas.height / settings.yscl
    }
}

// xscl determines x zoom, yscl determines y zoom
function toRect(settings, canvas, t, x) {
    const xmin = settings.xcen - settings.xscl / 2;
    return {
        x: (t - xmin) * canvas.width / settings.xscl,
        y: (x - settings.ymin) * canvas.height / settings.yscl
    };
}

// draw a line from polar or cartesian (t1, x1) to (t2, x2) on a window with width xscl and height yscl and center (xcen, ycen)
function stroke(settings, canvas, ct, t1, x1, t2, x2) {
    let start = settings.polar ? toPolar(settings, canvas, t1, x1) : toRect(settings, canvas, t1, x1);
    let end = settings.polar ? toPolar(settings, canvas, t2, x2) : toRect(settings, canvas, t2, x2);
    if (visible(canvas, start, end)) {
        ct.beginPath();
        ct.moveTo(start.x, canvas.height - start.y);
        ct.lineTo(end.x, canvas.height - end.y);
        ct.closePath();
        ct.stroke();
    }
}

// draw Thomae's function
function thomae(settings, canvas) {
    const maxq = Math.ceil(settings.maxq);
    const xmin = settings.xcen - settings.xscl / 2, xmax = settings.xcen + settings.xscl / 2;
    const ymin = settings.ycen - settings.yscl / 2, ymax = settings.ycen + settings.yscl / 2;
    const size = canvas.width / maxq * settings.xscl / 2;
    const long = settings.polar ?
        Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2)) :
        canvas.height;
    const ct = canvas.getContext("2d");
    let y;
    
    function single(p, q) {
        if (gcd(Math.abs(p),q) == 1 && (p != 0 || q == 1)) {
            // distance to zero of the height function
            y = settings.power == 0 ? q / maxq : Math.pow(1 / q, 1 / settings.power);
            ct.strokeStyle = !settings.color ? "#FFF" :
                settings.rbf % 2 == 0 ? rainbow(y / settings.rbp) :
                rainbow(q / maxq / settings.rbp);
            
            switch(settings.line) {
                case line.point:
                    stroke(settings, canvas, ct, p / q, y, p / q, y + settings.yscl / long);
                    break;
                
                case line.under:
                    stroke(settings, canvas, ct, p / q, settings.polar ? 0 : -y, p / q, y);
                    break;
                
                case line.over:
                    stroke(settings, canvas, ct, p / q, y, p / q, y + long);
                    if (!settings.polar)
                        stroke(settings, canvas, ct, p / q, -y, p / q, -y - long);
                    break;
            }
        }
    }
    
    function denominator(q) {
        if (settings.polar) {
            // TODO optimize this
            for (let p = 0;
                p <= q;
                p += Math.floor(1 / Math.min(1, settings.maxq))) {
                single(p, q);
            }
        } else {
            for (let p = Math.floor(xmin * q);
                p <= xmax * q;
                // if maxq < 1, increment by 1/maxq
                p += Math.floor(1 / Math.min(1, settings.maxq))) {
                single(p, q);
            }
        }
    }
    
    if ((settings.line == line.under) != (settings.power == 0)) {
        for (let q = 1; q <= Math.max(1, maxq); q++) {
            denominator(q);
        }
    } else {
        for (let q = Math.max(1, maxq); q > 0; q--) {
            denominator(q);
        }
    }
}

// reset view settings to default
function reset(settings, canvas) {
    if (settings.polar) {
        settings.power = 0;
        settings.line = line.over;
    } else {
        settings.power = 1;
        settings.line = line.under;
    }
    settings.color = true;
}

// reset zoom/pan/roll to default
function zero(settings, canvas) {
    if (settings.polar) {
        settings.xcen = 0;
        settings.xscl = 1;
        settings.yscl = 1;
        settings.ymin = -settings.yscl / 2;
    } else {
        settings.xcen = 0.5;
        settings.xscl = 1;
        settings.ymin = 0;
        settings.yscl = 1;
    }
    settings.roll = 0;
    settings.rbp = 1;
    settings.rbf = 0;
    settings.maxq = 4;
}

// change zoom and position of the window
// zoom, fine, vert, up are booleans
function move(settings, zoom, fine, vert, up, rotate) {
    let step;
    if (zoom) {
        step = up ? 1 / (1 + settings.motion) : 1 + settings.motion;
        step = fine ? Math.pow(step, 1/6) : step;
        if (vert) {
            if (settings.polar) settings.ymin += settings.yscl * (1 - 1 / step) / 2;
            settings.yscl /= step;
        } else {
            settings.xscl *= step;
            if (settings.polar && settings.xscl < 1) settings.xscl = 1;
        }
    } else {
        step = settings.motion * (fine ? 1/3 : 2) * (up ? 1 : -1);
        if (rotate) {
            settings.roll += 2 * Math.PI * step;
        } else if (vert) {
            settings.ymin += step;
        } else {
            settings.xcen -= settings.xscl * step;
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
        
        case ".": // toggle between lines and dots
            if (settings.line == line.point) {
                if (settings.polar) {
                    settings.line = line.over;
                } else {
                    settings.line = line.under;
                }
            } else {
                settings.line = line.point;
            }
            break;
        
        case ">": // toggle drawing inside and outside (shift+.)
            switch(settings.line) {
                case line.under:
                    settings.line = line.over;
                    break;
                case line.over:
                    settings.line = line.under;
                    break;
                default:
            }
            break;
        
        case "p":
        case "P":
            settings.polar = !settings.polar;
            if (settings.polar) {
                settings.power = 0;
            } else {
                settings.power = 1;
            }
            zero(settings, canvas);
            break;
        
        case "c": // toggle color on/off
        case "C": // also case insensitive because why not
            settings.color = !settings.color;
            break;
        
        case "0": // reset zoom to default
            zero(settings, canvas);
           break;
        
        case ")": // reset view settings to default
            reset(settings, canvas);
            break;
        
        case "s": // write the sound array to a file - TODO
        case "S": // also case sensitive bc why not
            writeSound(settings);
            return;
        
        // zoom/pan - shift = zoom, ctrl = fine control, alt = rotate
        // move(settings, zoom, fine, vert, up, rotate)
        case "ArrowUp":
            move(settings, keyEvent.shiftKey, keyEvent.ctrlKey, true, !keyEvent.shiftKey, keyEvent.altKey && settings.polar);
            break;
        case "ArrowDown":
            move(settings, keyEvent.shiftKey, keyEvent.ctrlKey, true, keyEvent.shiftKey, keyEvent.altKey && settings.polar);
            break;
        case "ArrowLeft":
            move(settings, keyEvent.shiftKey, keyEvent.ctrlKey, false, false, false);
            break;
        case "ArrowRight":
            move(settings, keyEvent.shiftKey, keyEvent.ctrlKey, false, true, false);
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
                step = settings.motion * (keyEvent.ctrlKey ? 1/2 : 3);
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
    console.log("Tick");
    background(settings, canvas);
    thomae(settings, canvas);
}

// setup config variables and start the program
function main() {
    let settings = {
        polar: true,
        motion: 1/64
    };
    const canvas = document.getElementById("canvas");
    reset(settings, canvas);
    zero(settings, canvas);
    background(settings, canvas);
    thomae(settings, canvas);
    document.addEventListener("keydown", (keyEvent) => keyHandler(settings, canvas, keyEvent));
}

// wait for the HTML to load
document.addEventListener("DOMContentLoaded", main);
console.log("Ready.");

