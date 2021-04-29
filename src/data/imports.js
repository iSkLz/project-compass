(function(libs) {
    const path = require("path");
    const $ = require("jquery");

    /**
     * Imports a Node.JS library
     * @param {string} lib Path to the library relative to web/libs
     * @param {boolean} defaultExport Whether to use the default export of the script
     * @param {boolean} global Whether to import the script in the global scope
     * @param {boolean} node Whether to interprate the lib string as a Node.JS module name
     */
    window.importLib = (lib, defaultExport = true, global = false, node = false) => {
        const filePath = node ? lib : path.join(libs, lib);

        if (global) {
            let script = document.createElement("script");
            script.src = filePath;
            document.head.appendChild(script);
            return;
        }

        return defaultExport ? require(filePath).default : require(filePath);
    }

    $.ready.then(() => {
        var list = document.querySelectorAll("script");

        for (let i = 0; i < list.length; i++) {
            const elem = list[i];

            const libPath = elem.getAttribute("src");
            const name = elem.getAttribute("as");

            const flags = elem.getAttribute("data");
            const def = flags == null || flags.indexOf("default") != -1;
            const global = flags != null && flags.indexOf("global") != -1;
            const node = flags != null && flags.indexOf("node") != -1;

            // Lib elements with a specified path
            if (elem.hasAttribute("lib") && libPath != null) {
                var lib = window.importLib(libPath, def, global, node);
                if (name != null) window[name] = lib;

                elem.remove();
            }
        }
    });
})