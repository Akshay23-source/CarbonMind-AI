# Accessibility (ACCESSIBILITY.md)

CarbonMind AI is committed to ensuring digital accessibility for people with disabilities. We are continuously improving the user experience for everyone and applying the relevant accessibility standards.

---

## Conformance Status

We follow the **Web Content Accessibility Guidelines (WCAG) 2.1 Level AA** principles to ensure that our platform is perceivable, operable, understandable, and robust.

---

## Key Accessibility Features Implemented

### 1. Semantic HTML Structure
- Used native HTML5 landmark elements (`<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, and `<footer>`) to allow screen readers and assistive technologies to navigate page sections efficiently.
- Enforced a logical, nested heading hierarchy (`<h1>` through `<h4>`) to maintain page outline consistency.

### 2. ARIA Attributes & Interactive Names
- Interactive elements (such as settings, search filters, recipe scanners, receipts uploaders, and theme controls) include descriptive `aria-label` properties.
- Toggle buttons utilize the `aria-pressed` state to indicate their current toggled state.
- Live alerts (such as loading indicators or form validation states) use `aria-live="polite"` and `role="status"` or `role="alert"` wrapper tags to notify screen reader users dynamically.

### 3. Keyboard Navigation
- All navigation links, menu items, buttons, and simulation checkboxes support focus states. Users can navigate the platform using standard keys:
  - `Tab` / `Shift + Tab` to cycle through focusable elements.
  - `Enter` or `Space` to activate buttons, links, and select options.
  - `Escape` to close overlay modals.

### 4. Skip to Content Link
- A skip link (`Skip to main content`) is positioned at the top of every page. When focused, it allows keyboard-only users to bypass navigation lists and jump directly to the primary page contents.

### 5. Visible Focus Indicators
- Focusable elements feature a highly visible, contrasting focus ring indicator on focus:
  - `focus:outline-none focus:ring-4 focus:ring-emerald-500`
  - This ensures that keyboard users can easily identify where they are on the page.

### 6. Accessible Modals
- Modal dialog components are built using accessible attributes:
  - `role="dialog"` to declare the region as a dialogue overlay.
  - `aria-modal="true"` to signal that content outside the modal is inert.
  - `aria-labelledby="modal-title"` pointing to the modal header text.
  - Close buttons with explicit `aria-label="Close dialog"` descriptors.

### 7. Non-Text Content (Alt Text)
- Every image rendering illustrative content includes descriptive `alt` text parameters.
- Decorative graphics are set to `alt=""` to prevent screen reader noise.

### 8. Color Contrast
- Implemented curated palettes prioritizing high color contrast ratios (conforming to WCAG AA standard of 4.5:1 ratio for text content):
  - High-contrast colors like `text-white` on `bg-emerald-700` are prioritized for buttons.

### 9. Accessible Charts
- Graphs and analytical displays (powered by Recharts) are wrapped in `role="img"` divs containing explicit `aria-label` descriptive titles (e.g. `aria-label="Line chart comparing historical actual footprint against AI predicted values"`).
- Gauge indicator modules utilize `role="progressbar"`, `aria-valuenow`, `aria-valuemin`, and `aria-valuemax` parameters to convey active rates to assistive readers.
