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
    public pics: string;
    public temp: string;

    // Other apps
    public ahornStorage: string;

    constructor() {
        this.root = path.join(module.path, "..");
        this.save = path.join(this.root, "save");
        this.data = path.join(this.root, "data");
        this.web = path.join(this.root, "web");
        this.pics = path.join(this.root, "pics");
        this.temp = path.join(this.root, "temp");
        
        if (!fs.existsSync(this.save)) fs.mkdirSync(this.save);
        if (!fs.existsSync(this.temp)) fs.mkdirSync(this.temp);

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

    public from(originPath: string, relativePath: string) {
        return path.join(originPath, relativePath);
    }

    public tempDir(relativePath: string) {
        let resPath = this.from(this.temp, relativePath);
        
        if (!fs.existsSync(resPath)) fs.mkdirSync(resPath, {
            recursive: true
        });

        return this.from.bind(this, resPath);
    }
}

export default PathsHelper.instance;