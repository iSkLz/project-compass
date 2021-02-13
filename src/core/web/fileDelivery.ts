import { protocol } from "electron";
import fs from "fs";
import path from "path";

// TODO: Implement all MIME types
const extensions = {
    text: ["html", "js", "css", "xml", "json", "txt"],
    image: ["png", "svg", "jpg", "jpeg", "bmp", "gif"]
};

export default function fileDelivery(name: string, dir: string) {
    protocol.registerStreamProtocol(name, (request, callback) => {
        let filePath = path.join(request.url.substring(name.length + 3));
        let fileExt = path.parse(filePath).ext;
        
        let fileMIME = MIME

        callback({
            statusCode: 200,
            headers: {
                "content-type": "text/html"
            },
            data: fs.createReadStream("")
        })
    })
}