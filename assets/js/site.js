/**
 * Vanilla ES6 Core Site Interactions for Playful Progressions.
 * Handles Navbar, Scrollspy/Shrink, Scroll Reveals, Accordions, and Carousels with zero dependencies.
 */
(function () {
  "use strict";

  function initSite() {
    // -------------------------------------------------------------------------
    // 1. Mobile Navigation Toggle & Auto-Close
    // -------------------------------------------------------------------------
    var togglers = document.querySelectorAll(".navbar-toggler");
    var navCollapse = document.querySelector("#navbarResponsive");
    var mainNav = document.querySelector("#mainNav");

    if (togglers.length > 0 && navCollapse) {
      function toggleMenu(e) {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        var isOpen = navCollapse.classList.toggle("show");
        togglers.forEach(function (t) {
          t.setAttribute("aria-expanded", isOpen ? "true" : "false");
        });
      }

      togglers.forEach(function (toggler) {
        toggler.addEventListener("click", toggleMenu);
        toggler.addEventListener("touchend", function (e) {
          e.preventDefault();
          toggleMenu(e);
        });
      });

      // Close menu when clicking a navigation link
      var navLinks = navCollapse.querySelectorAll(".nav-link, .btn, .contact-icon");
      navLinks.forEach(function (link) {
        link.addEventListener("click", function () {
          if (navCollapse.classList.contains("show")) {
            navCollapse.classList.remove("show");
            togglers.forEach(function (t) {
              t.setAttribute("aria-expanded", "false");
            });
          }
        });
      });

      // Close menu when clicking outside navbar
      document.addEventListener("click", function (e) {
        if (!navCollapse.classList.contains("show")) return;
        var isClickInsideNav = mainNav && mainNav.contains(e.target);
        if (!isClickInsideNav) {
          navCollapse.classList.remove("show");
          togglers.forEach(function (t) {
            t.setAttribute("aria-expanded", "false");
          });
        }
      });
    }

    // -------------------------------------------------------------------------
    // 2. Smooth Scrolling for In-Page Anchor Links
    // -------------------------------------------------------------------------
    var scrollTriggers = document.querySelectorAll('a.js-scroll-trigger[href*="#"]:not([href="#"])');
    scrollTriggers.forEach(function (anchor) {
      anchor.addEventListener("click", function (e) {
        var href = anchor.getAttribute("href");
        var hash = href.substring(href.indexOf("#"));
        if (!hash || hash === "#") return;

        var target = document.querySelector(hash) || document.querySelector('[name="' + hash.slice(1) + '"]');
        if (target && (anchor.pathname === window.location.pathname || !anchor.pathname)) {
          e.preventDefault();
          var offset = 90;
          var targetPosition = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
        }
      });
    });

    // -------------------------------------------------------------------------
    // 3. Navbar Shrink on Scroll (IntersectionObserver)
    // -------------------------------------------------------------------------
    var sentinel = document.querySelector("#navbar-sentinel");
    if (sentinel && mainNav && "IntersectionObserver" in window) {
      var navObserver = new IntersectionObserver(
        function (entries) {
          if (entries[0].isIntersecting) {
            mainNav.classList.remove("navbar-shrink");
          } else {
            mainNav.classList.add("navbar-shrink");
          }
        },
        { threshold: [0] }
      );
      navObserver.observe(sentinel);
    } else if (mainNav) {
      // Fallback for subpages without a sentinel
      window.addEventListener(
        "scroll",
        function () {
          if (window.scrollY > 100) {
            mainNav.classList.add("navbar-shrink");
          } else {
            mainNav.classList.remove("navbar-shrink");
          }
        },
        { passive: true }
      );
    }

    // -------------------------------------------------------------------------
    // 4. Staggered Scroll-Reveal Animations (IntersectionObserver)
    // -------------------------------------------------------------------------
    var revealElements = document.querySelectorAll(
      "#what-we-treat .card, .topic, .service-tier-card, .faq-card, .handwritten-accent, .blog-post-card"
    );

    if (revealElements.length > 0 && "IntersectionObserver" in window) {
      var revealObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              entry.target.classList.add("is-visible");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15 }
      );

      revealElements.forEach(function (el, index) {
        el.classList.add("js-reveal");
        var delay = (index % 4) * 75; // Stagger 0ms, 75ms, 150ms, 225ms
        el.style.transitionDelay = delay + "ms";
        revealObserver.observe(el);
      });
    }

    // -------------------------------------------------------------------------
    // 5. FAQ Accordion Interaction
    // -------------------------------------------------------------------------
    var faqButtons = document.querySelectorAll(".faq-btn, .accordion [data-toggle=\"collapse\"], .card-header [data-toggle=\"collapse\"]");
    faqButtons.forEach(function (button) {
      if (button.classList.contains("navbar-toggler")) return;
      button.addEventListener("click", function () {
        var targetSelector = button.getAttribute("data-target") || button.getAttribute("href");
        if (!targetSelector || targetSelector === "#") return;

        var targetCollapse = document.querySelector(targetSelector);
        if (!targetCollapse) return;

        var isAlreadyOpen = targetCollapse.classList.contains("show");
        var accordionParent = targetCollapse.closest(".accordion") || document.querySelector(targetCollapse.getAttribute("data-parent"));

        // If part of an accordion, close sibling collapses
        if (accordionParent) {
          var openCollapses = accordionParent.querySelectorAll(".collapse.show");
          openCollapses.forEach(function (item) {
            if (item !== targetCollapse) {
              item.classList.remove("show");
              var parentBtn = accordionParent.querySelector('[data-target="#' + item.id + '"]');
              if (parentBtn) {
                parentBtn.setAttribute("aria-expanded", "false");
                var icon = parentBtn.querySelector(".faq-icon, .fa-chevron-down");
                if (icon) icon.style.transform = "rotate(0deg)";
              }
            }
          });
        }

        // Toggle the current collapse
        if (isAlreadyOpen) {
          targetCollapse.classList.remove("show");
          button.setAttribute("aria-expanded", "false");
          var icon = button.querySelector(".faq-icon, .fa-chevron-down");
          if (icon) icon.style.transform = "rotate(0deg)";
        } else {
          targetCollapse.classList.add("show");
          button.setAttribute("aria-expanded", "true");
          var icon = button.querySelector(".faq-icon, .fa-chevron-down");
          if (icon) icon.style.transform = "rotate(180deg)";
        }
      });
    });

    // -------------------------------------------------------------------------
    // 6. Testimonial Carousel Controller
    // -------------------------------------------------------------------------
    var carousel = document.getElementById("testimonial-carousel");
    if (carousel) {
      var slides = carousel.querySelectorAll(".carousel-item");
      var indicatorItems = carousel.querySelectorAll(".carousel-indicators li");
      var prevBtn = carousel.querySelector(".carousel-control-prev");
      var nextBtn = carousel.querySelector(".carousel-control-next");
      var currentIndex = 0;
      var autoSlideInterval = 10000;
      var slideTimer = null;

      function goToSlide(index) {
        if (slides.length === 0) return;
        if (index < 0) index = slides.length - 1;
        if (index >= slides.length) index = 0;

        slides.forEach(function (slide, idx) {
          slide.classList.toggle("active", idx === index);
        });

        indicatorItems.forEach(function (li, idx) {
          li.classList.toggle("active", idx === index);
          if (idx === index) {
            li.setAttribute("aria-current", "true");
          } else {
            li.removeAttribute("aria-current");
          }
        });

        currentIndex = index;
      }

      function nextSlide() {
        goToSlide(currentIndex + 1);
      }

      function prevSlide() {
        goToSlide(currentIndex - 1);
      }

      function startAutoSlide() {
        stopAutoSlide();
        slideTimer = setInterval(nextSlide, autoSlideInterval);
      }

      function stopAutoSlide() {
        if (slideTimer) {
          clearInterval(slideTimer);
          slideTimer = null;
        }
      }

      if (nextBtn) {
        nextBtn.addEventListener("click", function (e) {
          e.preventDefault();
          nextSlide();
          startAutoSlide();
        });
      }

      if (prevBtn) {
        prevBtn.addEventListener("click", function (e) {
          e.preventDefault();
          prevSlide();
          startAutoSlide();
        });
      }

      indicatorItems.forEach(function (li, idx) {
        li.addEventListener("click", function (e) {
          e.preventDefault();
          goToSlide(idx);
          startAutoSlide();
        });
      });

      // Pause on hover
      carousel.addEventListener("mouseenter", stopAutoSlide);
      carousel.addEventListener("mouseleave", startAutoSlide);

      // Start auto slide
      startAutoSlide();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSite);
  } else {
    initSite();
  }
})();
