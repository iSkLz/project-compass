import Config from "./config.js";
import LogHelper from "../helpers/log.js";
import PathHelper from "../helpers/paths.js";
import { execFile } from "child_process";

import path from "path";
import UIWindow, { NodeState, ShowMode, WindowState } from "./ui/ui.js";

interface CoreConfig {
    firstLaunch: boolean;
    celestePath: string;
    ahornPath: string;
    debug: boolean;
}

const defaultConfig: CoreConfig = {
    firstLaunch: true,
    celestePath: "",
    ahornPath: "",
    debug: true
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
        } else {
            // TODO: Implement normal startup code
        }
    }

    public restart() {
        let args = process.argv;
        args.shift();
        execFile(process.execPath, args);
        this.shutdown();
    }

    public shutdown() {
        this.config.save();
        process.abort();
    }

    public firstLaunch() {
        this.mainConfig.firstLaunch = false;

        let UI = new UIWindow({
            width: 800,
            height: 800
        },
        {
            defaultTitle: "Celestial Compass - First Launch",
            state: WindowState.maximized,
            icon: "compass.png",
            frameless: false,
            show: ShowMode.whenReady,
            alwaysOnTop: false,
            showInTaskbar: true,
            parent: undefined,
            modal: false,
            nodeState: NodeState.enabled,
            preload: "",
            webview: true
        });

        UI.addConfig("main", this.config);
        UI.serveContent(PathHelper.fromRoot("web/firstLaunch"))("index.html");

        UI.on("ipcAsync", (event, req) => {
            if (req.finished) this.restart();
        });
    }
}