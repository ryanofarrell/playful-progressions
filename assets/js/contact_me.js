/*!
 * Custom script for handling the contact form submission.
 * Works with jqBootstrapValidation.js for client-side validation.
 * Submits form data via AJAX to the Formspree endpoint specified in the HTML form's action attribute.
 */

$(function () {
  // Initialize jqBootstrapValidation for the contact form
  $("#contactForm input,#contactForm textarea").jqBootstrapValidation({
    preventSubmit: true, // Prevent default HTML form submission
    submitError: function ($form, event, errors) {
      // Additional error messages or events can be handled here if needed
      // jqBootstrapValidation will display default error messages based on data-validation attributes
    },
    submitSuccess: function ($form, event) {
      event.preventDefault(); // Prevent default submit behaviour (already done by preventSubmit: true, but good to keep)

      // Get values from FORM
      // var url = "https://formspree.io/" + "{% if site.formspree_form_path %}{{ site.formspree_form_path }}{% else %}{{ site.email }}{% endif %}"; // Removed this line
      var url = $form.attr("action"); // Get the submission URL directly from the form's action attribute

      var name = $("input#name").val();
      var email = $("input#email").val();
      // var phone = $("input#phone").val(); // Removed phone as per previous change
      var message = $("textarea#message").val();
      var firstName = name; // For Success/Failure Message

      // Check for white space in name for Success/Fail message
      if (firstName.indexOf(" ") >= 0) {
        firstName = name.split(" ").slice(0, -1).join(" ");
      }

      $this = $("#sendMessageButton");
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
          // Formspree returns a JSON response on success
          if (response.ok) {
            // Check if Formspree indicated success
            // Success message
            $("#success").html("<div class='alert alert-success'>");
            $("#success > .alert-success")
              .html(
                "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;"
              )
              .append("</button>");
            $("#success > .alert-success").append(
              "<strong>Your message has been sent. </strong>"
            );
            $("#success > .alert-success").append("</div>");
            // Clear all fields
            $("#contactForm").trigger("reset");
            // Formspree handles the redirect via the _next hidden input, so no manual redirect needed here
          } else {
            // Handle cases where Formspree responded but indicated an error
            // This might happen with spam detection, etc.
            $("#success").html("<div class='alert alert-danger'>");
            $("#success > .alert-danger")
              .html(
                "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;"
              )
              .append("</button>");
            $("#success > .alert-danger").append(
              $("<strong>").text(
                "Sorry " +
                  firstName +
                  ", there was an issue sending your message. Please try again later or contact us directly!"
              )
            );
            $("#success > .alert-danger").append("</div>");
          }
        },

        error: function (jqXHR, textStatus, errorThrown) {
          // Handle AJAX error (e.g., network issue, incorrect Formspree URL leading to 404/500)
          console.error(
            "Form submission error:",
            textStatus,
            errorThrown,
            jqXHR
          ); // Log error details
          // Fail message
          $("#success").html("<div class='alert alert-danger'>");
          $("#success > .alert-danger")
            .html(
              "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;"
            )
            .append("</button>");
          $("#success > .alert-danger").append(
            $("<strong>").text(
              "Sorry " +
                firstName +
                ", it seems that my mail server is not responding or there was a network issue. Please try again later!"
            )
          );
          $("#success > .alert-danger").append("</div>");
          // No reset here, let user see their input to try again
        },

        complete: function () {
          setTimeout(function () {
            $this.prop("disabled", false); // Re-enable submit button when AJAX call is complete
            $this.html(originalButtonText);
          }, 1000); // Re-enable after 1 second
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

  // Clear success/failure messages when the name input is focused
  $("#name").focus(function () {
    $("#success").html("");
  });

  // Clear success/failure messages when other inputs are focused
  $("#email").focus(function () {
    $("#success").html("");
  });

  $("#message").focus(function () {
    $("#success").html("");
  });
});
