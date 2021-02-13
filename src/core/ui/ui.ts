import { BrowserWindow, NativeImage } from "electron";
import EventEmitter from "events";
import Core from "../core.js";

export type size = {
    width: number, height: number
};

export const enum WindowState {
    normal, maximized, fullscreen
}

export const enum NodeState {
    enabled, disabled, sandbox
}

export const enum ShowMode {
    always, whenReady, never
}

export interface WindowOptions {
    defaultTitle: string;
    state: WindowState;
    icon: NativeImage | string;
    frameless: boolean;
    show: ShowMode;
    alwaysOnTop: boolean;
    showInTaskbar: boolean;
    parent: BrowserWindow | undefined;
    modal: boolean;
    nodeState: NodeState;
    preload: string;
    webview: boolean;
};

const defaultMinSize: size = {
    width: 100, height: 100
}

const defaultWindowOptions: WindowOptions = {
    defaultTitle: "",
    state: WindowState.maximized,
    icon: "compass.png",
    frameless: false,
    show: ShowMode.whenReady,
    alwaysOnTop: false,
    showInTaskbar: true,
    parent: undefined,
    modal: false,
    preload: "",
    nodeState: NodeState.enabled,
    webview: true
};

export default class UIWindow extends EventEmitter {
    public window: BrowserWindow;
    public visible: boolean = false;

    constructor(size: size,
        window: WindowOptions = defaultWindowOptions,
        minSize: size = defaultMinSize) {
        super();

        this.window = new BrowserWindow({
            width: size.width, height: size.height,
            minWidth: minSize.width, minHeight: minSize.height,
            title: window.defaultTitle,
            icon: window.icon,
            fullscreen: window.state === WindowState.fullscreen,
            frame: !window.frameless,
            show: window.show === ShowMode.always,
            alwaysOnTop: window.alwaysOnTop,
            skipTaskbar: !window.showInTaskbar,
            parent: window.parent,
            modal: window.modal,
            webPreferences: {
                nodeIntegration: window.nodeState === NodeState.enabled,
                sandbox: window.nodeState === NodeState.sandbox,
                webviewTag: window.webview,
                devTools: Core.Instance.mainConfig.debug
            }
        });

        this.window.on("show", () => this.visible = true);
        this.window.on("hide", () => this.visible = false);

        if (window.show === ShowMode.whenReady) this.window.once("ready-to-show", () => {
            this.emit("autoShow", false);
            this.window.show();
            this.emit("autoShow", true);
        });

        this.window.once("show", () => {
            switch (window.state) {
                case WindowState.maximized:
                    this.window.maximize();
            }
        });
    }

    public toggleVisibility() {
        if (this.visible) this.window.hide();
        else this.window.show();
    }
}