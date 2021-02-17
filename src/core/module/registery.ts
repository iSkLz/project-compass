import Module, { ModuleInfo } from "./module.js";
import Plugin from "./plugin.js";

class ModulesRegistery {
    public static instance = new ModulesRegistery();

    private modules: Map<string, Module>;
    private libs: Map<string, any>;

    constructor() {
        this.modules = new Map<string, Module>();
        this.libs = new Map<string, any>();
    }

    private getModule(ID: string): Module {
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
     * Get the module info of a specific module
     * @param ID ID of the module
     */
    public getModInfo(ID: string): ModuleInfo {
        return this.getModule(ID).info;
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
     * @returns True if the target module received the plugin request correctly, an error otherwise
     */
    public sendPlugin(plugin: Plugin) {
        try {
            const target = this.getModule(plugin.to);
            const res = target.onPlugin(plugin);
            if (res) plugin.onAccept(plugin);
            else plugin.onDenial(plugin);
            return true;
        } catch (err) {
            return err as Error;
        }
    }
}

export default ModulesRegistery.instance;