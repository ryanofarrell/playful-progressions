// purgecss.config.js
module.exports = {
  content: ["_site/**/*.html", "_site/**/*.js"],
  css: [
    "_site/assets/css/agency.css",
    "_site/assets/css/bootstrap.min.css",
    "_site/assets/css/all.min.css",
  ],
  // Add this safelist to protect dynamic classes
  safelist: ["show", "collapse", "collapsing", "navbar-shrink", "active"],
  output: "_site/assets/css/",
};
