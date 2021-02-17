import Module from "./module.js";

type pluginCallBack = (arg0: Plugin) => {};

export default interface Plugin {
    /**
     * The requester module
     */
    from: Module;
    /**
     * The receiver module
     */
    to: string;
    /**
     * Callback for acceptance
     */
    onAccept: pluginCallBack;
    /**
     * Callback for denial
     */
    onDenial: pluginCallBack;
    /**
     * Any other info to send for the module
     */
    data: any;
}