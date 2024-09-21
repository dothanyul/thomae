// main.js
// initialize settings, register handlers, and do the first draw

function main() {
    const canvas = document.getElementById("canvas");
    const settings = { motion: 1/64, axes: 0 };
    reset(settings);
    zero(settings);
    init_menu(settings, canvas);
    init_keys(settings, canvas);
    background(canvas);
    draw(settings, canvas);
}

// wait for the HTML to load
document.addEventListener("DOMContentLoaded", main);
