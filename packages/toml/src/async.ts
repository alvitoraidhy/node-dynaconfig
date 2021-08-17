import path from "path";
import fs from "fs";
import TOML from "@iarna/toml";

import { AsyncConfigStore } from "@dynaconfig/core";

const asyncDriver = {
  ensureSource: async (filePath: string) => {
    const file = await fs.promises.open(filePath, "a");
    await file.close();
    return;
  },
  getConfigFromSource: async (filePath: string) => {
    const data = await fs.promises.readFile(filePath);
    return TOML.parse(data.toString());
  },
  saveConfig: async (filePath: string, newObj: Record<string, unknown>) => {
    // Serialize the object
    const tomlString = TOML.stringify(newObj as Record<string, never>);

    // Store new object in toml file
    await fs.promises.writeFile(filePath, tomlString);
    return;
  },
};

export class AsyncTomlFile extends AsyncConfigStore {
  constructor(fileName = "config.toml") {
    const filePath = path.resolve(process.cwd(), fileName);
    super(filePath, asyncDriver);
  }
}

export default AsyncTomlFile;
