import Config from "../config.js";
import Registery from "./registery.js";
import Plugin from "./plugin.js";
import Project from "../project/project.js";

export interface ModuleInfo {
    packageID: string;
    ID: string;
    displayName: string;
    author: string;
    path: string;
}

export default class Module {
    public info: ModuleInfo;

    /**
     * A list of attached plugins
     */
    public plugins: Plugin[] = [];

    public config: Config;

    constructor(info: ModuleInfo, lib: any = null) {
        this.info = info;
        this.config = new Config(info.path);

        Registery.register(this, lib);
    }

    /**
     * Called when a plugin request is sent. Override in your own class
     * @param plugin The sent plugin
     */
    public onPlugin(plugin: Plugin): boolean {
        return false;
    }

    /**
     * Called when a project is being saved to a file. Override in your own class
     * @param project The project being saved
     * @param before Whether the call is happening before the project has been saved
     */
    public onProjectSave(project: Project, before: boolean): void {}

    // Used for serialization
    /**
     * Returns the module ID
     */
    public toString(): string {
        return this.info.ID;
    }
}