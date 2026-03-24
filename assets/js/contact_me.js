/*!
 * Custom script for handling the contact form submission.
 * Works with jqBootstrapValidation.js for client-side validation.
 * Submits form data via AJAX to the Formspree endpoint specified in the HTML form's action attribute.
 * Uses shared utility functions from contact_me_utils.js.
 */

$(function () {
  PPFormUtils.init({
    formSelector: "#contactForm",
    successSelector: "#success",
    buttonSelector: "#sendMessageButton",
    getData: function () {
      return {
        name: $("input#name").val(),
        email: $("input#email").val(),
        message: $("textarea#message").val(),
      };
    },
    successMsg: "<strong>Your message has been sent. </strong>",
    failMsg:
      "Sorry {firstName}, there was an issue sending your message. Please try again later or contact us directly!",
    errorMsg:
      "Sorry {firstName}, it seems that my mail server is not responding or there was a network issue. Please try again later!",
    focusSelectors: "#name, #email, #message",
  });

  // Handle clicks on tabs (if any, standard Agency theme feature)
  $('a[data-toggle="tab"]').click(function (e) {
    e.preventDefault();
    $(this).tab("show");
  });
});
