import { ipcRenderer } from "electron";
import $ from "jquery";
import utils from "../../helpers/utils.js";
import React, { Component } from "react";
import ReactDOM from "react-dom";

const cache = new Map<string, Map<string, string>>();
const _ERROR = "LOCAL_NOT_FOUND";
const defaultPath = document.head.hasAttribute("locals-path") ? document.head.getAttribute("locals-path") : undefined;

export function cachePathSync(path: string) {
    let pathObj = (ipcRenderer.sendSync("local", JSON.stringify({
        type: "path", path
    })));

    // FIXME: Check for error object
    cache.set(path, utils.objectToMap(pathObj));
}

export function cachePathAsync(path: string): Promise<void> {
    return new Promise((resolve, reject) => {
        ipcRenderer.invoke("local", JSON.stringify({
            type: "path", path
        })).then((pathObj) => {
            pathObj = (pathObj);
            cache.set(path, utils.objectToMap(pathObj));
            resolve();
        });
    });
}

export function requestLocalSync(path: string, key: string): string {
    let pathMap = cache.get(path);
    if (pathMap != undefined) {
        return pathMap.get(key) || _ERROR;
    } else {
        cachePathSync(path);
        return requestLocalSync(path, key); // So lazy lmao
    }
}

export async function requestLocalAsync(path: string, key: string): Promise<string> {
    return new Promise((resolve, reject) => {
        let pathMap = cache.get(path);
        if (pathMap != undefined) {
            resolve(pathMap.get(key) || _ERROR);
        } else {
            cachePathSync(path);
            pathMap = cache.get(path);
            resolve(pathMap?.get(key) || _ERROR);
        }
    });
}

export function ReactComponent(props: any) {
    return <>
        {
            requestLocalSync(props.local.path || defaultPath, props.local.key)
                .split("\n")
                .map((line, i, arr) => <>
                    {line}{i != arr.length - 1 ? <br /> : ""}
                </>)
        }
    </>;
}

$.ready.then(() => {
    if (defaultPath != undefined) cachePathSync(defaultPath);

    var list = document.querySelectorAll("local");
    for (let i = 0; i < list.length; i++) {
        const elem = list[i] as HTMLElement;

        const path = elem.getAttribute("path") || defaultPath;
        const key = elem.getAttribute("key");
        
        if (path != undefined && key != undefined)
            ReactDOM.render(<ReactComponent local={{path, key}} />, elem);
    }

    window.dispatchEvent(new Event("loaded-locals", {
        bubbles: false,
        cancelable: false
    }));
});