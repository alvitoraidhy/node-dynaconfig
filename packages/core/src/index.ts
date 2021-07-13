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
  uri = "";

  driver: {
    ensureSource: (uri: string) => void;
    getConfigFromSource: (uri: string) => Record<string, unknown>;
    saveConfig: (uri: string, newObj: Record<string, unknown>) => void;
  };

  constructor(uri: string, driver: ConfigStore["driver"]) {
    this.uri = uri;
    this.driver = driver;

    this.driver.ensureSource(this.uri);
  }

  newSession(): SyncConfigSession {
    const obj = {
      storedObj: {},
      stagingObj: {},
      refreshConfig: () => {
        const data = this.driver.getConfigFromSource(this.uri);
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

    const sourceObj = this.driver.getConfigFromSource(this.uri);

    const newObj = jsonDiff.apply(sourceObj, diff);

    this.driver.saveConfig(this.uri, newObj);

    return this;
  }
}

export class AsyncConfigStore {
  uri = "";

  mutex: Mutex = new Mutex();

  driver: {
    ensureSource: (uri: string) => Promise<void>;
    getConfigFromSource: (uri: string) => Promise<Record<string, unknown>>;
    saveConfig: (uri: string, newObj: Record<string, unknown>) => Promise<void>;
  };

  constructor(uri: string, driver: AsyncConfigStore["driver"]) {
    this.uri = uri;
    this.driver = driver;

    this.mutex.runExclusive(() => this.driver.ensureSource(this.uri));
  }

  async newSession(): Promise<AsyncConfigSession> {
    const obj = {
      storedObj: {},
      stagingObj: {},
      refreshConfig: () => {
        return this.mutex.runExclusive(async () => {
          const data = await this.driver.getConfigFromSource(this.uri);
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

      const sourceObj = await this.driver.getConfigFromSource(this.uri);

      const newObj = jsonDiff.apply(sourceObj, diff);

      await this.driver.saveConfig(this.uri, newObj);

      return this;
    });
  }
}

export default AsyncConfigStore;
