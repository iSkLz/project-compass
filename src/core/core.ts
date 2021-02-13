import Config from "./config.js";
import LogHelper from "../helpers/log.js";
import { execFile } from "child_process";

interface CoreConfig {
    firstLaunch: boolean;
    celestePath: string;
    debug: boolean;
}

const defaultConfig: CoreConfig = {
    firstLaunch: true,
    celestePath: "",
    debug: false
};

export default class Core {
    public static Instance: Core;

    public config: Config;
    public mainConfig: CoreConfig;

    constructor() {
        Core.Instance = this;
        this.config = new Config("core");
        this.mainConfig = this.config.get<CoreConfig>("core.json", defaultConfig);
    }

    public init() {
        if (this.mainConfig.firstLaunch) {
            this.firstLaunch();

            this.mainConfig.firstLaunch = false;
            this.config.save();

            // Restart
            let args = process.argv;
            args.shift();
            execFile(process.execPath, args);
            process.abort();
        }
    }

    public firstLaunch() {
        
    }
}