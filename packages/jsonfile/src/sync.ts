import path from "path";
import fs from "fs";
import { ConfigStore } from "@dynaconfig/core";

const syncDriver = {
  ensureSource: (filePath: string) => {
    fs.closeSync(fs.openSync(filePath, "a"));
    return;
  },
  getConfigFromSource: (filePath: string) => {
    const data = fs.readFileSync(filePath);
    return data.toString().trim().length > 0 ? JSON.parse(data.toString()) : {};
  },
  saveConfig: (filePath: string, newObj: Record<string, unknown>) => {
    // Serialize the object
    const jsonString = JSON.stringify(newObj);

    // Store new object in json file
    fs.writeFileSync(filePath, jsonString);
    return;
  },
};

export class SyncJsonFile extends ConfigStore {
  constructor(fileName = "config.json") {
    const filePath = path.resolve(process.cwd(), fileName);
    super(filePath, syncDriver);
  }
}

export default SyncJsonFile;
