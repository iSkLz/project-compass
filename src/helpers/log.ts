import fs from "fs";
import Path from "path";
import PathHelper from "./paths.js";

export const enum LogLevels {
    Debug, Info, Error
}

class LogHelper {
    public static Instance = new LogHelper();

    public enableDebug: boolean = false;
    
    private terminated: boolean = false;
    private logFile: fs.WriteStream;

    constructor() {
        this.logFile = fs.createWriteStream(Path.join(PathHelper.root, "log.txt"));
    }

    public terminate(): void {
        this.terminated = true;
        this.logFile.close();
    }

    public log(message: string, level: LogLevels = LogLevels.Info): void {
        if (this.terminated) return;

        // TODO: Implement file logging

        switch (level) {
            case LogLevels.Debug:
                if (this.enableDebug) console.trace(message);
                break;
            case LogLevels.Info:
                console.log(message);
                break;
            case LogLevels.Error:
                console.error(message);
                console.info
                break;
        }
    }
}

export default LogHelper.Instance;