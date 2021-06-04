const scan = require("./build/main.js");
scan(1, true, (file) => {
    console.log(file);
    return file.endsWith(".json");
});