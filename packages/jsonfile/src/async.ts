import path from "path";
import fs from "fs";
import { AsyncConfigStore } from "@dynaconfig/core";

const asyncDriver = {
  ensureSource: async (filePath: string) => {
    const file = await fs.promises.open(filePath, "a");
    await file.close();
    return;
  },
  getConfigFromSource: async (filePath: string) => {
    const data = await fs.promises.readFile(filePath);
    return data.toString().trim().length > 0 ? JSON.parse(data.toString()) : {};
  },
  saveConfig: async (filePath: string, newObj: Record<string, unknown>) => {
    // Serialize the object
    const jsonString = JSON.stringify(newObj, null, "  ");

    // Store new object in json file
    await fs.promises.writeFile(filePath, jsonString);
    return;
  },
};

export class AsyncJsonFile extends AsyncConfigStore {
  constructor(fileName = "config.json") {
    const filePath = path.resolve(process.cwd(), fileName);
    super(filePath, asyncDriver);
  }
}

export default AsyncJsonFile;
