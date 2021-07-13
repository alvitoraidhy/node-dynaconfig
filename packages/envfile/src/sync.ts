import path from "path";
import fs from "fs";
import * as envfile from "envfile";
import { ConfigStore } from "@dynaconfig/core";

const syncDriver = {
  ensureSource: (filePath: string) => {
    fs.closeSync(fs.openSync(filePath, "a"));
    return;
  },
  getConfigFromSource: (filePath: string) => {
    const data = fs.readFileSync(filePath);
    return envfile.parse<Record<string, unknown>>(data.toString());
  },
  saveConfig: (filePath: string, newObj: Record<string, unknown>) => {
    // Serialize the object
    const envString = envfile.stringify(newObj);

    // Store new object in env file
    fs.writeFileSync(filePath, envString);
    return;
  },
};

export class SyncEnvFile extends ConfigStore {
  constructor(filePath: string = path.resolve(process.cwd(), ".env")) {
    super(filePath, syncDriver);
  }
}

export default SyncEnvFile;
