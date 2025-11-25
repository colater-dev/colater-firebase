1. [x] Remove the "Crop Mode" button also the rendering logic for the red outline.
2. [x] The "Default Logo" section should also use the cropped logo.
3. [x] The /dashboard page should use the same preview as the "Default logo". Currently it seems to be presenting differently.
3. [x] Fix this issue:
Runtime Error
4. [x] The dock animation logic seems to be a bit wonky. Reduce the dramatic-ness of the effect (it can be quicker and just hint at motion) and currently sometime the current page moved left and the new page moves right, giving the effect that the content moved to the side and came back - instead of the intended effect of the whole page moving off to one side

Error: Cannot read properties of undefined (reading '_renderer')

src/components/ui/shader-loader.tsx (102:12) @ Object.draw


  100 |     const draw = (p5: p5Types) => {
  101 |         p5.clear();
> 102 |         p5.shader(theShader);
      |            ^
  103 |
  104 |         theShader.setUniform("u_resolution", [p5.width, p5.height]);
  105 |         theShader.setUniform("u_time", p5.millis() / 1000.0);
 
 5. [x] The crop details should be saved to firebase so that recalculation is not needed.
 6. [x] Implement a red delete icon in the top bar. This should ask for confirmation and then delete the logo - for now just add a parameter in firebase and don't show the deleted logos anywhere.
 7. [x] /dashboard should use black and white logos and all of the same properties as the default logo.
 8. [x] If a logo appears before the crop details are calculated, it should have an animation class applied to it that goes from blurred and scaled to 1 to unblurred and scaled to .75.
 9. [x] Figure out the appropriate logic to make sure each of the "on brand color" options show the best contrast version. This should take into account whether the invert logo option is enabled, and whether the background is dark or light. If there is a color that is very close to black, hide the "On Gray" option.
 10. [x] "Inverted on Black" option should be called "Dark Logo" and "On Gray" should be called "Light Logo"
 11. [x] The colored sticker should use the same mask that we created for the black and white sticker - there are sometimes other elements in the background that we want to clip when showing the sticker, and the elements are in identical positions. This sticker should also respect the hue shift applied to the logo.
 12. [x] The colored sticker is loading correctly, so I know it's getting generated and loaded, but the color logo tile is not displaying the image. 
 13. [x] The black and white sticker tile should load with the background only by default - currently it's loading with the logo and causes a layout shift.
 14. [x] On mobile, the dock has a small vertical scroll. It should not have this. Overflow should also be set to visible on the parent of the square previews as since the selected state outline is getting clipped.
 15. [x] The main content on the public share link has a narrower width than the logo preview page. Make the width similiar to the logo preview page.
 16. [x] The main logo preview should be split into a vertical logo preview and horizontal logo preview. The spacing and relative sizing should be separately configurable - all other properties should be shared.
 17. [x] Remove the brightness and smoothness(blur) options from the logo preview options, and also remove these from affecting the logo. Clean up any references to this around the codebase.