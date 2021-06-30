import { Mutex } from "async-mutex";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import jsonDiff from "rus-diff";

interface ConfigSession {
  storedObj: { [key: string]: unknown };
  stagingObj: { [key: string]: unknown };

  refreshConfig(): ConfigSession | Promise<ConfigSession>;
  getConfig(): ConfigSession["stagingObj"];
}

interface SyncConfigSession extends ConfigSession {
  refreshConfig(): ConfigSession;
}

interface AsyncConfigSession extends ConfigSession {
  refreshConfig(): Promise<ConfigSession>;
}

export class ConfigStore {
  path = "";

  driver: {
    ensureConfigFile: (filePath: string) => void;
    getConfigFromFile: (filePath: string) => Record<string, unknown>;
    saveConfig: (filePath: string, newObj: Record<string, unknown>) => void;
  };

  constructor(filePath: string, driver: ConfigStore["driver"]) {
    this.path = filePath;
    this.driver = driver;

    this.driver.ensureConfigFile(this.path);
  }

  newSession(): SyncConfigSession {
    const obj = {
      storedObj: {},
      stagingObj: {},
      refreshConfig: () => {
        const data = this.driver.getConfigFromFile(this.path);
        obj.storedObj = { ...data };
        obj.stagingObj = { ...data };

        return obj;
      },
      getConfig: () => obj.stagingObj,
    };

    obj.refreshConfig();

    return obj;
  }

  persistSession(session: SyncConfigSession): this {
    const diff = jsonDiff.diff(session.storedObj, session.stagingObj);

    const fileObj = this.driver.getConfigFromFile(this.path);

    const newObj = jsonDiff.apply(fileObj, diff);

    this.driver.saveConfig(this.path, newObj);

    return this;
  }
}

export class AsyncConfigStore {
  path = "";

  mutex: Mutex = new Mutex();

  driver: {
    ensureConfigFile: (filePath: string) => Promise<void>;
    getConfigFromFile: (filePath: string) => Promise<Record<string, unknown>>;
    saveConfig: (
      filePath: string,
      newObj: Record<string, unknown>
    ) => Promise<void>;
  };

  constructor(filePath: string, driver: AsyncConfigStore["driver"]) {
    this.path = filePath;
    this.driver = driver;

    this.mutex.runExclusive(() => this.driver.ensureConfigFile(this.path));
  }

  async newSession(): Promise<AsyncConfigSession> {
    const obj = {
      storedObj: {},
      stagingObj: {},
      refreshConfig: () => {
        return this.mutex.runExclusive(async () => {
          const data = await this.driver.getConfigFromFile(this.path);
          obj.storedObj = { ...data };
          obj.stagingObj = { ...data };

          return obj;
        });
      },
      getConfig: () => obj.stagingObj,
    };

    await obj.refreshConfig();

    return obj;
  }

  persistSession(session: AsyncConfigSession): Promise<this> {
    return this.mutex.runExclusive(async () => {
      const diff = jsonDiff.diff(session.storedObj, session.stagingObj);

      const fileObj = await this.driver.getConfigFromFile(this.path);

      const newObj = jsonDiff.apply(fileObj, diff);

      await this.driver.saveConfig(this.path, newObj);

      return this;
    });
  }
}

export default AsyncConfigStore;
