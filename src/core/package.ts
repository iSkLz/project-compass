import Module, { ModuleInfo } from "./module/module.js";
import registery from "./module/registery.js";
import fs from "fs";
import path from "path";
import Window from "./ui/ui.js";
import fileDelivery from "./web/fileDelivery.js";
import paths from "../helpers/paths.js";
import Config from "./config.js";
import log from "../helpers/log.js";

interface Package {
    modules: ModuleInfo[];
}

class PackageManager {
    public static Instance: PackageManager = new PackageManager();

    /**
     * Loads a package by its path
     * @param file Path of the package file
     */
    public load(file: string) {
        file = path.normalize(file);
        const pkg: Partial<Package> = JSON.parse(fs.readFileSync(file, "utf8"));
        pkg.modules?.forEach(moduleInfo => {
            const helper = {
                registery,
                Window,
                Module,
                fileDelivery,
                paths,
                Config,
                log
            };
            const entry: (arg: typeof helper) => void = require(path.join(moduleInfo.path, "main.js"));
            entry(helper);
        })
    }

    /**
     * Scans a directory for packages
     * @param dir The directory to scan
     */
    public scan(dir: string) {
        dir = path.normalize(dir);
        const entries = fs.readdirSync(dir, {
            withFileTypes: true
        });
        for (let entry of entries) {
            let entryPath = path.join(dir, entry.name);
            if (entry.isDirectory()) this.scan(entryPath);
            else if (entryPath.toLowerCase().endsWith("package.json")) this.load(entryPath);
        }
    }
}

export default PackageManager.Instance;