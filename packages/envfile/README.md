# `@dynaconfig/envfile`

[![npm](https://img.shields.io/npm/v/@dynaconfig/envfile.svg)](https://www.npmjs.com/package/@dynaconfig/envfile)
[![license](https://img.shields.io/npm/l/@dynaconfig/envfile.svg)](./LICENSE)

A configuration generation library using `*.env` files. Using keys and values other than string type is not recommended as they might not get serialized and/or parsed correctly. Comments are currently not preserved when persisting a configuration object.

## Usage

`'./.env'`, before script:

```
PASSWORD=password
HASHED=false

```

`'./index.js'`, run script:

```javascript
// ...
const { async: AsyncEnvStore } = require("@dynaconfig/envfile");

// Creates a new instance. "envPath" is the file path
const store = new AsyncEnvStore(envPath);

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

`'./.env'`, after script:

```
HASHED=true
PASSWORD_HASH=5f4dcc3b5aa765d61d8327deb882cf99

```

For more examples, check out [@dynaconfig/core](../core/README.md).

## License

[MIT](./LICENSE)
