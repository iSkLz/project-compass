import { ipcRenderer } from "electron";
import $ from "jquery";

$.ready.then(() => {
    var defaultPath = document.head.hasAttribute("locals-path") ? document.head.getAttribute("locals-path") : undefined;
    var list = document.getElementsByTagName("local");
    
    for (let i = 0; i < list.length; i++) {
        const elem = list[i] as HTMLElement;

        const path = defaultPath || elem.getAttribute("path");
        const key = elem.getAttribute("key") || "";
        elem.innerText = ipcRenderer.sendSync("local", JSON.stringify({
            path, key
        }));
    }
});