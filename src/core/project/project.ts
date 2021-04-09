import fs from "fs";
import path from "path";
import Module from "../module/module.js";
import registery from "../module/registery.js";
import utils from "../../helpers/utils.js";

type Dict = Map<string, any>;

export default class Project {
    public name: string = "";
    public file: string = "";

    /**
     * Whether the file the project was loaded from had module data for unexisting modules
     */
    public hasUnloadedModuleData: boolean = false;

    /**
     * A map of data
     * Meant for storing non module-specific things
     */
    public data: Dict = new Map<string, any>();

    /**
     * A list of mapped data for modules
     */
    public modulesData: Map<Module, Dict> = new Map<Module, Dict>();

    /**
     * Parses a project file into a class instance
     * Note: Module data for unexisting modules is ignored
     * @param filePath Path of the project file
     */
    public static fromFile(filePath: string): Project {
        const file = JSON.parse(fs.readFileSync(path.normalize(filePath), "utf8"));
        file.file = filePath;
        return new Project(file);
    }

    constructor(initData: any) {
        // If the argument is an object
        if (typeof initData === "object") {
            this.file = initData.file || "";

            for (const attr in initData) {
                if (!initData.hasOwnProperty(attr) || attr === "name" || attr === "mod" || attr === "modules") continue;
                this.data.set(attr, initData[attr]);
            }

            // Local function
            let setModuleData = (name: string, value: any, key: string) => {
                try {
                    const moduleObj = registery.getModule(name);
                    let moduleData = this.modulesData.get(moduleObj);

                    // First time loading the module data
                    if (moduleData === undefined) {
                        moduleData = new Map<string, any>();
                        this.modulesData.set(moduleObj, moduleData);
                    }

                    moduleData.set(key, value);
                // If an error occured while trying to set the data
                } catch {
                    // The error might not necessarily be from registery.getModule
                    // But it still counts as unloaded module data
                    // And should still trigger the prompt on saving
                    this.hasUnloadedModuleData = true;
                }
            };

            for (const attr in initData.modules) {
                if (!initData.hasOwnProperty(attr)) continue;
                const value = initData.modules[attr];
                const dashed = attr.split("-");

                // If no dash exists
                if (dashed.length === 1) {
                    setModuleData(attr, value, "main");
                } else {
                    const name = dashed.shift() as string; // We already checked a first element exists
                    const key = dashed.join("-");

                    setModuleData(name, value, key);
                }
            }
        }

        // Throw error if it isn't a string either
        if (typeof initData !== "string")
            throw new Error("Project constructor accepts either a serialized project object or a name string");

        this.name = initData;
    }

    public save(filePath: string = this.file) {
        this.file = filePath;
        const obj: any = {};
        obj.file = this.file;
        obj.data = utils.mapToObject(this.data);
        obj.modules = utils.mapToObject(this.modulesData);
    }
}