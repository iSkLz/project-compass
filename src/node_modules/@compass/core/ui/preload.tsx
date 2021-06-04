import { contextBridge } from "electron";
import fs from "fs";
import path from "path";

export default function(rootPath: string, preload: string, optionsJSON: string) {
    let options = JSON.parse(optionsJSON);

    let expose = {
        rootPath, options
    };

    if (options.isolatePreload) contextBridge.exposeInMainWorld("_COMPASS", expose);
    else {
        (window as any)._COMPASS = expose;
    }

    if (fs.existsSync(preload)) require(preload);
    else try {
        eval(preload);
    } catch {}
}