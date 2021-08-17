# `@dynaconfig/yaml`

[![npm](https://img.shields.io/npm/v/@dynaconfig/yaml.svg)](https://www.npmjs.com/package/@dynaconfig/yaml)
[![license](https://img.shields.io/npm/l/@dynaconfig/yaml.svg)](./LICENSE)

A configuration generation library using `*.yaml` files.

## Usage

`'./config.yaml'`, before script:

```yaml
PASSWORD: "password"
HASHED: "false"
```

`'./index.js'`, run script:

```javascript
// ...
const { async: AsyncYamlStore } = require("@dynaconfig/yaml");

// Creates a new instance. 'yamlPath' is the file path
const store = new AsyncYamlStore(yamlPath);

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

`'./config.yaml'`, after script:

```yaml
HASHED: "true"
PASSWORD_HASH: 5f4dcc3b5aa765d61d8327deb882cf99
```

For more examples, check out [@dynaconfig/core](../core/README.md).

## License

[GPL v3](./LICENSE)
