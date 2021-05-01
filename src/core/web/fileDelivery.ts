import { protocol } from "electron";
import { serializeError } from "serialize-error";
import fs, { createReadStream } from "fs";
import path from "path";

// TODO: Implement formats
//const extensions = JSON.parse(fs.readFileSync(path.join(PathHelper.data, "fileTypes.json"), "utf8"));
const extensions = {
    html: "text/html",
    css: "text/css",
    js: "application/javascript",
    json: "application/json",
    ttf: "font/ttf",
    ico: "image/vnd.microsoft.icon",
    png: "image/png",
    svg: "image/svg+xml",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
};

export default function fileDelivery(name: string, dir: string) {
    // Long sessions will unevitably run into conflicting protocol names
    // Most of the time, window IDs
    protocol.unregisterProtocol(name);
    return protocol.registerStreamProtocol(name, (request, callback) => {
        let requestPath = path.join(dir, request.url.substring(name.length + 3));

        if (!fs.existsSync(requestPath)) {
            callback({
                statusCode: 404,
                data: "File not found."
            });
            return
        }

        // TODO: Implement a proper directory check
        try {
            const dirents = fs.readdirSync(requestPath);
            callback({
                statusCode: 200,
                headers: {
                    "x-type": "dir",
                    "content-type": "application/json",
                },
                data: JSON.stringify(dirents)
            });
        } catch {
            try {
                let fileExt = path.parse(requestPath).ext;
                let fileType = extensions[(fileExt.substring(1).toLowerCase()) as keyof typeof extensions];

                callback({
                    statusCode: 200,
                    headers: {
                        "x-type": "file",
                        "content-type": fileType
                    },
                    data: fs.createReadStream(requestPath)
                });
            } catch (err) {
                callback({
                    // Internal Sever Error
                    statusCode: 500,
                    data: Buffer.from(JSON.stringify(serializeError(err)))
                })
            }
        }
    })
}