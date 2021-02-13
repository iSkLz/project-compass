import { OSType } from "./os.js";
import osHelper from "./os.js";
import path from "path";
import fs from "fs";
import Core from "../core/core.js";

class PathsHelper {
    public static instance = new PathsHelper();

    public root: string;
    public save: string;

    constructor() {
        this.root = path.join(module.path, "..");
        this.save = path.join(this.root, "save");
        if (!fs.existsSync(this.save)) fs.mkdirSync(this.save);
    }

    get celeste(): string {
        return Core.Instance.mainConfig.celestePath;
    }
}

export default PathsHelper.instance;