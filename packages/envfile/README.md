# `@dynaconfig/envfile`

A dynamic configuration library using \*.env files. Using keys and values other than string type is not recommended and might not get serialized and/or parsed correctly.
Comments are currently not preserved.

## Usage

Before script:

```bash
PASSWORD=password
HASHED=false
```

Run script:

```javascript
...
const { sync as EnvStore } = require('@dynaconfig/envfile');

const store = new EnvStore(envPath);
store.newSession().then(async (session) => {
  const config = session.getConfig();

  const password = config["PASSWORD"];
  config["PASSWORD_HASH"] = md5hash(password);
  config["HASHED"] = "true";
  delete config["PASSWORD"];
  ...
  await store.persistSession(session);
  return;
});
```

After script:

```bash
HASHED=true
PASSWORD_HASH=5f4dcc3b5aa765d61d8327deb882cf99
```
