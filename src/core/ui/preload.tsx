import { contextBridge } from "electron/renderer";
import fs from "fs";
import path from "path";
import $ from "jquery";

export const enum LibType {
    web = "web", helper = "helper", compass = "compass", nothing = "direct"
}

export const enum ImportType {
    nodeJS = "node", script = "script"
}

export default function(rootPath: string, preload: string, optionsJSON: string) {
    let options = JSON.parse(optionsJSON);

    function importLib(lib: string, type: LibType = LibType.web, importType: ImportType = ImportType.nodeJS, defaultExport: boolean = true) {
        // No import for you, Mr. No NodeJS
        if (options.nodeState != 0) return null;

        let libPath: string = lib;
        switch (type) {
            case LibType.web:
                libPath = path.join(rootPath, "web/libs", lib);
                break;
            case LibType.helper:
                libPath = path.join(rootPath, "helpers", lib);
                break;
            case LibType.compass:
                libPath = path.join(rootPath, lib);
                break;
        }

        switch (importType) {
            case ImportType.nodeJS:
                return defaultExport ? require(libPath).default : require(libPath);
            case ImportType.script:
                return libPath;
        }
    }

    function autoImport() {
        if (!options.nodeImporter) return;

        var list = document.querySelectorAll("script");

        for (let i = 0; i < list.length; i++) {
            const elem = list[i];

            if (elem.hasAttribute("lib")) {
                const libPath = elem.getAttribute("src");
                const name = elem.getAttribute("as");
                const _libType = elem.getAttribute("kind") || LibType.web;
                const _importType = elem.getAttribute("type") || ImportType.nodeJS;

                const flags = elem.getAttribute("data");
                const def = flags == null || flags.indexOf("default") != -1;

                if (libPath != null) {
                    // Typescript can be pretty dumb sometimes
                    let libType: LibType = LibType.web;
                    switch (_libType) {
                        case LibType.helper:
                            libType = LibType.helper;
                        case LibType.compass:
                            libType = LibType.compass;
                        case LibType.nothing:
                            libType = LibType.nothing;
                    }
                    let importType: ImportType = ImportType.nodeJS;
                    if (_importType == ImportType.script) importType = ImportType.script;

                    const lib = importLib(libPath, libType, importType, def);
                    if (name != null) (window as any)[name] = lib;
                    if (importType === ImportType.script) {
                        let script = document.createElement("script");
                        script.src = lib;
                        document.head.appendChild(script);
                    }
                }

                elem.remove();
            }
        }
    };

    let API = {
        importLib, autoImport
    };

    if (options.isolatePreload) contextBridge.exposeInMainWorld("compass", API);
    else {
        (window as any).compass = API;
    }

    if (fs.existsSync(preload)) require(preload);
    else try {
        eval(preload);
    } catch {}
}