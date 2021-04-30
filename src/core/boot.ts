import Core from "./core.js";
import { app } from "electron";
import { serializeError } from "serialize-error";
import os from "../helpers/os.js";

// TODO: Tray

app.on("window-all-closed", () => {
    if (!os.isMac) app.quit();
})

app.once("ready", () => {
    try {
        new Core().init();
    } catch (ex) {
        // TODO: Log more useful information for known errors

        // List of known errors:
        // - Bad JSON (mostly in IPC handlers)

        // TODO: Log error when the logger is finished
        var details = serializeError(ex);

        app.exit(-1);
    }
});