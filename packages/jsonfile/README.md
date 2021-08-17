# `@dynaconfig/jsonfile`

[![npm](https://img.shields.io/npm/v/@dynaconfig/jsonfile.svg)](https://www.npmjs.com/package/@dynaconfig/jsonfile)
[![license](https://img.shields.io/npm/l/@dynaconfig/jsonfile.svg)](./LICENSE)

A configuration generation library using `*.json` files.

## Usage

`'./config.json'`, before script:

```json
{
  "PASSWORD": "password",
  "HASHED": "false"
}
```

`'./index.js'`, run script:

```javascript
// ...
const { async: AsyncJsonStore } = require("@dynaconfig/jsonfile");

// Creates a new instance. 'jsonPath' is the file path
const store = new AsyncJsonStore(jsonPath);

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

`'./config.json'`, after script:

```json
{
  "HASHED": "true",
  "PASSWORD_HASH": "5f4dcc3b5aa765d61d8327deb882cf99"
}
```

For more examples, check out [@dynaconfig/core](../core/README.md).

## License

[MIT](./LICENSE)
