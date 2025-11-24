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