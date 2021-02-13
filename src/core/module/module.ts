import Config from "../config.js";
import Registery from "./registery.js";
import Plugin from "./plugin.js";

export interface ModuleInfo {
    ID: string;
    displayName: string;
    author: string;
    path: string;
}

/**
 * A list of available namespaces
 */
export const enum ModuleNamespaces {
    /**
     * Gives modules a simple tool to store and load configurations
     */
    Config,
    /**
     * Allows modules to query about each other
     */
    Registery
}

export default class Module {
    public info: ModuleInfo;

    /**
     * A list of attached plugins
     */
    public plugins: Plugin[] = [];

    constructor(info: ModuleInfo, lib: any = null) {
        this.info = info;

        Registery.register(this, lib);
    }

    /**
     * Retrieves a specific namespace
     * @param namespace The namespace ID to retrieve
     */
    public getNamespace(namespace: ModuleNamespaces): Config | typeof Registery {
        switch (namespace) {
            case ModuleNamespaces.Registery:
                return Registery;
            default:
                return new Config(this.info.ID);
        }
    }

    /**
     * Called when a plugin request is sent, override in your own class.
     * @param plugin The sent plugin
     */
    public onPlugin(plugin: Plugin) {
        return false;
    }
}