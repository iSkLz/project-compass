(function(libs) {
    const path = require("path");
    const $ = require("jquery");

    /**
     * Imports a library available in the webs/libs folder
     * @param {string} lib Path to the library relative to web/libs
     * @param {boolean} defaultExport Whether to use the default export of the script
     * @param {boolean} global Whether to import the script in the global scope
     */
    window.importLib = (lib, defaultExport = true, global = false) => {
        const filePath = path.join(libs, lib);

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

            // Lib elements with a specified path
            if (elem.hasAttribute("lib") && libPath != null) {
                if (name != null) window[name] = window.importLib(libPath, def, global);
                else window.importLib(libPath, def, global);

                elem.remove();
            }
        }
    });
})