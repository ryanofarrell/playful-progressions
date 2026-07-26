/*!
 * Custom script for handling the contact form submission.
 * Works with jqBootstrapValidation.js for client-side validation.
 * Submits form data via AJAX to the Formspree endpoint specified in the HTML form's action attribute.
 */

$(function () {
  var $success = $("#success");

  // Helper to display alert messages
  var showAlert = function (isSuccess, message) {
    $success.html(
      $("<div>")
        .addClass(
          "alert alert-" +
            (isSuccess ? "success" : "danger") +
            " alert-dismissible",
        )
        .attr("role", "alert")
        .append(
          $("<button>")
            .attr({
              type: "button",
              class: "close",
              "data-dismiss": "alert",
              "aria-label": "Close",
            })
            .append($("<span>").attr("aria-hidden", "true").html("&times;")),
        )
        .append($("<strong>").text(message)),
    );
  };

  // Initialize jqBootstrapValidation for the contact form
  $("#contactForm input,#contactForm textarea").jqBootstrapValidation({
    preventSubmit: true, // Prevent default HTML form submission
    submitSuccess: function ($form, event) {
      event.preventDefault(); // Prevent default submit behaviour (already done by preventSubmit: true, but good to keep)

      // Get values from FORM
      var url = $form.attr("action"); // Get the submission URL directly from the form's action attribute

      // Basic URL validation: Ensure it starts with the expected Formspree prefix
      if (!url || url.indexOf("https://formspree.io/") !== 0) {
        console.error("Invalid form action URL: " + url);
        return;
      }

      var name = $("input#name").val();
      var email = $("input#email").val();
      // var phone = $("input#phone").val(); // Removed phone as per previous change
      var message = $("textarea#message").val();
      var firstName = window.PPNameUtils
        ? window.PPNameUtils.extractFirstName(name)
        : name; // For Success/Failure Message

      var $this = $("#sendMessageButton");
      var originalButtonText = $this.html();
      $this.prop("disabled", true); // Disable submit button until AJAX call is complete to prevent duplicate messages
      $this.html("<i class='fas fa-spinner fa-spin'></i> Sending...");

      // Perform AJAX POST request to the Formspree endpoint
      $.ajax({
        url: url, // Use the URL from the form's action attribute
        type: "POST",
        dataType: "json", // Expecting JSON response from Formspree
        data: {
          name: name,
          // phone: phone, // Removed phone from data
          email: email,
          message: message,
          // Include hidden fields directly if needed by Formspree or for email subject/redirect
          // Formspree automatically handles _subject and _next from hidden inputs in the form
        },
        cache: false, // Prevent caching of the AJAX request

        success: function (response) {
          // Handle successful submission response from Formspree
          var isSuccess = response.ok;
          var message = isSuccess
            ? "Your message has been sent. "
            : "Sorry " +
              firstName +
              ", there was an issue sending your message. Please try again later or contact us directly!";

          showAlert(isSuccess, message);

          if (isSuccess) {
            // Clear all fields
            $("#contactForm").trigger("reset");
          }
        },

        error: function (jqXHR, textStatus, errorThrown) {
          // Handle AJAX error
          console.error(
            "Form submission error:",
            textStatus,
            errorThrown,
            jqXHR,
          );
          // Fail message
          showAlert(
            false,
            "Sorry " +
              firstName +
              ", it seems that my mail server is not responding or there was a network issue. Please try again later!"
          );
        },

        complete: function () {
          $this.prop("disabled", false); // Re-enable submit button when AJAX call is complete
          $this.html(originalButtonText);
        },
      });
    },
    filter: function () {
      return $(this).is(":visible");
    },
  });

  // Handle clicks on tabs (if any, standard Agency theme feature)
  $('a[data-toggle="tab"]').click(function (e) {
    e.preventDefault();
    $(this).tab("show");
  });

  // Clear success/failure messages when inputs are focused
  $("#name, #email, #message").focus(function () {
    $success.html("");
  });
});
