import { BrowserWindow, NativeImage, ipcMain, Menu } from "electron";
import EventEmitter from "events";
import path from "path";
import fs from "fs";
import locals from "../locals.js";
import Core from "../core.js";
import Config from "../config.js";
import paths from "../../helpers/paths.js";
import fileDelivery from "../web/fileDelivery.js";
import os from "../../helpers/os.js";
import { app } from "electron/main";

// TODO: This is so messed up.......
const importsScript = fs.readFileSync(paths.from(paths.data, "imports.js"), "utf8")
    + '("' + paths.from(paths.web, "libs").replaceAll("\\", "/") + '")'; // Backslashes don't make it through IPC

//#region Enums & Types
export type size = {
    width: number, height: number
};

export const enum WindowState {
    /**
     * Start the window in the OS's default state
     */
    normal,
    /**
     * Start the window maximized
     */
    maximized,
    /**
     * Start the window in fullscreen mode
     */
    fullscreen
}

export const enum MenuState {
    /**
     * Show the menu bar normally
     */
    shown,
    /**
     * Hide the menu bar but allow it to be brought up when Alt is pressed
     */
    autoHide,
    /**
     * Hide the menu bar completely (while still keeping accelerators from it)
     */
    hidden,
    /**
     * Remove the menu bar altogether
     */
    removed
}

export const enum NodeState {
    /**
     * Enable node integration
     */
    enabled,
    /**
     * Disable node integration
     */
    disabled,
    /**
     * Disable node integration and enable sandbox mode
     */
    sandbox
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
     * Setup an IPC handler which the page can call to show itself
     */
    programmatically,

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
    
    /**
     * The menu bar to use for the window, null for nothing
     */
    menuBar: Menu | null;

    /**
     * Visibility state of the menu bar
     */
    menuBarState: MenuState;
};
//#endregion

//#region Default Options
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
    nodeImporter: true,
    menuBar: null,
    menuBarState: MenuState.hidden
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
        let options: WindowOptions = (winOptions as WindowOptions);
        for (const key in defaultWinOptions) {
            if ((options as any)[key] == undefined) {
                (options as any)[key] = (defaultWinOptions as any)[key];
            }
        }
        
        this.window = new BrowserWindow({
            width: size.width, height: size.height,
            minWidth: minSize.width, minHeight: minSize.height,
            title: options.defaultTitle || defaultWinOptions.defaultTitle,
            icon: options.icon || defaultWinOptions.icon,
            fullscreen: options.state === WindowState.fullscreen,
            frame: !options.frameless,
            show: options.show === ShowMode.always,
            alwaysOnTop: options.alwaysOnTop,
            skipTaskbar: !options.showInTaskbar,
            parent: options.parent,
            modal: options.modal,
            webPreferences: {
                nodeIntegration: options.nodeState === NodeState.enabled || options.nodeState == undefined,
                sandbox: options.nodeState === NodeState.sandbox,
                webviewTag: options.webview,
                devTools: Core.Instance.mainConfig.debug,
                preload: options.preload,
                contextIsolation: false
            }
        });

        // Assign the menu bar if one is specified
        if (options.menuBar != null) this.window.setMenu(options.menuBar);
        // Set its visibility state
        switch (options.menuBarState) {
            case MenuState.autoHide:
                this.window.autoHideMenuBar = true;
                this.window.setMenuBarVisibility(false);
                break;
            case MenuState.hidden:
                this.window.setMenuBarVisibility(false);
                break;
            case MenuState.removed:
                this.window.removeMenu();
                break;
        }
        
        //#region Window State
        // When closed, dereference the window and unlist from static instances array
        if (options.destroyOnClose) this.window.on("closed", () => {
            this.destroy();
        });

        // Track visibility
        this.window.on("show", () => this.visible = true);
        this.window.on("hide", () => this.visible = false);

        // Auto-show, once
        if (options.show === ShowMode.whenReady) this.window.once("ready-to-show", () => {
            this.emit("autoShow", false);
            this.window.show();
            this.emit("autoShow", true);
        });

        // Auto-maximize, once
        this.window.once("show", () => {
            switch (options.state) {
                case WindowState.maximized:
                    this.window.maximize();
            }
        });
        //#endregion

        // Assign ID, and node importer script (if enabled)
        this.window.webContents.on("did-finish-load", () => {
            this.window.webContents.executeJavaScript(`window.winID = "${ID}"`);
            if (options.nodeImporter) this.window.webContents.executeJavaScript(importsScript);
        });

        //#region IPC Handlers
        // IPC show once
        this.once("ipcSync", (request) => {
            if (request.type == "show") {
                this.emit("autoShow", false);
                this.window.show();
                this.emit("autoShow", true);
                return true;
            }
        });

        let handleConfig = (request: any) => {
            const reqID = request.id;

            if (request.value != undefined) {
                let value = JSON.parse(request.value);

                if (request.override != undefined)
                    this.configs.get(reqID)?.merge(request.path, value, request.override);
                else
                    this.configs.get(reqID)?.set(request.path, value);

                return "true";
            } else {
                return JSON.stringify(this.configs.get(reqID)?.get<any>(request.path, null));
            }
        };

        this.on("ipcSync", handleConfig);
        this.on("ipcInvoke", handleConfig);

        let handleIPC = (arg: any, channel: string) => {
            let request = JSON.parse(arg);

            // Use the first event handler that doesn't return undefined
            const handlers = this.rawListeners(`ipc${channel}`);
            let res = undefined;

            for (let i = 0; i < handlers.length; i++) {
                res = handlers[i](request);
                if (res !== undefined) break;
            }

            return res;
        }

        // Setup IPC handlers (synchronous and asynchronous and... invokeronous?)
        ipcMain.on(ID, (event, arg) => {
            event.returnValue = handleIPC(arg, "Sync");
        });

        ipcMain.handle(`${ID}-invoke`, (_event, arg) => {
            return handleIPC(arg, "Invoke");
        });

        ipcMain.on(`${ID}-async`, (event, arg) => {
            let request = JSON.parse(arg);

            switch (request.type) {
                default:
                    this.emit("ipcAsync", event, request);
            }
        });
        //#endregion

        // Bind functions to this (so they can access it consistently from all calling contexts)
        this.addConfig = this.addConfig.bind(this);
        this.toggleVisibility = this.toggleVisibility.bind(this);
        this.serveContent = this.serveContent.bind(this);
        this.loadServed = this.loadServed.bind(this);
        this.destroy = this.destroy.bind(this);
    }

    public destroy() {
        (this.window as any) = null;
        UIWindow.Instances.delete(this.ID);
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