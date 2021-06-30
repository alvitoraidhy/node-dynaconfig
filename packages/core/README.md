# `@dynaconfig/core`

The core module that is used by other packages. Useless on its own.

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
