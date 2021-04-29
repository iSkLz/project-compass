import fs from "fs";
import path from "path";

export const enum ScanOptions {
    /**
     * Scan for both directories and files
     */
    all,
    /**
     * Scan for both directories and file but don't scan inner directories
     */
    dirsNoRecursion,
    /**
     * Scan for ony files
     */
    onlyFiles,
    /**
     * Don't scan for anything
     */
    none
}

type fileCallback = 
/**
 * @param file The full path of the file
 * @param dir The full path of the parent directory
 * @returns Whether the file should be included in the returned files list
 */
(file: string, dir: string) => boolean;

type dirCallback =
/**
 * @param dir The full path of the directory
 * @returns How the directory should be scanned
 */
(dir: string) => ScanOptions;

class Utils {
    public static Instance = new Utils();

    constructor() {
        this.recurseScan = this.recurseScan.bind(this);
    }

    /**
     * Recursively scans a directory tree for all files.
     * @param root The directory to scan
     * @param relativeMode Whether the returned paths should be relative to the root directory
     * @param callback A callback to call on each file found
     * @param dirCallback An optional callback to call on each folder found
     * @param type What to scan for
     * @param dir Used internally inside the function, do not specify this manually
     * @returns A list of file paths within the directory tree
     */
    public recurseScan(
        root: string,
        relativeMode: boolean = false,
        type: ScanOptions = ScanOptions.all,
        callback: fileCallback = () => true,
        dirCallback: dirCallback = () => ScanOptions.all,
        dir: string = "."
    ): string[] {    
        if (type === ScanOptions.none) return [];
        root = path.normalize(root);

        let list: string[] = [];
        
        // Use fs.Dirents
        const entries = fs.readdirSync(path.join(root, dir), {
            withFileTypes: true
        });

        entries.forEach((dirent) => {
            const fullPath = path.join(dir, dirent.name);
            if (dirent.isDirectory() && type !== ScanOptions.onlyFiles) {
                if (type === ScanOptions.dirsNoRecursion)
                    dirCallback(fullPath);
                else
                // TODO: Is spreading slower than Array.Concat?
                    list = [
                        ...list,
                        // dirCallback decides the mode for child directories
                        ...(this.recurseScan(root, true, dirCallback(fullPath), callback, dirCallback, fullPath))
                    ];
            }
            else {
                if (callback(fullPath, root))
                    list.push(fullPath);
            }
        });

        return relativeMode ? list : list.map(entry => path.join(root, entry));
    }

    /**
     * Converts a map into an object by mapping keys/values
     * .toString is used for non-string keys
     * @param map The map to convert
     */
    public mapToObject<K, V>(map: Map<K, V>): any {
        const obj: any = {};
        for (const kvp of map) {
            const [k, v] = kvp;

            let key: string | symbol;
            if (typeof k === "string" || typeof k === "symbol") {
                key = k;
            } else {
                key = (k as any).toString();
            }

            // Recursively serialize child maps
            if (v instanceof Map)
                obj[key] = this.mapToObject(v);
            else
                obj[key] = v;
        }

        return obj;
    }

    public objectToMap<K, V>(obj: any): Map<K, V> {
        const map = new Map<K, V>();
        if (typeof obj === "string") obj = JSON.parse(obj);

        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                map.set((key as any), obj[key]);
            }
        }

        return map;
    }
}

export default Utils.Instance;