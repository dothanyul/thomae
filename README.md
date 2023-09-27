# thomae
View and zoom on Thomae's function (`y(p/q) = 1/q`) in rainbow colors.

The default viewport shows the unit interval with the `x`-axis at the bottom. Panning up will show the function reflected over the `x`-axis. 

View controls:
 - For all of these controls, Ctrl will decrease the amount by which the view changes. For example, Ctrl+arrow key will pan the view a smaller distance.
 - Arrow keys pan the view.
 - Shift+arrow keys zoom the view (centered vertically on the real line and horizontally on the center of the screen).
 - Enter increases the resolution (max denominator value); Shift+Enter decreases it.
 - \ increases the resolution (frequency) of the rainbow color scale; Shift+\ decreases it.
   + Alt+\ switches the rainbow from a linear scale to an inverse scale.
 - Space changes the y-axis scale.
   + The scale starts out linear (`y = 1/q`). Pressing space once will change it to quadratic (`y = 1/q^(1/2)`). Pressing space more will increase the power of the root further. Shift+space will decrease the power again.
   + Ctrl+space changes the power by 1/16 instead of 1. For example, if the scale is linear, Ctrl+space will change it to `y = 1/q^(16/17)`.
   + When the the power is zero, the scale will be an inverse scale (`y = q`). 
 - 0 will reset the view position, zoom, max denominator, and rainbow parameters to their default values; y scale will stay the same.

Other controls:
 - `C` toggles the rainbow color scale on and off.
 - `.` toggles between dots at `y` and lines one side of `y`.
   - Shift+`.` toggles which side of `y` the lines are drawn, above or below (or between or outside the two `y` values if you've panned up), if lines are currently drawn.
 - `L` toggles some `x`-axis scale labels - this feature is not well maintained.
 - `I` prints some view information to the console.
