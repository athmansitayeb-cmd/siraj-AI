// test.js
const { processInput } = require("./brain.cjs");

(async () => {
  try {
    const result = await processInput("السلام عليكم");
    console.log(result);
  } catch (err) {
    console.error("Error during processInput:", err);
  }
})();
