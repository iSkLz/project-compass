import Config from "../config.js";
import Registery from "./registery.js";
import Plugin from "./plugin.js";

export interface ModuleInfo {
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
     * Called when a plugin request is sent, override in your own class.
     * @param plugin The sent plugin
     */
    public onPlugin(plugin: Plugin) {
        return false;
    }
}