if (global.compassBooted === true && (global.window != undefined && window.document != undefined)) {
    console.log("REQUIIIIIIIIIIIRE!!!!!!!!!");
    // Compass has booted, meaning a module is requiring this, so we expose the APIs according to the environment
    let API = {
        helpers: {
            paths: require("./build/helpers/paths.js"),
            os: require("./src/helpers/os")
        }
    };

    if (window.document != undefined) {
        console.log("WEBBBBBBB!!!!!!!!!");
        // Web only APIs
        API.config = require("./build/core/web/libs/config.js");
        API.locals = require("./build/core/web/libs/locals.js");
        API.libs = require("./build/core/web/libs/libs.js");
    }
    else {
        // Main process only APIs
        console.log("MAAAAAAAINOOOOOOOOO-SAAAAAAN!!!!!!!!!");
    }

    module.exports = API;
} else {
    // Compass hasn't booted before, so Compass is requested to boot
    // (An external module can get Compass imports by setting compassBooted to true)
    require("./build/boot.js").default.then((core) => {
        // We can do something with the core here if needed
    });
}