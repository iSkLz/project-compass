import pathHelper from "../helpers/paths.js";
import fs from "fs";
import path from "path";

export default class Config {
    // A static member to keep track of all current Config instances
    public static Instances: WeakSet<Config> = new WeakSet<Config>();

    private root: string;
    private config: Map<string, any>;

    constructor(folder: string) {
        // Register the newly cosntructed Config instance
        Config.Instances.add(this);

        this.root = path.join(pathHelper.save, path.normalize(folder));
        this.config = new Map<string, any>();

        // Create a function that can recursively travel a directories tree
        const recurse = (dir: string) => {            
            // Read the contents of the directory as dirents
            const contents: fs.Dirent[] = fs.readdirSync(dir, {withFileTypes: true});

            // Loop through the contents
            for (const element of contents) {
                // If it's a directory, look into it
                if (element.isDirectory()) {
                    recurse(path.join(dir, element.name));
                    continue;
                }

                const filePath = path.join(dir, element.name);
                // Get the path relative to the specified root
                const storePath = path.relative(this.root, filePath);
                
                // Read the file as JSON, and store it
                this.config.set(storePath, JSON.parse(fs.readFileSync(filePath, "utf8")));
            }
        }

        recurse(this.root);
    }

    /**
     * Saves the current Config to the filesystem
     * Compass automatically calls this when needed
     */
    public save(): void {
        // Iterate every file, serialize its content to JSON and save it to its respective path
        for (const keyValue of this.config) {
            const [key, value] = keyValue;
            fs.writeFileSync(path.join(this.root, key), JSON.stringify(value));
        }
    }

    /**
     * Gets the value of a path
     * @param pathName The path of the value to get
     * @param defaultValue The value to use in case the path doesn't exist yet
     * @returns The value of the requested path
     */
    public get<T>(pathName: string, defaultValue: T): T {
        pathName = path.normalize(pathName);

        let value: T;
        // Use the default value if the path doesn't exist yet
        if (!this.config.has(pathName)) this.config.set(pathName, value = defaultValue);
        else value = this.config.get(pathName);

        return value;
    }

    /**
     * Merges an object into an existing one
     * @param pathName The path of the object to merge
     * @param merged The object to merge
     * @param override Whether to override existing properties
     * @returns The new merged object
     */
    public merge(pathName: string, merged: any, override: boolean = true): any {
        pathName = path.normalize(pathName);

        // Get the target object
        let obj = this.get<any>(pathName, {});

        // If overriding properties is allowed, use Object.assign
        if (override) return Object.assign(obj, merged);

        // Otherwise manually copy the properties one by one
        const keys = Object.keys(merged);
        for (const key of keys) {
            // Do not override existing properties
            if (obj.hasOwnProperty(key)) continue;

            obj[key] = merged[key];
        }

        return obj;
    }

    /**
     * Sets the value of a path
     * @param pathName Path of the value to set
     * @param value The value to set
     * @returns The set value
     */
    public set<T>(pathName: string, value: T): T {
        this.config.set(path.normalize(pathName), value);
        return value;
    }
}