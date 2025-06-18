// purgecss.config.js
module.exports = {
  content: ["_site /**/*.html", "_site /**/*.js"],
  css: [
    "_site/assets/css/agency.css",
    "_site/assets/css/bootstrap.min.css",
    "_site/assets/css/all.min.css",
  ],
  output: "_site/assets/css/",
};
