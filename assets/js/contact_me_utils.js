(function ($) {
  "use strict";

  window.PPFormUtils = {
    /**
     * Initializes a form with jqBootstrapValidation and AJAX submission to Formspree.
     *
     * @param {Object} options - Configuration options for the form.
     * @param {string} options.formSelector - CSS selector for the form element.
     * @param {string} options.successSelector - CSS selector for the success/error message container.
     * @param {string} options.buttonSelector - CSS selector for the submit button.
     * @param {Function} options.getData - Function that returns the data object to be sent.
     * @param {string} options.successMsg - Success message HTML string.
     * @param {string} options.failMsg - Failure message string (supports {firstName} placeholder).
     * @param {string} options.errorMsg - Error message string (supports {firstName} placeholder).
     * @param {string} options.focusSelectors - CSS selectors for inputs that should clear messages on focus.
     */
    init: function (options) {
      var formSelector = options.formSelector;
      var successSelector = options.successSelector;
      var buttonSelector = options.buttonSelector;
      var getData = options.getData;
      var successMsg = options.successMsg;
      var failMsg = options.failMsg;
      var errorMsg = options.errorMsg;
      var focusSelectors = options.focusSelectors;

      $(formSelector + " input," + formSelector + " textarea").jqBootstrapValidation({
        preventSubmit: true, // Prevent default HTML form submission
        submitError: function ($form, event, errors) {
          // Additional error messages or events can be handled here if needed
        },
        submitSuccess: function ($form, event) {
          event.preventDefault(); // Prevent default submit behaviour

          var url = $form.attr("action"); // Get the submission URL directly from the form's action attribute
          var data = getData();
          var name = data.name || "";
          var firstName = name; // For Success/Failure Message

          // Check for white space in name for Success/Fail message
          if (firstName.indexOf(" ") >= 0) {
            firstName = name.split(" ").slice(0, -1).join(" ");
          }

          var $this = $(buttonSelector);
          var originalButtonText = $this.html();
          $this.prop("disabled", true); // Disable submit button until AJAX call is complete
          $this.html("<i class='fas fa-spinner fa-spin'></i> Sending...");

          // Perform AJAX POST request to the Formspree endpoint
          $.ajax({
            url: url,
            type: "POST",
            dataType: "json", // Expecting JSON response from Formspree
            data: data,
            cache: false, // Prevent caching of the AJAX request

            success: function (response) {
              // Handle successful submission response from Formspree
              if (response.ok) {
                // Check if Formspree indicated success
                $(successSelector).html("<div class='alert alert-success'>");
                $(successSelector + " > .alert-success")
                  .html(
                    "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;",
                  )
                  .append("</button>");
                $(successSelector + " > .alert-success").append(successMsg);
                $(successSelector + " > .alert-success").append("</div>");
                // Clear all fields
                $(formSelector).trigger("reset");
              } else {
                // Handle cases where Formspree responded but indicated an error
                $(successSelector).html("<div class='alert alert-danger'>");
                $(successSelector + " > .alert-danger")
                  .html(
                    "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;",
                  )
                  .append("</button>");
                $(successSelector + " > .alert-danger").append(
                  $("<strong>").text(failMsg.replace("{firstName}", firstName)),
                );
                $(successSelector + " > .alert-danger").append("</div>");
              }
            },

            error: function (jqXHR, textStatus, errorThrown) {
              // Handle AJAX error
              console.error("Form submission error:", textStatus, errorThrown, jqXHR);
              // Fail message
              $(successSelector).html("<div class='alert alert-danger'>");
              $(successSelector + " > .alert-danger")
                .html(
                  "<button type='button' class='close' data-dismiss='alert' aria-hidden='true'>&times;",
                )
                .append("</button>");
              $(successSelector + " > .alert-danger").append(
                $("<strong>").text(errorMsg.replace("{firstName}", firstName)),
              );
              $(successSelector + " > .alert-danger").append("</div>");
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

      $(focusSelectors).focus(function () {
        $(successSelector).html("");
      });
    },
  };
})(jQuery);
