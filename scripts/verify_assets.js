/**
 * Asset & Link Integrity Validator
 * Checks that all front matter images exist and all generated HTML assets in _site resolve.
 */
const fs = require("fs");
const path = require("path");

let totalErrors = 0;

// 1. Verify Post Front Matter Images
const postsDir = path.resolve(__dirname, "../_posts");
if (fs.existsSync(postsDir)) {
  const postFiles = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
  console.log(`Checking ${postFiles.length} blog posts front-matter images...`);

  postFiles.forEach((file) => {
    const filePath = path.join(postsDir, file);
    const content = fs.readFileSync(filePath, "utf8");

    const teaserMatch = content.match(/teaser:\s*([^\s\n\r#]+)/);
    const imageMatch = content.match(/^image:\s*([^\s\n\r#]+)/m);

    const imagePaths = [];
    if (teaserMatch && teaserMatch[1]) imagePaths.push(teaserMatch[1]);
    if (imageMatch && imageMatch[1]) imagePaths.push(imageMatch[1]);

    imagePaths.forEach((imgPath) => {
      if (imgPath.startsWith("/")) {
        const localPath = path.resolve(__dirname, "..", imgPath.replace(/^\//, ""));
        if (!fs.existsSync(localPath)) {
          console.error(`❌ [Missing Image] Post "${file}" references missing file: ${imgPath}`);
          totalErrors++;
        }
      }
    });
  });
}

// 2. Verify _site HTML Output Assets if _site exists
const siteDir = path.resolve(__dirname, "../_site");
if (fs.existsSync(siteDir)) {
  console.log("Checking generated HTML files in _site for missing local assets...");

  function getHtmlFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach((file) => {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results = results.concat(getHtmlFiles(fullPath));
      } else if (file.endsWith(".html")) {
        results.push(fullPath);
      }
    });
    return results;
  }

  const htmlFiles = getHtmlFiles(siteDir);
  console.log(`Found ${htmlFiles.length} HTML files to inspect.`);

  const missingAssets = new Set();

  htmlFiles.forEach((htmlPath) => {
    const htmlContent = fs.readFileSync(htmlPath, "utf8");

    // Match image src attributes
    const srcRegex = /<img[^>]+src=["']([^"']+)["']/g;
    let match;
    while ((match = srcRegex.exec(htmlContent)) !== null) {
      const src = match[1];
      if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("//") || src.startsWith("data:")) {
        continue;
      }
      const cleanSrc = src.split("?")[0].split("#")[0];
      const targetFile = cleanSrc.startsWith("/")
        ? path.join(siteDir, cleanSrc.replace(/^\//, ""))
        : path.resolve(path.dirname(htmlPath), cleanSrc);

      if (!fs.existsSync(targetFile)) {
        missingAssets.add(`HTML: ${path.relative(siteDir, htmlPath)} -> Missing Asset: ${src}`);
      }
    }
  });

  if (missingAssets.size > 0) {
    missingAssets.forEach((err) => {
      console.error(`❌ [Missing Asset in _site] ${err}`);
      totalErrors++;
    });
  }
}

if (totalErrors > 0) {
  console.error(`\n❌ Asset integrity check failed with ${totalErrors} error(s).`);
  process.exit(1);
} else {
  console.log("✅ All front matter and site assets verified successfully!");
}
