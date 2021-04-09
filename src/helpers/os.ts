import os from 'os';

export const enum OSType {
    linux = 0, win = 1, mac = 2
}

class OSHelper {
    public static Instance = new OSHelper();

    public type: OSType;
    public isWindows: boolean = false;
    public isLinux: boolean = false;
    public isMac: boolean = false;

    constructor() {
        switch (os.type().toLowerCase()) {
            case "darwin":
                this.type = OSType.mac;
                this.isMac = true;
            case "windows_nt":
                this.type = OSType.win;
                this.isWindows = true;
            default:
                this.type = OSType.linux;
                this.isLinux = true;
        }
    }
}

export default OSHelper.Instance;