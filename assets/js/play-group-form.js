/*!
 * Custom script for handling the Play Group interest form submission.
 * Works with jqBootstrapValidation.js for client-side validation.
 * Submits form data via AJAX to the Formspree endpoint specified in the HTML form's action attribute.
 * Uses shared utility functions from contact_me_utils.js.
 */

$(function () {
  PPFormUtils.init({
    formSelector: "#playGroupForm",
    successSelector: "#playGroupSuccess",
    buttonSelector: "#sendPlayGroupMessageButton",
    getData: function () {
      return {
        name: $("input#playGroupName").val(),
        email: $("input#playGroupEmail").val(),
      };
    },
    successMsg:
      "<strong>Thank you for your interest! We'll notify you about upcoming play groups. </strong>",
    failMsg:
      "Sorry {firstName}, there was an issue submitting your interest. Please try again later!",
    errorMsg:
      "Sorry {firstName}, it seems there was a problem submitting your interest. Please try again later!",
    focusSelectors: "#playGroupName, #playGroupEmail",
  });
});
