import { ipcRenderer } from "electron";

// Note: Caching configs is a terrible idea, because the main process and the renderer process can go unsynchronized easily
// However, the nature of config paths makes requests quick enough to remove the need of a cache

//#region Requests
function getRequest(id: string, path: string) {
    return JSON.stringify({
        type: "config",
        id, path
    });
}

function setRequest(id: string, path: string, value: any) {
    return JSON.stringify({
        type: "config",
        id, path, value
    });
}

function mergeRequest(id: string, path: string, value: any, override: boolean) {
    return JSON.stringify({
        type: "config",
        id, path, value, override
    });
}
//#endregion

//#region Synchornous
export function getSync(id: string, path: string) {
    const ID = (window as any).winID;
    
    return JSON.parse(ipcRenderer.sendSync(ID, getRequest(id, path)));
}

export function setSync(id: string, path: string, value: any) {
    const ID = (window as any).winID;
    
    ipcRenderer.sendSync(ID, setRequest(id, path, value));
}

export function mergeSync(id: string, path: string, value: any, override: boolean = true) {
    const ID = (window as any).winID;
    
    ipcRenderer.sendSync(ID, mergeRequest(id, path, value, override));
}
//#endregion

//#region Asynchornous
export function getAsync(id: string, path: string) {
    return new Promise<any>((resolve, reject) => {
        const ID = (window as any).winID;
    
        ipcRenderer.invoke(ID, getRequest(id, path)).then((value) => resolve(JSON.parse(value)));
    });
}

export function setAsync(id: string, path: string, value: any) {
    return new Promise<void>((resolve, reject) => {
        const ID = (window as any).winID;
        
        ipcRenderer.invoke(ID, setRequest(id, path, value)).then(() => resolve());
    });
}

export function mergeAsync(id: string, path: string, value: any, override: boolean) {
    return new Promise<void>((resolve, reject) => {
        const ID = (window as any).winID;
        
        ipcRenderer.invoke(ID, mergeRequest(id, path, value, override)).then(() => resolve());
    });
}
//#endregion