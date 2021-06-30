import path from "path";
import fs from "fs";
import * as envfile from "envfile";
import { AsyncConfigStore } from "@dynaconfig/core";

const asyncDriver = {
  ensureConfigFile: async (filePath: string) => {
    const file = await fs.promises.open(filePath, "a");
    await file.close();
    return;
  },
  getConfigFromFile: async (filePath: string) => {
    const data = await fs.promises.readFile(filePath);
    return envfile.parse<Record<string, unknown>>(data.toString());
  },
  saveConfig: async (filePath: string, newObj: Record<string, unknown>) => {
    // Serialize the object
    const envString = envfile.stringify(newObj);

    // Store new object in env file
    await fs.promises.writeFile(filePath, envString);
    return;
  },
};

export class AsyncEnvFile extends AsyncConfigStore {
  constructor(filePath: string = path.resolve(process.cwd(), ".env")) {
    super(filePath, asyncDriver);
  }
}

export default AsyncEnvFile;
