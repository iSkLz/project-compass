//require("@compass/core");
const { utils } = require("@libs/helpers");
const path = require("path");
module.exports = (mode, rel, filef, dirf) => {
    if (typeof mode === "string") mode = utils.ScanMode[mode];
    let opts = {mode, relativeMode: rel};
    if (filef) opts.callback = async (file) => filef(file);
    if (dirf) opts.dirCallback = async (dir) => dirf(dir);
    utils.recurseScan(path.resolve(__dirname, "node_modules"), opts).then((res) => {
        console.log(res.files);
        console.log(res.dirs);
        console.log(filef, filef(process.argv[2]));
    });
};