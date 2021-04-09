import fs from "fs";
import { ipcMain } from "electron";

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
    }
}

ipcMain.on("local", (event, arg) => {
    let request = JSON.parse(arg);

    const path = request.path;
    const key = request.key;
    
    // TODO: Try/Catch and return proper error
    event.returnValue = LocalsManager.Instance.activeLanguage?.get(path)?.get(key)?.replace(/\\n/g, "<br>");
});

export default LocalsManager.Instance;