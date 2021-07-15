import path from "path";
import fs from "fs";
import YAML from "yaml";

import { ConfigStore } from "@dynaconfig/core";

const syncDriver = {
  ensureSource: (filePath: string) => {
    fs.closeSync(fs.openSync(filePath, "a"));
    return;
  },
  getConfigFromSource: (filePath: string) => {
    const data = fs.readFileSync(filePath);
    return YAML.parse(data.toString());
  },
  saveConfig: (filePath: string, newObj: Record<string, unknown>) => {
    // Serialize the object
    const yamlString = YAML.stringify(newObj);

    // Store new object in yaml file
    fs.writeFileSync(filePath, yamlString);
    return;
  },
};

export class SyncYamlFile extends ConfigStore {
  constructor(fileName = "config.yaml") {
    const filePath = path.resolve(process.cwd(), fileName);
    super(filePath, syncDriver);
  }
}

export default SyncYamlFile;
