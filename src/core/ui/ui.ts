import { BrowserWindow, NativeImage, ipcMain } from "electron";
import EventEmitter from "events";
import path from "path";
import fs from "fs";
import locals from "../locals.js";
import Core from "../core.js";
import Config from "../config.js";
import paths from "../../helpers/paths.js";
import fileDelivery from "../web/fileDelivery.js";

// TODO: This is so messed up.......
const importsScript = fs.readFileSync(paths.from(paths.data, "imports.js"), "utf8")
    + '("' + paths.from(paths.web, "libs").replaceAll("\\", "/") + '")'; // Backslashes don't make it through IPC

//#region Enums & Types
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
    /**
     * Show immediately
     */
    always,

    /**
     * Show when the page has fully loaded
     */
    whenReady,

    /**
     * Don't show automatically
     */
    never
}

export interface WindowOptions {
    /**
     * The default title to show for the window before a page loads
     */
    defaultTitle: string;

    /**
     * The default state of the window when showing for the first time
     */
    state: WindowState;

    /**
     * The icon to use for the window before a page loads
     */
    icon: NativeImage | string;

    /**
     * Whether to remove the window's frame
     */
    frameless: boolean;

    /**
     * When to show the window
     */
    show: ShowMode;

    /**
     * Whether to stick the window on top of all other windows in the OS
     */
    alwaysOnTop: boolean;

    /**
     * Whether to show the window in the task bar
     */
    showInTaskbar: boolean;

    /**
     * Parent (owner) window
     */
    parent: BrowserWindow | undefined;

    /**
     * Whether the window has the modal system theme
     */
    modal: boolean;

    /**
     * The type of node integration to use
     */
    nodeState: NodeState;

    /**
     * A path to a script that will be executed before every requested page is loaded
     */
    preload: string;

    /**
     * Whether to allow webview tags
     */
    webview: boolean;

    /**
     * Whether to destroy the window when closed
     */
    destroyOnClose: boolean;

    /**
     * Whether to add the node importer script
     */
    nodeImporter: boolean;
};

const defaultMinSize: size = {
    width: 100, height: 100
}

const defaultWinOptions: WindowOptions = {
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
    webview: true,
    destroyOnClose: false,
    nodeImporter: true
};
//#endregion

// Create a digits shifting object
const digitsShift = {
    "0":"a","1":"b","2":"c","3":"d","4":"e","5":"f","6":"g","7":"h","8":"i","9":"j",a:"k",b:"l",c:"m",d:"n",e:"o",f:"p",g:"q",h:"r",i:"s",j:"t",k:"u",l:"v",m:"w",n:"x",o:"y",p:"z"
};

function getRandomID() {
    // 9 digits: (26 ** 9) - 1 = 5429503678975
    let num = Math.round(Math.random() * 5429503678975).toString(26).padStart(9, "0")
        .split("").map(digit => digitsShift[digit as keyof typeof digitsShift]);
    return num.join("");
}

export default class UIWindow extends EventEmitter {
    public static Instances: Map<string, UIWindow> = new Map<string, UIWindow>();

    public window: BrowserWindow;
    public visible: boolean = false;
    public ID: string;

    private configs: Map<string, Config> = new Map<string, Config>();
    private hasDeliveryProtocol: boolean = false;

