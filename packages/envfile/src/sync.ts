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
    return envfile.parse(data.toString()) as Record<string, unknown>;
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
  constructor(fileName = ".env") {
    const filePath = path.resolve(process.cwd(), fileName);
    super(filePath, syncDriver);
  }
}

export default SyncEnvFile;
