// keys.js
// handle keyboard events

// change zoom and position of the window
// zoom, fine, vert, up are booleans
function move(settings, zoom, fine, vert, up, rotate) {
    const polar = settings.axes === axes[0];
    let step;
    if (zoom) {
        motion = fine ? Math.pow(settings.motion, 2) : settings.motion;
        step = up ? 1 / (1 + motion) : 1 + motion;
        if (vert) {
            if (polar) settings.ycen += settings.yscl * (1 - 1 / step) / 2;
            settings.yscl /= step;
        } else {
            settings.xscl *= step;
            if (polar && settings.xscl < 1) settings.xscl = 1;
        }
    } else {
        step = Math.pow(settings.motion, fine ? 2 : 1) * (up ? 1 : -1);
        if (rotate) {
            settings.roll += 2 * Math.PI * step;
        } else if (vert) {
            settings.ycen += step;
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
            console.log("Y axis: " + (settings.ycen - settings.xscl / 2) + " to " + (settings.ycen + settings.yscl / 2));
            const yscale =
                settings.power == 0 ? "negative inverse" :
                settings.power == 1 ? "linear" :
                settings.power == 2 ? "square root" :
                settings.power == 3 ? "cube root" :
                settings.power + "th root";
            console.log("Y axis scale: " + yscale);
            console.log("Denominator range: 1 to " + settings.maxq);
            break;
        
        case "0": // reset zoom to default
            zero(settings);
           break;
        
        case ")": // reset view settings to default
            reset(settings);
            break;
        
        case "s": // write the sound array to a file - TODO
        case "S": // also case sensitive bc why not
            writeSound();
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
            if (settings.print === 0) {
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
    background(canvas);
    draw(settings, canvas);
}

function init_keys(settings, canvas) {
    document.addEventListener("keydown", keyEvent => keyHandler(settings, canvas, keyEvent));
}
