import path from "path";
import fs from "fs";
import { promisify } from "util";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import rimraf from "rimraf";

import copy from "recursive-copy";
import { async as AsyncEnvFile } from "../src";

const defaultFixtureFolder = "fixtures/default";
const fixtureFolder = "fixtures/async";

beforeAll(async () => {
  try {
    await fs.promises.mkdir(path.resolve(__dirname, fixtureFolder));
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
  await copy(
    path.resolve(__dirname, defaultFixtureFolder),
    path.resolve(__dirname, fixtureFolder),
    { dot: true }
  );
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

describe("Asynchronous Dynaconfig (envfile)", () => {
  test("Should load the relative '.env' by default", async () => {
    const currentDir = process.cwd();
    process.chdir(path.resolve(__dirname, fixtureFolder));
    const config = new AsyncEnvFile();
    process.chdir(currentDir);

    const testResult = (await config.newSession()).getConfig()[
      "DEFAULT_FILE_TEST_RESULT"
    ];
    expect(testResult).toEqual("success");
  });

  test("Should load the given '.env' path", async () => {
    const config = new AsyncEnvFile(
      path.resolve(__dirname, fixtureFolder, "config.env")
    );

    const testResult = (await config.newSession()).getConfig()[
      "PROVIDED_FILE_TEST_RESULT"
    ];
    expect(testResult).toEqual("success");
  });

  test("Should create a new file if the file does not exist", async () => {
    const filePath = path.resolve(__dirname, fixtureFolder, "nonexistent.env");
    await promisify(rimraf)(filePath);

    const config = new AsyncEnvFile(filePath);
    await config.newSession();

    expect((await fs.promises.stat(filePath)).isFile()).toBe(true);
  });

  test("Should create a key and persist config", async () => {
    const filePath = path.resolve(__dirname, fixtureFolder, "create.env");

    const config = new AsyncEnvFile(filePath);

    const session = await config.newSession();
    const obj = session.getConfig();
    expect(obj.TEST_RESULT).toBeUndefined();
    expect(obj.EXISTING_KEY).toBe("true");

    obj.TEST_RESULT = "true";
    await config.persistSession(session);

    const obj2 = (await session.refreshConfig()).getConfig();
    expect(obj2.TEST_RESULT).toBe("true");
    expect(obj2.EXISTING_KEY).toBe("true");
  });

  test("Should update a key and persist config", async () => {
    const filePath = path.resolve(__dirname, fixtureFolder, "update.env");

    const config = new AsyncEnvFile(filePath);

    const session = await config.newSession();
    const obj = session.getConfig();
    expect(obj.TEST_RESULT).toBe("false");
    expect(obj.EXISTING_KEY).toBe("true");

    obj.TEST_RESULT = "true";
    await config.persistSession(session);

    const obj2 = (await session.refreshConfig()).getConfig();
    expect(obj2.TEST_RESULT).toBe("true");
    expect(obj2.EXISTING_KEY).toBe("true");
  });

  test("Should delete a key and persist config", async () => {
    const filePath = path.resolve(__dirname, fixtureFolder, "delete.env");

    const config = new AsyncEnvFile(filePath);

    const session = await config.newSession();
    const obj = session.getConfig();
    expect(obj.TEST_RESULT).toBe("false");
    expect(obj.EXISTING_KEY).toBe("true");

    delete obj.TEST_RESULT;
    await config.persistSession(session);

    const obj2 = (await session.refreshConfig()).getConfig();
    expect(obj2.TEST_RESULT).toBeUndefined();
    expect(obj2.EXISTING_KEY).toBe("true");
  });
});
