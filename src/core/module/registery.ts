import Module, { ModuleInfo } from "./module.js";
import Plugin from "./plugin.js";

class ModulesRegistery {
    public static Instance = new ModulesRegistery();

    private modules: Map<string, Module>;
    private libs: Map<string, any>;

    constructor() {
        this.modules = new Map<string, Module>();
        this.libs = new Map<string, any>();
    }

    /**
     * Returns an iterable list of all existing modules and their corresponding IDs
     */
    public getAllModules() {
        return this.modules.entries();
    }

    /**
     * Gets a module object by its ID
     * @param ID ID of the module
     */
    public getModule(ID: string): Module {
        const target = this.modules.get(ID);
        if (target === undefined) throw new Error("Target module doesn't exist");
        return target;
    }

    /**
     * Get the library of a specific module
     * @param ID ID of the library's module
     */
    public getLibrary(ID: string): any {
        return this.libs.get(ID);
    }

    /**
     * Registers a module and optionally a library.
     * Compass automatically calls this when needed
     * @param module The module to register
     * @param lib The library associated with the module
     */
    public register(module: Module, lib: any) {
        this.modules.set(module.info.ID, module);
        this.libs.set(module.info.ID, lib);
    }

    /**
     * Sends a plugin request
     * @param plugin The plugin object
     * @returns An error if one was thrown or a boolean for whether the plugin was accepted
    */
    public sendPlugin(plugin: Plugin) {
        try {
            const target = this.getModule(plugin.to);
            const res = target.onPlugin(plugin);
            if (res) {
                plugin.onAccept(plugin);
                return true;
            } else {
                plugin.onDenial(plugin);
                return false;
            }
        } catch (err) {
            return err as Error;
        }
    }
}

export default ModulesRegistery.Instance;