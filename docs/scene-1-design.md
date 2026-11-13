# Scene 1: A blank canvas

The starting frame is a full-screen Windows 7 desktop, with the original blue wallpaper, left-aligned shortcuts, Aero taskbar, and a yellow Sticky Note inviting the visitor to open Paint. It uses familiar operating-system surfaces instead of a conventional website header or hero.

A 260-viewport-percent scroll region contains one sticky desktop. Scroll progress fades the hint, moves a demonstrative cursor to the Paint shortcut, selects it, performs a double-click gesture, and opens an Aero Paint window. The final frame is a blank drawing canvas. The cursor never intercepts input. Direct launch bypasses the scroll requirement while completing the same visual state. Closing resets the narrative position. Window minimization, dragging, and maximization are independent of scene progress.

The desktop is one hydrated React island inside an Astro static page. React owns interaction state; GSAP owns the narrative transforms. Lenis and ScrollTrigger share the GSAP ticker and clean up on unmount. Assets are local, and Three.js/R3F have an unused future scene boundary, keeping WebGL out of this scene's bundle.

Small screens retain the desktop metaphor: icons remain tappable, Paint fills the available viewport, the ribbon scrolls horizontally, and the canvas has its own scroll container. Reduced motion removes the animated cursor and window translation/scale. Buttons retain native keyboard operation; dialogs trap focus and support Escape.

Validation covers direct and scroll launch, reverse scrolling outside Paint, basic canvas history, PNG download, window controls, Start-menu search, keyboard launch, dialog dismissal, reduced motion, a narrow viewport, and the absence of Three.js resource requests.

No subsequent story scene, project content, external integrations, or persistent storage is included.
