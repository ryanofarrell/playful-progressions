const fs = require("fs");
const path = require("path");
const csso = require("csso");

const targetFile = path.resolve(__dirname, "../_includes/critical.css");
if (!fs.existsSync(targetFile)) {
  console.error("Critical CSS file not found at", targetFile);
  process.exit(1);
}

const css = fs.readFileSync(targetFile, "utf8");
const ast = csso.syntax.parse(css);

const fontFaces = new Set();
const mediaQueries = new Map();
const regularRules = new Set();
const keyframes = new Map();
const otherAtRules = new Set();

ast.children.forEach(node => {
  if (node.type === "Atrule") {
    if (node.name === "font-face") {
      fontFaces.add(csso.syntax.generate(node));
    } else if (node.name === "media") {
      const query = node.prelude ? csso.syntax.generate(node.prelude) : "";
      if (!mediaQueries.has(query)) {
        mediaQueries.set(query, new Set());
      }
      if (node.block && node.block.children) {
        node.block.children.forEach(child => {
          mediaQueries.get(query).add(csso.syntax.generate(child));
        });
      }
    } else if (node.name === "keyframes" || node.name === "-webkit-keyframes") {
      const kfName = node.prelude ? csso.syntax.generate(node.prelude) : "";
      const kfKey = node.name + "_" + kfName;
      if (!keyframes.has(kfKey)) {
        keyframes.set(kfKey, csso.syntax.generate(node));
      }
    } else {
      otherAtRules.add(csso.syntax.generate(node));
    }
  } else if (node.type === "Rule") {
    regularRules.add(csso.syntax.generate(node));
  }
});

let combined = Array.from(fontFaces).join("") + 
               Array.from(keyframes.values()).join("") + 
               Array.from(otherAtRules).join("") + 
               Array.from(regularRules).join("");

mediaQueries.forEach((rules, query) => {
  combined += "@media " + query + "{" + Array.from(rules).join("") + "}";
});

const optimized = csso.minify(combined, { restructure: true }).css;
fs.writeFileSync(targetFile, optimized, "utf8");
console.log("Critical CSS deduplicated: " + css.length + "B -> " + optimized.length + "B (" + Math.round((1 - optimized.length / css.length) * 100) + "% reduction)");
