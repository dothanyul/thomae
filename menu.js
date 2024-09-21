// menu.js
// handle the options menu

// icons, basically
// format each with arguments width and height
function polar(w,h) {
    const nr = 3, nt = 6;
    const r = Math.sqrt(w * h) / 2;
    const style = `stroke-width="1" stroke="black"`;
    let ret = `<path d="M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z" fill="#FFF"/>`;
    for (let i=0; i<=nr+1; i++) {
        ret += `<circle cx="${w/2}" cy="${h/2}" r="${r * i / nr / 1.1}" ${style} fill="transparent"/>`;
    }
    for (let i=0; i<nt; i++) {
        let t = i * Math.PI / nt;
        let x1, x2, y1, y2;
        if (Math.tan(t) > h / w) {
            y1 = h; y2 = 0;
            x1 = w / 2 - h / 2 / Math.tan(t);
            x2 = w / 2 + h / 2 / Math.tan(t);
        } else {
            x1 = 0; x2 = w;
            y1 = h / 2 + w / 2 * Math.tan(t);
            y2 = h / 2 - w / 2 * Math.tan(t);
        }
        ret += `<line x1="${x1}" x2="${x2}" y1="${y1}" y2="${y2}" ${style}/>`;
    }
    return ret;
};

function rect(w,h) {
    const n = 2;
    const thick = "2";
    const thin = "0.5";
    let ret=`<path d="M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z" fill="#FFF"/>`;
    for (let i=-n; i<=n; i++) {
        ret += `
            <line x1="${w * (i + n + 1) / (2 * n + 2)}" x2="${w * (i + n + 1) / (2 * n + 2)}" y1="${0}" y2="${h}" stroke="black" stroke-width="${i == 0 ? thick : thin}"/>
            <line x1="${0}" x2="${w}" y1="${h * (i + n + 1) / (2 * n + 2)}" y2="${h * (i + n + 1) / (2 * n + 2)}" stroke="black" stroke-width="${i == 0 ? thick : thin}"/>
        `;
    }
    return ret;
};

function color(w,h) {
    let ret = "";
    w = +w; h = +h;
    for (let i=0; i<w+h; i++) {
        let c = rainbow(i / (w+h));
        let x1 = i < h ? 0 : i - h;
        let x2 = i < w ? i : w;
        let y1 = i < h ? i : h;
        let y2 = i < w ? 0 : i - w;
        ret += `<line x1="${x1}" x2="${x2}" y1="${y1}" y2="${y2}" stroke-width="1" stroke="${c}"/>`;
    }
    return ret;
};

function white(w,h) {
    return `
        <path d="M 0 0 L 0 ${h} L ${w} 0 Z" fill="white"/>
        <path d="M ${w} ${h} L 0 ${h} L ${w} 0 Z" fill="black"/>
    `;
};

// translate left/right by x, line width l, color c
function line_above(h,x,l,c) {
    return `<line x1="${x}" x2="${x}" y1="0" y2="${h / 2}" stroke="${c}" stroke-width="${l}"/>`;
};
// translate left/right by x, line width l, color c
function line_below(h,x,l,c) {
    return `<line x1="${x}" x2="${x}" y1="${h / 2}" y2="${h}" stroke="${c}" stroke-width="${l}"/>`;
};
// translate left/right by x, width l, color c
function line_dot(h,x,l,c) {
    return `<circle cx="${x}" cy="${h / 2}" r="${l * 0.7}" stroke-width="0" fill="${c}"/>`;
};

function above(w,h) {
    const l = 2, s = w * 0.2, on = "#FFF", off = "#888";
    return line_above(h, w / 2, l * 2, on) + line_below(h, s, l, off) + line_dot(h, w - s, l, off);
}
function below(w,h) {
    const l = 2, s = w * 0.2, on = "#FFF", off = "#888";
    return line_above(h, w - s, l, off) + line_below(h, w / 2, l * 2, on) + line_dot(h, s, l, off);
}
function dot(w,h) {
    const l = 2, s = w * 0.2, on = "#FFF", off = "#888";
    return line_above(h, s, l, off) + line_below(h, w - s, l, off) + line_dot(h, w / 2, l * 2, on);
}

// cycle through a range of settings in response to a user action
function change(settings, canvas, svg, setting, values, drawings) {
    const len = Object.keys(values).length;
    const w = svg.getAttribute("width"), h = svg.getAttribute("height");
    const current = svg.getAttribute(setting);
    for(let i=0; i<len; i++) {
        if (current === values[i]) {
            const j = (i + 1) % len;
            svg.setAttribute(setting, values[j]);
            settings[setting] = j;
            svg.innerHTML = drawings[j](w,h);
            break;
        }
    }
    console.log("Tock");
    background(canvas);
    draw(settings, canvas);
}

// register event listeners and set default values in the HTML settings
function init_menu(settings, canvas) {
    const drawings = [
        [polar, rect],
        [color, white],
        [above, below, dot]
    ];
    const svgs = document.querySelectorAll("svg");
    for (let i in keys) {
        svgs[i].setAttribute(keys[i], values[keys[i]][0]);
        svgs[i].innerHTML = drawings[i][0](svgs[i].getAttribute("width"), svgs[i].getAttribute("height"));
        const f = () => change(settings, canvas, svgs[i], keys[i], values[keys[i]], drawings[i]);
        svgs[i].addEventListener("mousedown", f);
    }
}
