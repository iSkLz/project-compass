import Core from "./core.js";
import { app } from "electron";

app.whenReady().then(() => new Core().init());