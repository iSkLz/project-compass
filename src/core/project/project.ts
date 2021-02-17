import fs from "fs";
import path from "path";

export default class Project {
    public name: string;
    public dir: string;

    constructor(filePath: string) {
        let file = JSON.parse(fs.readFileSync(path.normalize(filePath), "utf8"));
        this.name = file.name;
        this.dir = path.parse(filePath).dir;
    }
}