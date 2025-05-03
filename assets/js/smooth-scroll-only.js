/*!
 * Simple Smooth Scroll Script
 * Only handles smooth scrolling for # links
 */

document.addEventListener("DOMContentLoaded", function () {
  // Select all links with hashes
  document
    .querySelectorAll('a[href*="#"]:not([href="#"])')
    .forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        // Check if the link is internal to the current page
        if (
          location.pathname.replace(/^\//, "") ==
            this.pathname.replace(/^\//, "") &&
          location.hostname == this.hostname
        ) {
          // Prevent default anchor click behavior
          e.preventDefault();

          const targetId = this.hash;
          const targetElement = document.querySelector(targetId);

          if (targetElement) {
            // Use smooth scrolling behavior
            window.scrollTo({
              top: targetElement.offsetTop - 54, // Adjust offset if needed to account for fixed navbar
              behavior: "smooth",
            });

            // Update the URL hash without jumping
            if (history.pushState) {
              history.pushState(null, null, targetId);
            } else {
              location.hash = targetId;
            }
          }
        }
      });
    });
});
