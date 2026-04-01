const assert = require("assert");
const PPNameUtils = require("./name_utils.js");

const testCases = [
  { input: "John", expected: "John", message: "Single name should be returned as is" },
  { input: "John Doe", expected: "John", message: "First name should be extracted from two names" },
  { input: "John Jacob Jingleheimer Schmidt", expected: "John", message: "First name should be extracted from multiple names" },
  { input: "  John  ", expected: "John", message: "Leading and trailing spaces should be trimmed" },
  { input: "John   Doe", expected: "John", message: "Multiple spaces between names should be handled" },
  { input: "", expected: "", message: "Empty string should return empty string" },
  { input: null, expected: "", message: "null should return empty string" },
  { input: undefined, expected: "", message: "undefined should return empty string" },
  { input: "   ", expected: "", message: "String with only spaces should return empty string" },
];

console.log("Running PPNameUtils.extractFirstName tests...");

let passed = 0;
let failed = 0;

testCases.forEach((test) => {
  try {
    const result = PPNameUtils.extractFirstName(test.input);
    assert.strictEqual(result, test.expected, test.message);
    console.log(`✅ PASS: ${test.message} ("${test.input}" -> "${result}")`);
    passed++;
  } catch (error) {
    console.error(`❌ FAIL: ${test.message}`);
    console.error(`   Expected: "${test.expected}"`);
    console.error(`   Actual:   "${error.actual}"`);
    failed++;
  }
});

console.log(`\nTests finished: ${passed} passed, ${failed} failed.`);

if (failed > 0) {
  process.exit(1);
}
