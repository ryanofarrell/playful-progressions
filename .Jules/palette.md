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

### 2. Inconsistent Focus States on Interactive Elements
- **Description:** Button elements (`.btn`) in the site had their default browser outlines removed via `outline: none;` without providing a consistent replacement custom focus style (`box-shadow`), leading to inconsistent keyboard navigation feedback. Alternatively, the `.btn` focus style was hardcoded to use a single color for all variants, causing visual regression (e.g., a primary focus ring on a secondary button).
- **Impact:** Users navigating via keyboard may have difficulty identifying which interactive element currently has focus, violating WCAG guidelines for focus visibility.
- **Resolution:** Ensure all interactive elements, especially `.btn` variants, have a clear, distinct `:focus` state (using `box-shadow`) that uses a color related to the specific button variant (e.g., primary color for primary button, secondary color for secondary button).
