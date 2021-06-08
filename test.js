const { task } = require("./build/main.js");
const { helpers, node } = require("./build/main.js");
const { performance } = require("perf_hooks");
const path = require("path");
const log = node.log;
const outputs = [];
function formatter(message, level, tag) {
    return message;
}
(async () => {
    outputs.push(await log.LoggerOutput.fromFile(path.resolve(__dirname, "test.js.log.txt")));
    const logger = new log.Logger(outputs, formatter);
    const start = performance.now();
    for (let i = 0; i < 9999; i++) {
        logger.log("" + (i + 1));
    }
    await logger.onFullFinish;
    const end = performance.now();
    console.log(end - start, (end - start) / 9999, 9999 / ((end - start) / 1000));
})();