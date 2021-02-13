import UIWindow, { NodeState, ShowMode, WindowState } from "../ui.js";

export default class FirstLaunchWindow extends UIWindow {
    constructor() {
        super({
            width: 800,
            height: 800
        },
        {
            defaultTitle: "Celestial Compass - First Launch",
            state: WindowState.maximized,
            icon: "compass.png",
            frameless: false,
            show: ShowMode.whenReady,
            alwaysOnTop: false,
            showInTaskbar: true,
            parent: undefined,
            modal: false,
            nodeState: NodeState.enabled,
            preload: "",
            webview: true
        });

        super.window.loadURL
    }
}