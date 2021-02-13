import os from 'os';

export const enum OSType {
    linux = 0, win = 1, mac = 2
}

class OSHelper {
    public static instance = new OSHelper();

    public type: OSType;

    constructor() {
        switch (os.type().toLowerCase()) {
            case "darwin":
                this.type = OSType.mac;
            case "windows_nt":
                this.type = OSType.win;
            default:
                this.type = OSType.linux;
        }
    }
}

export default OSHelper.instance;