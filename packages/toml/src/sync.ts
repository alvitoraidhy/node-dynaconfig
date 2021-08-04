import path from "path";
import fs from "fs";
import TOML from "@iarna/toml";

import { ConfigStore } from "@dynaconfig/core";

const syncDriver = {
  ensureSource: (filePath: string) => {
    fs.closeSync(fs.openSync(filePath, "a"));
    return;
  },
  getConfigFromSource: (filePath: string) => {
    const data = fs.readFileSync(filePath);
    return TOML.parse(data.toString());
  },
  saveConfig: (filePath: string, newObj: Record<string, unknown>) => {
    // Serialize the object
    const tomlString = TOML.stringify(newObj as Record<string, never>);

    // Store new object in toml file
    fs.writeFileSync(filePath, tomlString);
    return;
  },
};

export class SyncTomlFile extends ConfigStore {
  constructor(fileName = "config.toml") {
    const filePath = path.resolve(process.cwd(), fileName);
    super(filePath, syncDriver);
  }
}

export default SyncTomlFile;
