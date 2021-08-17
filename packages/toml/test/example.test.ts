/* eslint-disable @typescript-eslint/no-var-requires */
/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */
// @ts-nocheck

import path from "path";
import fs from "fs";
import crypto from "crypto";
import rimraf from "rimraf";

const fixtureFolder = "fixtures/example";
const filePath = {
  async: path.join(fixtureFolder, "example.async.toml"),
};

const initialFileContent = '\
PASSWORD = "password"\n\
HASHED = "false"\
';

const expectedFileContent =
  '\
HASHED = "true"\n\
PASSWORD_HASH = "5f4dcc3b5aa765d61d8327deb882cf99"\n\
';

beforeAll(async () => {
  try {
    await fs.promises.mkdir(path.resolve(__dirname, fixtureFolder));
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
  await Promise.all([
    fs.promises.writeFile(
      path.resolve(__dirname, filePath.async),
      initialFileContent
    ),
  ]);
});

afterAll(
  () =>
    new Promise((resolve, reject) => {
      rimraf(path.resolve(__dirname, fixtureFolder), {}, (err: Error) => {
        if (err) reject(err);
        else resolve(null);
      });
    })
);

test("Should run the example usage correctly (async)", async () => {
  const tomlPath = path.resolve(__dirname, filePath.async);
  const md5hash = (str) => crypto.createHash("md5").update(str).digest("hex");

  // ------------------------ EXAMPLE START ------------------------
  // ...
  const { async: AsyncTomlStore } = require("../src");

  // Creates a new instance. 'tomlPath' is the file path
  const store = new AsyncTomlStore(tomlPath);

  // Every time a new session is created, the store
  // loads the configurations from the file
  await store.newSession().then(async (session) => {
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

  // ------------------------ EXAMPLE END ------------------------

  const config = (await store.newSession()).getConfig();

  expect(config).toEqual({
    HASHED: "true",
    PASSWORD_HASH: "5f4dcc3b5aa765d61d8327deb882cf99",
  });

  const fileContent = await fs.promises.readFile(tomlPath);

  expect(fileContent.toString()).toEqual(expectedFileContent);
});
