// draw.js
// draw thomae's function

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

// thomae's function of a number x to a resolution d
// thomae(x, d) = max_{a ϵ B_d(x)} thomae(a)
function thomae(x, d) {
    
}

// tell whether a straight line from start to stop will intersect canvas
function visible(start, stop) {
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
function background(canvas) {
    const ct = canvas.getContext("2d");
    ct.strokeStyle = "#000";
    ct.fillStyle = "#444";
    ct.fillRect(0, 0, canvas.width, canvas.height);
}

function writesound() {
    console.log("Not yet implemented");
    return;
}

// xscl determines zoom in θ, yscl determines zoom in r
function toPolar(settings, canvas, t, x) {
    const xmin = settings.xcen - settings.yscl * canvas.width / canvas.height / 2;
    const ymin = settings.ycen - settings.yscl / 2;
    const theta = t * 2 * Math.PI / settings.xscl + settings.roll;
    return {
        x: (x / settings.yscl * Math.cos(theta) - xmin) * canvas.height / settings.yscl,
        y: (x / settings.yscl * Math.sin(theta) - ymin) * canvas.height / settings.yscl
    }
}

// xscl determines x zoom, yscl determines y zoom
function toRect(settings, canvas, t, x) {
    const xmin = settings.xcen - settings.xscl / 2, ymin = settings.ycen - settings.yscl / 2;
    return {
        x: (t - xmin) * canvas.width / settings.xscl,
        y: (x - ymin) * canvas.height / settings.yscl
    };
}

// draw a line from polar or cartesian (t1, x1) to (t2, x2) on a window with width xscl and height yscl and center (xcen, ycen)
function stroke(settings, canvas, t1, x1, t2, x2) {
    const ct = canvas.getContext("2d");
    let start = settings.axes === 0 ? toPolar(settings, canvas, t1, x1) : toRect(settings, canvas, t1, x1);
    let end = settings.axes === 0 ? toPolar(settings, canvas, t2, x2) : toRect(settings, canvas, t2, x2);
    if (visible(start, end)) {
        ct.beginPath();
        ct.moveTo(start.x, canvas.height - start.y);
        ct.lineTo(end.x, canvas.height - end.y);
        ct.closePath();
        ct.stroke();
    }
}

// draw Thomae's function
function draw(settings, canvas) {
    const maxq = Math.ceil(settings.maxq);
    const xmin = settings.xcen - settings.xscl / 2, xmax = settings.xcen + settings.xscl / 2;
    const ymin = settings.ycen - settings.yscl / 2, ymax = settings.ycen + settings.yscl / 2;
    const size = canvas.width / maxq * settings.xscl / 2;
    const long = settings.axes === 0 ?
        Math.sqrt(Math.pow(canvas.width, 2) + Math.pow(canvas.height, 2)) :
        canvas.height;
    const ct = canvas.getContext("2d");
    let y;
    
    function pair(p, q) {
        if (gcd(Math.abs(p),q) == 1 && (p != 0 || q == 1)) {
            // distance to zero of the height function
            y = settings.power == 0 ? q / maxq : Math.pow(1 / q, 1 / settings.power);
            ct.strokeStyle = settings.print === 1 ? "#FFF" :
                settings.rbf % 2 == 0 ? rainbow(y / settings.rbp) :
                rainbow(q / maxq / settings.rbp);
            
            switch(settings.line) {
                case 0: // below
                    stroke(settings, canvas, p / q, settings.axes === 0 ? 0 : -y, p / q, y);
                    break;
                
                case 1: // above
                    stroke(settings, canvas, p / q, y, p / q, y + long);
                    if (settings.axes === 1)
                        stroke(settings, canvas, p / q, -y, p / q, -y - long);
                    break;
                
                case 2: // dot
                    stroke(settings, canvas, p / q, y, p / q, y + settings.yscl / long);
                    stroke(settings, canvas, p / q, -y, p / q, -y - settings.yscl / long);
                    break;
            }
        }
    }
    
    function denominator(q) {
        // TODO doesn't work when [0,0] is outside the window
        if (settings.axes === 0) {
            // extremes of the window in rectilinear coordinates
            const xmin = settings.xcen - settings.yscl * canvas.width / canvas.height / 2,
                xmax = settings.xcen + settings.yscl * canvas.width / canvas.height / 2,
                ymin = settings.ycen - settings.yscl / 2, ymax = settings.ycen + settings.yscl / 2;
            // extremes of the window from furthest clockwise to furthest widdershins
            const [mint, maxt] =
                xmin > 0 ?
                    ymin > 0 ? [Math.atan(ymin / xmax), Math.atan(ymax / xmin)] : // bottom right to top left
                    ymax < 0 ? [Math.atan(ymin / xmin), Math.atan(ymax / xmax)] : // bottom left to top right
                    [Math.atan(ymin / xmin), Math.atan(ymax / xmin)] : // bottom left to top left
                xmax < 0 ?
                    ymin > 0 ? [Math.atan(ymax / xmax), Math.atan(ymin / xmin)] : // top right to bottom left
                    ymax < 0 ? [Math.atan(ymax / xmin), Math.atan(ymin / xmax)] : // top left to bottom right
                    [Math.atan(ymax / xmax), Math.atan(ymin / xmax)] : // top right to bottom right
                xmin == 0 ? [-Math.PI / 2, Math.PI / 2] : // left edge
                xmax == 0 ? [Math.PI / 2, 3 * Math.PI / 2] : // right edge
                ymin > 0 ? [Math.atan(ymin / xmax), Math.atan(ymin / xmin)] : // bottom right to bottom left
                ymax < 0 ? [Math.atan(ymax / xmin), Math.atan(ymax / xmax)] : // top left to top right
                [0, 2 * Math.PI]; // whole circle
            // polar center of the window
            const cent = maxt - Math.abs(maxt - mint) / 2;
            const [minp, maxp] = xmin < 0 && xmax > 0 && ymin < 0 && ymax > 0 ? [0, q * settings.xscl] :
                [cent + (maxt - cent) * settings.xscl, cent - (maxt - cent) * settings.xscl];
            for (let p = minp;
                p <= maxp;
                p += Math.floor(1 / Math.min(1, settings.maxq))) {
                pair(p, q);
            }
        } else {
            for (let p = Math.floor(xmin * q);
                p <= xmax * q;
                // if maxq < 1, increment by 1/maxq
                p += Math.floor(1 / Math.min(1, settings.maxq))) {
                pair(p, q);
            }
        }
    }
    
    if ((settings.line == line.below) != (settings.power == 0) != (settings.axes == 0)) {
        for (let q = 1; q <= Math.max(1, maxq); q++) {
            denominator(q);
        }
    } else {
        for (let q = Math.max(1, maxq); q > 0; q--) {
            denominator(q);
        }
    }
}
