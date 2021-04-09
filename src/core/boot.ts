import Core from "./core.js";
import { app } from "electron";

app.once("ready", () => new Core().init())