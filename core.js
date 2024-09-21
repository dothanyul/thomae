
const axes = ["polar", "rectilinear"];

const print = ["color", "white"];

const line = ["below", "above", "dot"];

const keys = ["axes", "print", "line"];

const values = {
    "axes": axes,
    "print": print,
    "line": line
};

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

// reset view settings to default
function reset(settings) {
    settings.power = 1;
    settings.line = 0;
    settings.print = 0;
}

// reset zoom/pan/roll to default
function zero(settings) {
    settings.xcen = settings.axes === 0 ? 0 : 0.5;
    settings.ycen = settings.xcen;
    settings.xscl = 1;
    settings.yscl = 1;
    settings.roll = 0;
    settings.rbp = 1;
    settings.rbf = 0;
    settings.maxq = 3;
}

/*
core holds things like enums that draw and the menus all need
draw draws the picture and holds all the math related stuff
menu and keyhandler (to be named) handle mouse events and key events respectively and call draw
main sets up the key handlers, initializes the settings, and does the first draw
each file here relies on the ones above it (directly or indirectly)
*/

/*
settings:
axes ϵ [0,1], print ϵ [0,1], line ϵ [0,1,2]
    each corresponds to a value in the respective array
maxq - max q value
power - draw y ~ (1/q)^(1/power)
    currently when power=0, draws y ~ q
    add a separate setting to switch to y ~ q^(1/power)
ymin, yscl, xcen, xscl - window dimensions
    move to ycen instead
roll - polar radian measurement to rotate the polar display
motion - increment to move and zoom by, as a proportion of screen size
    add a factor to decrease by for fine? or does that vary by setting?
rbf - if odd, draw the rainbow as ~1/q, if even ~q
rbp - rainbow period

reset sets power, print, line
zero sets xcen, xscl, ymin, yscl, roll, rbp, rbf, maxq, and requires axes

axes, print, and line are set to the string values in the HTML and the integer index values in settings
in change() we have the whole values array and get the string value from the HTML
we loop over the array to find the current setting, add 1 to it, set the corresponding string value in the HTML, and set the incremented index in settings
the string values in the HTML are there to show the user the current setting if the icon is insufficient
the integer values in settings are there for
    the default value is 0 for all three in all cases
    the indices define an order so we can increment through the options easily
*/

// add functionality to save settings to reload later

/**
UI design:
    What controls are important in polar mode and in rectilinear mode?
    How do we map them to the keys we have?
    Should those stay reasonably similar/evolve in parallel or should I let them drift?
Add a GUI settings menu which will control toggle settings
    Settings to go in the GUI menu:
        Polar/rectilinear
        Color/white
        Line direction
        Rainbow mode (~q or ~1/q)
        f : q -> y
    Settings to control via keyboard:
        Polar mode:
            Canvas zoom (x and y are fixed to each other)
            Canvas pan
            Polar zoom
            Polar zoom center
            Roll angle (polar pan)
        Rectilinear mode:
            Canvas zoom (separate x and y)
            Canvas pan
        Both:
            Power
            Rainbow period
            Max q
*/
