(function(libs) {
    console.log("Node importer starting up");

    const path = require("path");
    var list = document.getElementsByTagName("script");

    for (let i = 0; i < list.length; i++) {
        const elem = list[i];

        const libPath = elem.getAttribute("src");
        const name = elem.getAttribute("as");

        if (elem.hasAttribute("lib") && libPath != null) {
            const filePath = path.join(libs, libPath);
            console.log("Importing file " + filePath + ((name != null) ? "as " + name : ""));

            if (name != null) window[name] = require(filePath);
            else require(filePath);

            elem.remove();
        }
    }
})