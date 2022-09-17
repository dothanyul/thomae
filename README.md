# thomae
View and zoom on Thomae's function in rainbow colors.

The view starts with x from 0 to 1 and y on a negative-inverse scale (`1/n` on the y scale maps to `n` pixels from the top of the screen).
It can also draw the negative-linear scale (where `1/n` on the y scale maps to `1/n` of the way down from the top of the screen); toggle this on/off with `space` and the negative-inverse scale with `Shift+space`.
The inverse scale is drawn in rainbow colors (according to the magnitude of the denominator); the linear scale is drawn in white.

Controls:
 - Up/down arrows zoom the y scale, keeping the top in the same place.
 - Left/right arrows move along the x axis.
 - Ctrl+left/right arrows zoom in on the x axis around the end of the view (Ctrl+left arrow keeps the left edge in the same place).
 - Ctrl+Shift+left/right arrows zoom out on the x axis around the other end of the view (Ctrl+Shift+left arrow keeps the right edge in the same place).
