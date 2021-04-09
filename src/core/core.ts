import Config from "./config.js";
import logger from "../helpers/log.js";
import paths from "../helpers/paths.js";
import utils, { ScanOptions } from "../helpers/utils.js";
import locals from "./locals.js";
import { execFile } from "child_process";

import path from "path";
import UIWindow, { NodeState, ShowMode, WindowState } from "./ui/ui.js";
import fileDelivery from "./web/fileDelivery.js";

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

        const localsDir = paths.fromRoot("data/locals");
        // Scan for inner directories, which are language-named (en-us, fr-fr, en-ca ...etc)
        utils.recurseScan(localsDir, false, ScanOptions.all, () => false, (dir) => {
            // Then scan for all inner .json files
            dir = path.join(localsDir, dir);
            const langID = path.parse(dir).name;
            
            utils.recurseScan(dir, true, ScanOptions.all,
                (file) => file.endsWith(".json")).forEach((localPath) => {
                    const fullPath = path.join(dir, localPath);
                    // Directory's name is the language ID
                    locals.load(langID, fullPath, path.join("core", localPath));
                }
            );

            // Scan directories only one level deep
            // We handle the deeper levels with the inner scan above
            return ScanOptions.none;
        });
    }

    public init() {
        fileDelivery("styles", paths.fromRoot("web/styles"));
        fileDelivery("libs", paths.fromRoot("web/libs"));

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
        UI.serveContent(paths.fromRoot("web/firstLaunch"))("index.html");

        UI.on("ipcAsync", (event, req) => {
            if (req.finished) this.restart();
        });
    }
}