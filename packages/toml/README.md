# `@dynaconfig/toml`

[![npm](https://img.shields.io/npm/v/@dynaconfig/toml.svg)](https://www.npmjs.com/package/@dynaconfig/toml)
[![license](https://img.shields.io/npm/l/@dynaconfig/toml.svg)](./LICENSE)

A configuration generation library using `*.toml` files.

## Usage

`'./config.toml'`, before script:

```toml
PASSWORD = "password"
HASHED = "false"
```

`'./index.js'`, run script:

```javascript
// ...
const { async: AsyncTomlStore } = require("@dynaconfig/toml");

// Creates a new instance. 'tomlPath' is the file path
const store = new AsyncTomlStore(tomlPath);

// Every time a new session is created, the store
// loads the configurations from the file
store.newSession().then(async (session) => {
  // Gets the configuration object
  const config = session.getConfig();

  const password = config["PASSWORD"]; // "password"
  config["PASSWORD_HASH"] = md5hash(password);
  config["HASHED"] = "true";
  delete config["PASSWORD"];

  // Writes the new configuration object to the file
  await store.persistSession(session);

  // Reloads the configurations from the file
  await session.refreshConfig();

  // ...

  return;
});
```

`'./config.toml'`, after script:

```toml
HASHED = "true"
PASSWORD_HASH = "5f4dcc3b5aa765d61d8327deb882cf99"

```

For more examples, check out [@dynaconfig/core](../core/README.md).

## License

[MIT](./LICENSE)
