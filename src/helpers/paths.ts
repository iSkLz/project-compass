import OSHelper from "./os.js";
import path from "path";
import fs from "fs";
import Core from "../core/core.js";

class PathsHelper {
    public static instance = new PathsHelper();

    // General
    public appStorage: string;

    // Compass
    public root: string;
    public save: string;
    public data: string;
    public web: string;

    // Other apps
    public ahornStorage: string;

    constructor() {
        this.root = path.join(module.path, "..");
        this.save = path.join(this.root, "save");
        this.data = path.join(this.root, "data");
        this.web = path.join(this.root, "web");
        if (!fs.existsSync(this.save)) fs.mkdirSync(this.save);

        if (OSHelper.isWindows) {
            this.appStorage = process.env.LOCALAPPDATA as string;
        } else {
            this.appStorage = process.env.XDG_CONFIG_HOME || path.join(process.env.HOME as string, ".config");
        }

        this.ahornStorage = path.join(this.appStorage, "Ahorn");
    }

    get celeste(): string {
        return Core.Instance.mainConfig.celestePath;
    }

    public fromRoot(relativePath: string) {
        return path.join(this.root, relativePath);
    }
}

export default PathsHelper.instance;