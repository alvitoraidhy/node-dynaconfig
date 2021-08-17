/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
// @ts-nocheck

test("Should run the example usage correctly (async)", async () => {
  // ------------------------ EXAMPLE START ------------------------
  const { AsyncConfigStore } = require("../src");

  const driver = {
    // ensureSource, getConfigFromSource, and saveConfig are required
    storedObj: {},
    ensureSource: async (uri) => {
      if (!driver.storedObj[uri]) driver.storedObj[uri] = {};
      return;
    },
    getConfigFromSource: async (uri) => {
      return driver.storedObj[uri];
    },
    saveConfig: async (uri, newObj) => {
      driver.storedObj[uri] = newObj;
      return;
    },
  };

  const sourceURI = "db";

  const store = new AsyncConfigStore(sourceURI, driver);

  // Every time a new session is created, the store
  // calls driver.getConfigFromSource() and store the
  // return value in the session
  await store.newSession().then(async (session) => {
    // Gets the stored configuration object
    const config = session.getConfig(); // {}

    // 'config' is a regular object
    config.username = "user";

    // Calls driver.saveConfig() internally
    await store.persistSession(session);

    // Reloads the configurations from the source
    await session.refreshConfig();

    // ...

    return;
  });

  // ------------------------ EXAMPLE END ------------------------

  expect(driver.storedObj[sourceURI]).toEqual({ username: "user" });
});

test("Should run the example usage correctly (sync)", () => {
  // ------------------------ EXAMPLE START ------------------------
  const { ConfigStore } = require("../src");

  const driver = {
    // ensureSource, getConfigFromSource, and saveConfig are required
    storedObj: {},
    ensureSource: (uri) => {
      if (!driver.storedObj[uri]) driver.storedObj[uri] = {};
      return;
    },
    getConfigFromSource: (uri) => {
      return driver.storedObj[uri];
    },
    saveConfig: (uri, newObj) => {
      driver.storedObj[uri] = newObj;
      return;
    },
  };

  const sourceURI = "db";

  const store = new ConfigStore(sourceURI, driver);

  // Every time a new session is created, the store
  // calls driver.getConfigFromSource() and store the
  // return value in the session
  const session = store.newSession();

  // Gets the stored configuration object
  const config = session.getConfig(); // {}

  // 'config' is a regular object
  config.username = "user";

  // Calls driver.saveConfig() internally
  store.persistSession(session);

  // Reloads the configurations from the source
  session.refreshConfig();

  // ------------------------ EXAMPLE END ------------------------

  expect(driver.storedObj[sourceURI]).toEqual({ username: "user" });
});
