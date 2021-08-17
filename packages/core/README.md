# `@dynaconfig/core`

[![npm](https://img.shields.io/npm/v/@dynaconfig/core.svg)](https://www.npmjs.com/package/@dynaconfig/core)
[![license](https://img.shields.io/npm/l/@dynaconfig/core.svg)](./LICENSE)

The core module that is used by other packages.

## Usage

### Asynchronous version

```javascript
const { AsyncConfigStore } = require("@dynaconfig/core");

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
store.newSession().then(async (session) => {
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
```

### Synchronous version

```javascript
const { ConfigStore } = require("@dynaconfig/core");

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
```

## License

[GPL v3](./LICENSE)
