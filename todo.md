1. Remove the "Crop Mode" button also the rendering logic for the red outline. 
2. The "Default Logo" section should also use the cropped logo.
3. The /dashboard page should use the same preview as the "Default logo". Currently it seems to be presenting differently.
3. Fix this issue:
Runtime Error
4. The dock animation logic seems to be a bit wonky. Reduce the dramatic-ness of the effect (it can be quicker and just hint at motion) and currently sometime the current page moved left and the new page moves right, giving the effect that the content moved to the side and came back - instead of the intended effect of the whole page moving off to one side

Error: Cannot read properties of undefined (reading '_renderer')

src/components/ui/shader-loader.tsx (102:12) @ Object.draw


  100 |     const draw = (p5: p5Types) => {
  101 |         p5.clear();
> 102 |         p5.shader(theShader);
      |            ^
  103 |
  104 |         theShader.setUniform("u_resolution", [p5.width, p5.height]);
  105 |         theShader.setUniform("u_time", p5.millis() / 1000.0);
 
 5. The crop details should be saved to firebase so that recalculation is not needed.
 6. Implement a red delete icon in the top bar. This should ask for confirmation and then delete the logo - for now just add a parameter in firebase and don't show the deleted logos anywhere.
 7. /dashboard should use black and white logos and all of the same properties as the default logo.
 8. If a logo appears before the crop details are calculated, it should have an animation class applied to it that goes from blurred and scaled to 1 to unblurred and scaled to .75.