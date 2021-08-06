# `@dynaconfig/core`

[![npm](https://img.shields.io/npm/v/@dynaconfig/core.svg)](https://www.npmjs.com/package/@dynaconfig/core)

The core module that is used by other packages.

## Usage

```javascript
const { async: AsyncConfigStore } = require('@dynaconfig/core');

const driverFactory = () => {
  const driver = {
    // ensureSource, getConfigFromSource, and saveConfig are required
    storedObj: {},
    ensureSource: async () => {
      if (!driver.storedObj) driver.storedObj = {};
      return;
    },
    getConfigFromSource: async () => {
      return driver.storedObj;
    },
    saveConfig: async (uri, newObj) => {
      driver.storedObj = newObj;
      return;
    },
  };

  return driver;
};

const store = new AsyncConfigStore(sourceURI, driverFactory());

// Every time a new session is created, the store
// calls driver.getConfigFromSource() and store the
// return value in the session
store.newSession().then(async (session) => {

  // Gets the stored configuration object
  const config = session.getConfig(); // {}

  // ...

  // Calls driver.saveConfig() internally
  await store.persistSession(session);

  // Reloads the configurations from the source
  await session.refreshConfig()

  // ...

  return;
});
```

## License

[GPL v3](./LICENSE)
