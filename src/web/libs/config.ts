import { ipcRenderer } from "electron";

class ConfigLib {
    public static Instance: ConfigLib = new ConfigLib();

    public get(id: string, path: string) {
        // Good thing this compiles to normal window.ID
        const ID = (window as any).ID;
        
        return JSON.parse(ipcRenderer.sendSync(ID, JSON.stringify({
            winID: ID,
            type: "config",
            id, path
        })));
    }

    public set(id: string, path: string, value: any) {
        const ID = (window as any).ID;
        
        ipcRenderer.sendSync(ID, JSON.stringify({
            winID: ID,
            type: "config",
            id, path, value
        }));
    }
}

export default ConfigLib.Instance;