import Module, { ModuleInfo } from "./module/module.js";
import registery from "./module/registery.js";
import locals from "./locals.js";
import fs from "fs";
import path from "path";
import Window from "./ui/ui.js";
import fileDelivery from "./web/fileDelivery.js";
import paths from "../helpers/paths.js";
import Config from "./config.js";
import log from "../helpers/log.js";
import utils, { ScanOptions } from "../helpers/utils.js";

// TODO: Implement naming, versioning, and updating (via github)
// TODO: Add the package manager UI

interface Package {
    ID: string;
    modules?: ModuleInfo[];
}

class PackageManager {
    public static Instance: PackageManager = new PackageManager();

    /**
     * Loads a package by its path
     * @param filePath Path of the package file
     */
    public load(filePath: string) {
        filePath = path.normalize(filePath);
        const dir = path.parse(filePath).dir;
        const localsDir = path.join(dir, "locals");
        const pkg: Package = JSON.parse(fs.readFileSync(filePath, "utf8"));

        pkg.modules?.forEach(moduleInfo => {
            const helper = {
                // Classes
                Window,
                Module,
                Config,

                // Singletons
                registery,
                paths,
                log,
                utils,

                // Functions
                fileDelivery
            };

            const entry: (arg: typeof helper) => void = require(path.join(moduleInfo.path, "main.js"));
            entry(helper);
        });

        if (fs.existsSync(localsDir)) {
            // Scan for inner directories, which are language-named (en-us, fr-fr, en-ca ...etc)
            utils.recurseScan(localsDir, false, ScanOptions.all, () => false, (dir) => {
                // Then scan for all inner .json files
                dir = path.join(localsDir, dir);
                const langID = path.parse(dir).name;

                utils.recurseScan(dir, true, ScanOptions.all,
                    (file) => file.endsWith(".json")).forEach((localPath) => {
                        const fullPath = path.join(localsDir, dir, localPath);
                        const defaultPath = path.join(pkg.ID, localPath.substring(0, localPath.length - 5));
        
                        // Directory's name is the language ID
                        locals.load(langID, fullPath, defaultPath);
                    }
                );

                // Scan directories only one level deep
                // We handle the deeper levels with the inner scan above
                return ScanOptions.none;
            });
        }
    }

    /**
     * Scans a directory for packages
     * @param dir The directory to scan
     */
    public scan(dir: string) {
        dir = path.normalize(dir);
        utils.recurseScan(dir, false, ScanOptions.all, (file) => file.endsWith("compass.json")).forEach((pkg) => {
            this.load(pkg);
        });
    }
}

export default PackageManager.Instance;