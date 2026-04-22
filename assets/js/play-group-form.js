/*!
 * Custom script for handling the Play Group interest form submission.
 * Works with jqBootstrapValidation.js for client-side validation.
 * Submits form data via AJAX to the Formspree endpoint specified in the HTML form's action attribute.
 */

$(function () {
  // Initialize jqBootstrapValidation for the Play Group form
  $("#playGroupForm input,#playGroupForm textarea").jqBootstrapValidation({
    preventSubmit: true, // Prevent default HTML form submission
    submitError: function ($form, event, errors) {
      // Additional error messages or events can be handled here if needed
      // jqBootstrapValidation will display default error messages based on data-validation attributes
    },
    submitSuccess: function ($form, event) {
      event.preventDefault(); // Prevent default submit behaviour

      // Get values from FORM
      var url = $form.attr("action"); // Get the submission URL directly from the form's action attribute

      // Basic URL validation: Ensure it starts with the expected Formspree prefix
      if (!url || url.indexOf("https://formspree.io/") !== 0) {
        console.error("Invalid form action URL: " + url);
        return;
      }

      var name = $("input#playGroupName").val();
      var email = $("input#playGroupEmail").val();
      var firstName = window.PPNameUtils
        ? window.PPNameUtils.extractFirstName(name)
        : name; // For Success/Failure Message

      var $this = $("#sendPlayGroupMessageButton");
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
          email: email,
          // Include hidden fields directly if needed by Formspree or for email subject/redirect
          // Formspree automatically handles _subject and _next from hidden inputs in the form
        },
        cache: false, // Prevent caching of the AJAX request

        success: function (response) {
          // Handle successful submission response from Formspree
          if (response.ok) {
            // Check if Formspree indicated success
            // Success message
            $("#playGroupSuccess").html(
              $("<div class='alert alert-success' role='alert'>")
                .append(
                  "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>",
                )
                .append(
                  $("<strong>").text(
                    "Thank you for your interest! We'll notify you about upcoming play groups.",
                  ),
                ),
            );
            // Clear all fields
            $("#playGroupForm").trigger("reset");
          } else {
            // Handle cases where Formspree responded but indicated an error
            $("#playGroupSuccess").html(
              $("<div class='alert alert-danger' role='alert'>")
                .append(
                  "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>",
                )
                .append(
                  $("<strong>").text(
                    "Sorry " +
                      firstName +
                      ", there was an issue submitting your interest. Please try again later!",
                  ),
                ),
            );
          }
        },

        error: function (jqXHR, textStatus, errorThrown) {
          // Handle AJAX error
          console.error(
            "Play Group form submission error:",
            textStatus,
            errorThrown,
            jqXHR,
          );
          // Fail message
          $("#playGroupSuccess").html(
            $("<div class='alert alert-danger' role='alert'>")
              .append(
                "<button type='button' class='close' data-dismiss='alert' aria-label='Close'><span aria-hidden='true'>&times;</span></button>",
              )
              .append(
                $("<strong>").text(
                  "Sorry " +
                    firstName +
                    ", it seems there was a problem submitting your interest. Please try again later!",
                ),
              ),
          );
        },

        complete: function () {
          $this.prop("disabled", false); // Re-enable submit button
          $this.html(originalButtonText);
        },
      });
    },
    filter: function () {
      return $(this).is(":visible");
    },
  });

  // Clear success/failure messages when form inputs are focused
  $("#playGroupName").focus(function () {
    $("#playGroupSuccess").html("");
  });

  $("#playGroupEmail").focus(function () {
    $("#playGroupSuccess").html("");
  });
});
