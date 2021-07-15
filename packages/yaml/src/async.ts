import path from "path";
import fs from "fs";
import YAML from "yaml";

import { AsyncConfigStore } from "@dynaconfig/core";

const asyncDriver = {
  ensureSource: async (filePath: string) => {
    const file = await fs.promises.open(filePath, "a");
    await file.close();
    return;
  },
  getConfigFromSource: async (filePath: string) => {
    const data = await fs.promises.readFile(filePath);
    return YAML.parse(data.toString());
  },
  saveConfig: async (filePath: string, newObj: Record<string, unknown>) => {
    // Serialize the object
    const yamlString = YAML.stringify(newObj);

    // Store new object in yaml file
    await fs.promises.writeFile(filePath, yamlString);
    return;
  },
};

export class AsyncYamlFile extends AsyncConfigStore {
  constructor(fileName = "config.yaml") {
    const filePath = path.resolve(process.cwd(), fileName);
    super(filePath, asyncDriver);
  }
}

export default AsyncYamlFile;