    constructor(size: size,
        winOptions: Partial<WindowOptions> = defaultWinOptions,
        minSize: size = defaultMinSize) {
        super();

        // Get a random ID that hasn't been used yet
        let ID: string;
        while (UIWindow.Instances.has(ID = getRandomID())) {}

        this.ID = ID;
        UIWindow.Instances.set(ID, this);

        // Assign default options
        for (const key in defaultWinOptions) {
            if ((winOptions as any)[key] == undefined) {
                (winOptions as any)[key] = (defaultWinOptions as any)[key];
            }
        }
        
        this.window = new BrowserWindow({
            width: size.width, height: size.height,
            minWidth: minSize.width, minHeight: minSize.height,
            title: winOptions.defaultTitle || defaultWinOptions.defaultTitle,
            icon: winOptions.icon || defaultWinOptions.icon,
            fullscreen: winOptions.state === WindowState.fullscreen,
            frame: !winOptions.frameless,
            show: winOptions.show === ShowMode.always,
            alwaysOnTop: winOptions.alwaysOnTop,
            skipTaskbar: !winOptions.showInTaskbar,
            parent: winOptions.parent,
            modal: winOptions.modal,
            webPreferences: {
                nodeIntegration: winOptions.nodeState === NodeState.enabled || winOptions.nodeState == undefined,
                sandbox: winOptions.nodeState === NodeState.sandbox,
                webviewTag: winOptions.webview,
                devTools: Core.Instance.mainConfig.debug,
                preload: winOptions.preload,
                contextIsolation: false
            }
        });
        
        if (winOptions.destroyOnClose) this.window.on("closed", () => {
            (this.window as any) = null;
            UIWindow.Instances.delete(this.ID);
        });

        // Track visibility
        this.window.on("show", () => this.visible = true);
        this.window.on("hide", () => this.visible = false);

        // Auto-show
        if (winOptions.show === ShowMode.whenReady) this.window.once("ready-to-show", () => {
            this.emit("autoShow", false);
            this.window.show();
            this.emit("autoShow", true);
        });

        // Auto-maximize, once
        this.window.once("show", () => {
            switch (winOptions.state) {
                case WindowState.maximized:
                    this.window.maximize();
            }
        });

        // Assign ID
        this.window.webContents.on("did-finish-load", () => {
            this.window.webContents.executeJavaScript(`window.winID = "${ID}"`);
            if (winOptions.nodeImporter) this.window.webContents.executeJavaScript(importsScript);
        });

        // Setup IPC handlers (synchronous and asynchronous)
        ipcMain.on(ID, (event, arg) => {
            let request = JSON.parse(arg);

            switch (request.type) {
                case "config":
                    const reqID = request.id;
                    if (request.value) this.configs.get(reqID)?.set(request.path, JSON.parse(request.value));
                    else event.returnValue = this.configs.get(reqID)?.get<any>(request.path, null);
                default:
                    // Use the first event handler that doesn't return undefined
                    const handlers = this.rawListeners("ipcSync");
                    let res = undefined;

                    for (let i = 0; i < handlers.length; i++) {
                        res = handlers[i](request);
                        if (res !== undefined) break;
                    }

                    event.returnValue = res;
            }
        });

        ipcMain.on(`${ID}-async`, (event, arg) => {
            let request = JSON.parse(arg);

            switch (request.type) {
                default:
                    this.emit("ipcAsync", event, request);
            }
        });

        this.addConfig = this.addConfig.bind(this);
        this.toggleVisibility = this.toggleVisibility.bind(this);
        this.serveContent = this.serveContent.bind(this);
        this.loadServed = this.loadServed.bind(this);
    }

    /**
     * Makes a config object available to this window's content
     * @param id The ID the page can request the config with
     * @param config The config object
     */
    public addConfig(id: string, config: Config) {
        this.configs.set(id, config);
    }

    /**
     * Hides or shows the window
     */
    public toggleVisibility() {
        if (this.visible) this.window.hide();
        else this.window.show();
    }

    /**
     * Serves a directory to the window.
     * If one has already been served, it will be replaced
     * @param dir The directory to serve
     */
    public serveContent(dir: string) {
        fileDelivery(this.ID, dir);
        this.hasDeliveryProtocol = true;
        return this.loadServed;
    }

    /**
     * Loads a file from a directory previously served using serveContent
     * Throws an error if no directory has been served
     * @param filePath Path to the file relative to the served directory
     */
    public loadServed(filePath: string) {
        // Normalize into a POSIX-style path
        filePath = path.normalize(filePath).replaceAll("\\", "/");
        if (!this.hasDeliveryProtocol) throw new Error("No directory has been served");
        this.window.loadURL(`${this.ID}://${filePath}`);
    }
}