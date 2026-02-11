## 2026-02-09 - Loading State for Formspree Forms
**Learning:** Adding a visual loading state (spinner + text change) to Formspree forms significantly improves feedback during the async submission process, which can otherwise feel unresponsive.
**Action:** Apply this pattern (spinner icon + text update + disable button) to all async form submissions in Jekyll/jQuery sites.

## 2026-02-12 - Skip to Main Content Link
**Learning:** Keyboard users and screen reader users need a way to bypass repetitive navigation menus to access the main content quickly. A "Skip to main content" link is a critical accessibility requirement.
**Action:** Implemented a visible-on-focus skip link using a custom `.skip-link` component and `<main id="main-content">` wrapper in `_layouts/default.html`. This pattern should be standard for all layouts.

## 2026-02-13 - Carousel Indicator Accessibility
**Learning:** Carousel indicators are often implemented as non-interactive list items (`<li>`), making them inaccessible to keyboard users. Screen readers also need context about what these items do.
**Action:** Added `role="button"`, `tabindex="0"`, `aria-label="Slide X"`, and `onkeydown` handlers (for Enter/Space) to testimonial carousel indicators to ensure full keyboard accessibility.
