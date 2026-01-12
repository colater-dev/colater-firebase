Logo Page
1. Fix the duplication of the laptop sticker and the logo and name of the brand and the upload section right after the first logo preview. Make sure the color sticker appears once but in the right position in the grid. 
2. Move the name of the brand and the elevator pitch to the top of the brand preview page. Remove the target audience, desirable cues, and undesirable cues from the brand preview page.
3. Next to the name of the brand that is now on the top of the page, add a button that allows the user to edit the name of the brand. Figure out if we can reuse the form the user initially filled out about the brand. 
4. The 2x2 grid should become a vertical single column grid on mobile.
5. If invert logo is enabled, the logo on the back of the business card should be inverted. 
6. The cropped logo preview should be removed from the grid of previews. When the main logo is double clicked, generate a red dashed outline to indicate what the crop would be. Toggle the crop mode on and off with a button. I want to later use the crop info to improve the alignment of the logo and the text.
7. The Text Transform options have Original, abc, Abc and ABC. "Abc" seems to not be doing anything.
8. The first logo preview says "► Tap to Animate" on the edit page, and should instead say "Default Logo" since the animation only happens on the public share link version of this page. 
9. On mobile, the name of the brand is frequently wrapping to the next line. Can we proportionally scale both the logo and the name of the brand to be smaller on mobile? About 80% of current should be okay. 
10. Take the current set of fonts, and add category tags to them. My tentative category tags are: Formal, Rounded, Stylish, Cute, Modern. Apply these to the fonts as you see fit. Add each of these tags as a button to the new brand creation page, and when we generate a new brand, we will start with a random font that matches the brand tag the user selected. 

// Navigation on the Logo Page
11. Take the Previous and Next buttons, and put them on a persistent control dock at the bottom of the screen. Every logo generated so far should be available in the dock, and the user should be able to navigate back and forth through them by clicking directly on the option or on the left and right arrows. 
12. The full preview stack should move left and right when the user selects options on the control dock. 
13. When the user generates a new logo, it takes a while to actually generate and load a new logo. The user keeps seeing the previous logo while the new one is loading. This is not ideal, and the user should instead be moved to a placeholder new page similiar to when the logo is already generated. Show a loader instead of the logo. There is a p5 sketch that was supposed to be used here.

// File Storage
14. I changed the colorise model and the colorised images are failing to store as base64 on Firebase because they are too big. Refactor all image storage to use Cloudflare R2 like the custom media upload already uses. I don't want to break the previous functionality where it was a base64 image on Firebase so for now we should support both. New images should be stored on Cloudflare R2 and old images should continue to be stored on Firebase. Any cleanup tasks as a result of this should be documented in a new file called "eng-debt.md".


1. The black and white sticker preview gets hidden if the color one is showed. They should both show up.
2. The crop red outline on the main logo when showing crop mode does not seem to be appropriately showing the crop area on the logo.
3. The default selected model in the Image Model selection dropdown should be Nano Banana Pro.
4. The /brands/brand-id page left aligned and should be centered.


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


2. [x] The contrast slider should default to 200% and should have a range of 100% to 300%. 
11. [x] The colored sticker should use the same mask that we created for the black and white sticker - there are sometimes other elements in the background that we want to clip when showing the sticker, and the elements are in identical positions. This sticker should also respect the hue shift applied to the logo.

[x] The color sticker preview should have a white inner shadow to simulate the sticker outline.
[x] I see some images switch from showing correctly to inverting to showing correctly again. Is there some issue with the background detection rerunning? 
[x] Whenever I load a brand, I see "Brand not found" for a split second. This should be removed and only showed when it is actually not found.
The download button downloads an image, but the image has the download button and the tile label. Can we remove that?
[x] Make elements in the brand preview page take up the full width up to a max of 1280px.

- [x] Do an audit of the codebase and document what you learn in agents.md. Remove any unused code, and do a performance audit of the codebase. Document any issues you find in todo.md
- [x] The download button downloads an image, but the image has the download button and the tile label. Fix this so only the logo/content is downloaded.

### Brand Presentation & Social Assets


- [x] Implement PowerPoint-style Brand Presentation view triggerable from dashboard.
- [x] Designed and implemented 6 presentation slides (Cover, Concept, Showcase, Palette, Mockup, Social).
- [x] Implemented AI-generated Social Assets (3 Instagram stories) using Gemini.
- [x] Upgrade Next.js to 16.1.1 and React to 19.0.0 to address security vulnerabilities.