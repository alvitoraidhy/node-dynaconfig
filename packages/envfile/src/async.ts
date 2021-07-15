import path from "path";
import fs from "fs";
import * as envfile from "envfile";
import { AsyncConfigStore } from "@dynaconfig/core";

const asyncDriver = {
  ensureSource: async (filePath: string) => {
    const file = await fs.promises.open(filePath, "a");
    await file.close();
    return;
  },
  getConfigFromSource: async (filePath: string) => {
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
  constructor(fileName = ".env") {
    const filePath = path.resolve(process.cwd(), fileName);
    super(filePath, asyncDriver);
  }
}

export default AsyncEnvFile;
