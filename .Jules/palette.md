## 2026-02-09 - Loading State for Formspree Forms
**Learning:** Adding a visual loading state (spinner + text change) to Formspree forms significantly improves feedback during the async submission process, which can otherwise feel unresponsive.
**Action:** Apply this pattern (spinner icon + text update + disable button) to all async form submissions in Jekyll/jQuery sites.

## 2026-02-12 - Skip to Main Content Link
**Learning:** Keyboard users and screen reader users need a way to bypass repetitive navigation menus to access the main content quickly. A "Skip to main content" link is a critical accessibility requirement.
**Action:** Implemented a visible-on-focus skip link using a custom `.skip-link` component and `<main id="main-content">` wrapper in `_layouts/default.html`. This pattern should be standard for all layouts.

## 2026-02-13 - Carousel Indicator Accessibility
**Learning:** Carousel indicators are often implemented as non-interactive list items (`<li>`), making them inaccessible to keyboard users. Screen readers also need context about what these items do.
**Action:** Added `role="button"`, `tabindex="0"`, `aria-label="Slide X"`, and `onkeydown` handlers (for Enter/Space) to testimonial carousel indicators to ensure full keyboard accessibility.

## 2026-02-14 - Focus States on Custom Icons
**Learning:** Custom interactive elements, like icon-only links (`.contact-icon`), often lack visible `:focus` states, making them difficult for keyboard users to navigate.
**Action:** Ensure all interactive elements have a clear, high-contrast `:focus` state (e.g., outline or box-shadow ring) that is distinct from the default browser style if custom styling is applied.
# Palette's Accessibility Audit Journal

## Identified Anti-Patterns

### 1. Decorative FontAwesome Icons Missing `aria-hidden`
- **Description:** Several FontAwesome icons (`<i class="fas fa-...">`) used purely for visual decoration alongside descriptive text lack the `aria-hidden="true"` attribute.
- **Impact:** Screen readers might announce these decorative icons in confusing ways (e.g., "phone-alt" alongside actual phone numbers), violating WCAG guidelines for handling decorative elements.
- **Resolution:** Always add `aria-hidden="true"` to any `<i>` tag that serves only a decorative purpose and is accompanied by visually hidden or explicit text.
## Focus States and Colors
- **Anti-Pattern:** Using hardcoded RGB or hex values (e.g., `rgba(254, 209, 55, 0.5)`) for `:focus` state `box-shadow` rules on interactive elements like buttons.
- **Solution:** Use semantic color variables (e.g., `$primary`, `$secondary`, `$action`) within the `rgba()` function to ensure focus rings are dynamically consistent with the element's specific color variant.

## Carousel Control Interactivity
- **Anti-Pattern:** Carousel controls (e.g., directional arrows) lacking explicit, visible focus states and active hover states beyond browser defaults. This makes them hard to notice for keyboard users and provides poor visual feedback.
- **Solution:** Apply a semantic `box-shadow` to `:focus` (while disabling `outline`), and implement subtle scale (`transform: scale()`) and color darkening transformations on `:hover` and `:focus` states.
- **Accessibility Anti-Pattern**: Found instances (e.g., in `_sass/layout/_footer.scss` for `.social-buttons a`) where default browser focus outlines (`outline: none;`) were removed without providing a clear alternative focus ring, which violates WCAG focus visibility guidelines. Always replace `outline: none;` with a visually distinct focus indicator, such as a matching `box-shadow` (e.g., `box-shadow: 0 0 0 0.2rem rgba($primary, 0.5);`).
