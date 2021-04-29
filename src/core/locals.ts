import fs from "fs";
import { ipcMain } from "electron";
import utils from "../helpers/utils.js";

class LocalsManager {
    public static Instance: LocalsManager = new LocalsManager();

    // A map of languages by ID
    // Each language is a map of locals by paths
    // Each local is a map of strings by keys
    public locals: Map<string, Map<string, Map<string, string>>> = new Map<string, Map<string, Map<string, string>>>();

    public activeLanguageID = "en-us";

    public get activeLanguage() {
        return this.getLanguage(this.activeLanguageID);
    }

    public getLanguage(ID: string) {
        ID = ID.toLowerCase();
        let local = this.locals.get(ID);

        if (local == undefined) {
            local = new Map<string, Map<string, string>>();
            this.locals.set(ID, local);
        }

        return local;
    }

    /**
     * Loads locals from a file
     * @param lang The language of the file
     * @param filePath Path to the locals file
     * @param localPath Path of the locals
     */
    public load(lang: string, filePath: string, localPath: string) {
        const content = JSON.parse(fs.readFileSync(filePath, "utf8"));
        
        // Default to the automatic path if a path isn't set in the file
        if (!content._path) content.path = localPath;
        else content.path = content._path;
        const langDict = this.getLanguage(lang);

        let dict = langDict.get(content.path);
        if (dict == undefined) {
            dict = new Map<string, string>();
            langDict.set(content.path, dict);
        }

        delete content.path;
        if (!!content._path) delete content._path;

        // Object -> map
        for (const key in content) {
            dict.set(key, content[key]);
        }

        // Recursive algorithm to replace embedded local references
        let fixLocal = (key: string): string => {
            const value = dict?.get(key) || "";

            const newvalue = value.replaceAll(/\{(\w+)\}/g, (_match, subkey) => {
                return fixLocal(subkey);
            });

            dict?.set(key, newvalue);
            return newvalue;
        };
        
        // Because it's not always a tree we need to iterate every local
        // Already fixed locals will be skipped since the regex in the function won't find anything
        for (const kvp of dict) {
            fixLocal(kvp[0]);
        }
    }
}

//#region IPC Handlers
function handleIPC(event: any, arg: any): string {
    let request = JSON.parse(arg);

    const path = request.path;
    switch (request.type) {
        case "path":
            const content = LocalsManager.Instance.activeLanguage?.get(path);
            if (content != undefined)
                return JSON.stringify(utils.mapToObject(content));
        case "key":
            const key = request.key;
            const local = LocalsManager.Instance.activeLanguage?.get(path)?.get(key);
            if (local != undefined)
                return local;
    }
    
    return JSON.stringify({});
}

ipcMain.on("local", (event, arg) => {
    event.returnValue = handleIPC(event, arg);
});

ipcMain.handle("local", async (event, arg) => {
    return handleIPC(event, arg);
});
//#endregion

export default LocalsManager.Instance;