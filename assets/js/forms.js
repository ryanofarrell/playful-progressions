/**
 * Vanilla ES6 Form Handling for Contact & Play Group forms.
 * Provides client-side validation, accessible feedback, and Formspree AJAX submission without jQuery.
 */
document.addEventListener("DOMContentLoaded", function () {
  function setupForm(formId, successContainerId, options) {
    const form = document.getElementById(formId);
    const feedbackContainer = document.getElementById(successContainerId);
    if (!form || !feedbackContainer) return;

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnContent = submitBtn ? submitBtn.innerHTML : "";

    // Clear feedback when user interacts with inputs
    form.querySelectorAll("input, textarea").forEach(function (input) {
      input.addEventListener("focus", function () {
        feedbackContainer.innerHTML = "";
      });
    });

    function showFeedback(isSuccess, message) {
      feedbackContainer.innerHTML = `
        <div class="alert alert-${isSuccess ? "success" : "danger"} alert-dismissible fade show" role="alert" aria-live="polite">
          <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
          <strong>${message}</strong>
        </div>
      `;

      // Handle close button click without jQuery
      const closeBtn = feedbackContainer.querySelector(".close");
      if (closeBtn) {
        closeBtn.addEventListener("click", function () {
          feedbackContainer.innerHTML = "";
        });
      }
    }

    form.addEventListener("submit", async function (event) {
      event.preventDefault();

      // HTML5 Constraint Validation check
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      const url = form.getAttribute("action");
      if (!url || !url.startsWith("https://formspree.io/")) {
        console.error("Invalid form action URL:", url);
        return;
      }

      const nameInput = form.querySelector('input[name="name"], input#name, input#playGroupName');
      const name = nameInput ? nameInput.value : "";
      const firstName =
        window.PPNameUtils && typeof window.PPNameUtils.extractFirstName === "function"
          ? window.PPNameUtils.extractFirstName(name)
          : name.trim().split(/\s+/)[0] || "";

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2" aria-hidden="true"></i> Sending...';
      }

      const formData = new FormData(form);

      try {
        const response = await fetch(url, {
          method: "POST",
          body: formData,
          headers: {
            Accept: "application/json",
          },
        });

        const data = await response.json().catch(function () {
          return {};
        });

        if (response.ok) {
          const successMsg =
            options && options.successMessage
              ? options.successMessage
              : "Your message has been sent.";
          showFeedback(true, successMsg);
          form.reset();
        } else {
          const errorMsg =
            data && data.errors && data.errors.length
              ? data.errors.map(function (e) { return e.message; }).join(", ")
              : `Sorry ${firstName ? firstName : "there"}, there was an issue sending your message. Please try again later or contact us directly!`;
          showFeedback(false, errorMsg);
        }
      } catch (err) {
        console.error("Form submission network error:", err);
        showFeedback(
          false,
          `Sorry ${firstName ? firstName : "there"}, it seems there was a network issue. Please try again later!`
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnContent;
        }
      }
    });
  }

  // Initialize Contact Form
  setupForm("contactForm", "success", {
    successMessage: "Your message has been sent.",
  });

  // Initialize Play Group Form
  setupForm("playGroupForm", "playGroupSuccess", {
    successMessage: "Thank you for your interest! We'll notify you about upcoming play groups.",
  });
});
