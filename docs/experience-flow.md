# Aroma Farmacy experience flow

The local experience has three chapters. Formulation and Production, including their UI, 3D scenes, navigation links and scroll triggers, are removed. The collection is the end of the page.

## Visitor sequence

1. Discover: one product in the hero; buttons, keyboard arrows and horizontal swipes browse products. The mouse shows grab/grabbing feedback when rotating the hero product.
2. Our Formula: each of the six products arrives, turns to its back label, remains still for a downward mosaic scan window, then returns to its front. Ingredient checks accumulate rather than replacing each other. Selecting an ingredient opens its recorded concentration and role without changing its check status. Replay returns to the beginning of that product's scan.
3. Collection: all six products remain in a straight desktop lineup. Selection changes the active product without hiding other products. Quick view, individual add-to-bag, the collection browser and full-set add remain available. The final lineup stays on screen at the bottom of the page.

## Scan timing

`src/lib/scanner.ts` supplies the timeline shared by the 3D product and ingredient UI. Local progress is per product, not for the whole chapter:

- 0.08–0.22: turn to the back.
- 0.24–0.82: scan top to bottom; check each featured ingredient in sequence.
- 0.82–0.88: hold the completed checks.
- 0.88–0.97: return to the front.
- 0.97 onward: hand off to the next product.

The desktop scan chapter is 1240 viewport heights, giving each downward pass approximately 110 viewport-height percentage points of scroll, versus approximately 44 before the change. Scan speed follows scrolling; it does not impose a timer or prevent skipping. Reverse scrolling rewinds the checks. The final collection transition starts after the final ingredient pass is complete.

## Product data and verification

Each product currently supplies three featured ingredient records. A check means that the scan reached that ingredient in the local product dataset. This is a presentation of supplied data, not OCR, a full INCI audit, a safety assessment or independent laboratory verification. The UI states this limitation.

## Structure

- `App.tsx`: the three chapter sections, active product and navigation callbacks.
- `lib/scroll.ts`: scrolling, chapter state and scan replay positioning.
- `lib/scanner.ts`: shared scan timing, spring settings and cumulative ingredient progress.
- `components/ScannerUI.tsx`: moving mosaic scan window, ingredient pills, surrounding callouts and replay.
- `three/ProductStage.tsx`: product presentation and the complete desktop lineup.
- `three/CameraRig.tsx`: centered camera and collection fit based on viewport aspect ratio.
- `hooks/usePointerChoreography.ts`: swipe handling and cursor drag state.
- `components/ShowcaseUI.tsx`: collection browsing and shopping actions.

Camera sway, pointer parallax, collection reordering and the two extra animated chapters are removed. Motion's user preference support and CSS reduced-motion rules reduce interface movement. The scan remains scroll controlled because it communicates progress.

## Validation

Run `npm run verify:flow` and `npm run build` from the project directory. The flow checks cover all six products, ingredient completion boundaries, replay, stable back-label rotation, all-product visibility, camera horizontal bounds at five desktop sizes, and removal of the two chapters. Camera bounds checks are calculations, not rendered screenshots.

Browser visual QA was blocked by the browser origin approval gate, which reported declined permission. No visual or browser-console pass is claimed. Prettier is not installed in this checkout; edited files follow its existing formatting style.

## Research

- W3C animation from interactions: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions
- MDN reduced motion: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion
- MDN cursor semantics: https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/cursor

## Reference-led refinement

The hero now uses locally hosted Bad Script handwriting, with “One” above the product, the product type to its left, “for everywhere” to its right, product information around the central cutout, and shopping/scan controls below. The label artwork and navigation wordmark share the handwriting font. The OFL license is retained beside the font asset. Product descriptions, ingredient names and concentrations continue to come from the existing data.

The scanner is a moving white-edged window with a bounded animated particle field confined inside its bounds (320 particles on desktop; 192 in a narrow window). A product badge sits above it and interactive ingredient pills sit along its lower edge. The pills, larger surrounding ingredient callouts, drawn checkmarks and completion counter share one smoothed progress value. Selecting a pill or callout changes the ingredient detail shown below; it never marks that ingredient as checked.

The scan window uses nested CSS transforms, with its lower bound adjusted for the window's own height so the complete window remains in the product inspection area. Particle motion runs on a single canvas only during an active scan, stops on completion or when hidden, respects reduced motion, and has a pause/resume control. The spring is damped to prevent bouncing across verification thresholds, and reduced-motion mode uses the direct scroll value. Chapter navigation jumps to the correct destination rather than playing through intermediate scans.

The front and back presentations retain the same warm product-tinted backdrop. Loading now follows actual font readiness, with a short fade, rather than a fixed presentation delay. The actual 3D product, screen-printed texture and physical highlights remain the central visual.

