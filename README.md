# thomae
View and zoom on Thomae's function in rainbow colors, with the y-axis on a negative-inverse scale (`1/n` on the y scale maps to `n` pixels from the top of the screen).

The view starts with x from 0 to 1 and y from 0 to -538. 

Controls:
 - Left/right arrows move along the x axis; Ctrl+left/right moves by smaller increments.
 - Up/down arrows zoom the y scale, keeping the top in the same place; Ctrl+up/down zooms by smaller increments.
 - Shift+up/down arrows zoom the x axis, keeping the center in the same place; Ctrl+Shift+up/down zooms by smaller increments.
 - Space changes y axis from a negative-inverse scale to a linear scale, and repeated space changes through increasing root scales; Shift+Space reverses this.
 - + increases the denominators' upper limit, - decreases it (by factors of 2).
 - L toggles labels, drawn in gray at the top of the screen at the highest and lowest `x` values that correspond to some `1/n`.
 - Ctrl+0 resets zoom to starting values.
