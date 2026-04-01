/**
 * Utility functions for name manipulation.
 */
(function (root) {
  var PPNameUtils = {
    /**
     * Extracts the first name from a full name string.
     * @param {string} name - The full name string.
     * @returns {string} The first name or an empty string if no name is provided.
     */
    extractFirstName: function (name) {
      if (!name) return "";
      var trimmedName = name.trim();
      if (!trimmedName) return "";
      return trimmedName.split(/\s+/)[0];
    },
  };

  // Export for browser
  root.PPNameUtils = PPNameUtils;

  // Export for Node.js testing environment
  if (typeof module !== "undefined" && module.exports) {
    module.exports = PPNameUtils;
  }
})(typeof window !== "undefined" ? window : global);