Research used: Motion's scroll-linked animation and spring documentation (https://motion.dev/docs/react-scroll-animations, https://motion.dev/docs/spring), MDN's transform performance guidance (https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/CSS_JavaScript_animation_performance), and W3C status-message guidance (https://www.w3.org/WAI/WCAG21/Understanding/status-messages). The flow checks additionally verify non-bouncing progress in both directions and the local font/license assets.

## Active particle scanner refinement

Inspection found that the earlier mosaic was a fixed grid shifted only eight pixels across the complete pass. It has been replaced with a single small canvas. Each square now has deterministic placement, a separate downward velocity, soft sideways drift and a gradual edge fade. A narrow light sweep moves through the field to make its direction visible. The surrounding interface continues to follow scroll progress; particle time cannot mark an ingredient checked.

The particle clock freezes when paused, the tab is hidden, the scanner is inactive, or reduced motion is requested. Returning to the scan resumes the existing field without advancing through hidden time. The renderer uses one animation frame loop, limits pixel density to 1.5, reduces particle count in narrow windows, and releases the observer/listener/frame on cleanup. The collection overlay also suspends the scanner.

Ingredient pills now show continuous per-ingredient progress and a distinct reading state before the check is drawn. Completion holds for six percent of the local product beat before the return turn, giving the final result more room. The pause control affects particles only; scroll position still controls product and verification progress.

The flow checks additionally cover deterministic particles, actual movement over time, bounded positions and opacity over an hour of sampled simulation, all 16 combinations of animation gates, and the longer completed back-label hold. These are logic checks, not device frame-rate measurements. Browser visual/performance verification remains blocked by the previously declined origin permission.

Further research: MDN Canvas optimization (https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Optimizing_canvas), MDN Page Visibility API (https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API), web.dev animation performance (https://web.dev/articles/animations-guide), and W3C Pause/Stop/Hide (https://www.w3.org/WAI/WCAG20/Understanding/pause-stop-hide.html).

## Denser optical mosaic

The latest reference refinement increases the field to 320 particles on desktop and 192 in narrow windows, with larger square tiles and occasional wider mosaic fragments. Per-tile opacity is slightly lower to keep the denser field translucent. A 2.2px backdrop blur is confined to the product area inside the moving window (1.6px on mobile), and the particle layer has a 0.4px soft edge. The badge, ingredient pills and product outside the window remain sharp. These changes reuse the same renderer, animation gates and verification timeline.

## Copy and composition cleanup

The repeated scanner headings, three large ingredient callouts and explanatory captions have been removed. The signature “One / balm / for everywhere” composition now carries from the front view into the scan. A single lower ingredient name and short status replace the previous overlapping bottom caption, percentage and divider. Concentration and role appear only after selecting an ingredient pill. Hero descriptions are reduced to the existing three-part product notes; collection section labels, duplicate notes and browsing hints are removed. Shopping controls, prices and navigation remain available.

The “One” heading is raised and sized to clear the tube. Hero scale and vertical placement now adapt to shorter desktop viewports, leaving space for both the heading and the buttons. Projection checks cover the reported 1907×923 viewport and four additional desktop sizes. These numerical checks do not replace browser visual QA, which remains blocked by declined permission.

## Packaging refinement

The tube profile now has a fuller convex body, a quarter-ellipse heel transition and a narrower rounded cap. Both ends of the body are closed so the smaller cap cannot expose an opening. Its existing total height and maximum width are preserved for the hero, scanner and six-product collection. The Original Balm palette uses a slightly softer cobalt blue and warm ivory cap, and the printed body gradient is gentler. The handwritten wordmark is larger and lightly stroked for legibility; the packaging category and fragrance line are slightly stronger.

Tube materials use controlled clearcoat and roughness instead of fabric sheen. Two vertical environment reflections replace the previous overhead patch and multiple overlapping reflections. The tube contact shadow is resized to suit the smaller cap. These are visual material adjustments rather than additional animation.

The bottle geometry now includes an outer wall, neck rim, inner wall and thick base. Its separate liquid volume has a rounded heel and a shallow raised meniscus below the shoulder. Desktop glass uses transmission, nonmetallic IOR and optical thickness; narrow screens use the lighter alpha-glass material. The serum remains an illustrative shaded fill, not a fluid simulation or a measured representation of actual product viscosity.

Regression checks generate the actual packaging geometry in Node and verify finite vertices/normals, shared geometry caches, the framing envelope, cap/body proportions, liquid containment against the glass cavity with ray intersections, and desktop/mobile material settings. The existing scan, particle, heading and collection checks continue to pass. Browser visual and frame-rate QA remain unverified because the earlier browser-origin permission was declined.

## Consistent product sizing

The tube and bottle now share the same displayed model height and bottom baseline. The bottle receives a uniform scale and vertical correction derived from its native geometry bounds, preserving its proportions. A shared viewport fit controls every product in the hero, scanner and collection.

Hero settling, scanner zoom, selected-item enlargement and smaller/distant carousel neighbors have been removed. Visible products use equal scale and camera distance; selection is indicated by the controls. The camera uses the same responsive distance in every chapter, including the wider fit needed by the six-across collection in narrow desktop viewports. It no longer zooms between chapters. Collection headings have been reduced to leave space above the uniform lineup.

Regression checks compare actual tube/bottle geometry bounds, equal displayed heights and baselines, equal stage scale through all chapters, and equal selected/neighbor scale on mobile and desktop at four viewport heights. Visual browser verification remains blocked by the earlier declined permission.
