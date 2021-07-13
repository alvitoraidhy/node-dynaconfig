# `@dynaconfig/core`

[![npm](https://img.shields.io/npm/v/@dynaconfig/core.svg)](https://www.npmjs.com/package/@dynaconfig/core)

The core module that is used by other packages.

## Usage

```javascript
...
const AsyncConfigStore = require('@dynaconfig/core');

const store = new AsyncConfigStore(sourceURI, driver);
store.newSession().then(async (session) => {
  const config = session.getConfig();

  const password = config["PASSWORD"];
  config["PASSWORD_HASH"] = hash(password);
  delete config["PASSWORD"];
  ...
  await store.persistSession(session);
  return;
});
```
