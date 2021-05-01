import Core from "./core.js";
import { app } from "electron";
import { serializeError } from "serialize-error";
import os from "../helpers/os.js";
import UIWindow from "./ui/ui.js";

// TODO: Tray

function logException(ex: Error) {
    // TODO: Log more useful information for known errors

    // List of known errors:
    // - Bad JSON (mostly in IPC handlers)

    // TODO: Log error when the logger is finished
    var details = serializeError(ex);

    console.log(JSON.stringify(details));

    app.exit(-1);
}

app.on("window-all-closed", () => {
    if (!os.isMac) {
        for (const [ID, win] of UIWindow.Instances) {
            win.destroy();
        }
        app.quit();
    }
});

app.once("ready", () => {
    try {
        new Core().init();
    } catch (ex) {
        logException(ex);
    }
});

//process.on("uncaughtException", logException);