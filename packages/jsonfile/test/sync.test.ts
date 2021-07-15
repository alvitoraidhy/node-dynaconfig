import path from "path";
import fs from "fs";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import rimraf from "rimraf";

import copy from "recursive-copy";
import { sync as JsonFile } from "../src";

const defaultFixtureFolder = "fixtures/default";
const fixtureFolder = "fixtures/sync";

beforeAll(async () => {
  try {
    await fs.promises.mkdir(path.resolve(__dirname, fixtureFolder));
  } catch (err) {
    if (err.code !== "EEXIST") throw err;
  }
  await copy(
    path.resolve(__dirname, defaultFixtureFolder),
    path.resolve(__dirname, fixtureFolder)
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

describe("Synchronous Dynaconfig (jsonfile)", () => {
  it("should load the relative 'config.json' by default", () => {
    const currentDir = process.cwd();
    process.chdir(path.resolve(__dirname, fixtureFolder));
    const config = new JsonFile();
    process.chdir(currentDir);

    const testResult = config.newSession().getConfig()[
      "DEFAULT_FILE_TEST_RESULT"
    ];
    expect(testResult).toEqual("success");
  });

  it("should load the given '.json' path", () => {
    const config = new JsonFile(
      path.resolve(__dirname, fixtureFolder, "config.test.json")
    );

    const testResult = config.newSession().getConfig()[
      "PROVIDED_FILE_TEST_RESULT"
    ];
    expect(testResult).toEqual("success");
  });

  it("should create a new file if the file does not exist", () => {
    const filePath = path.resolve(__dirname, fixtureFolder, "nonexistent.json");

    rimraf.sync(filePath);

    new JsonFile(filePath);

    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("should create a key and persist config", () => {
    const filePath = path.resolve(__dirname, fixtureFolder, "create.json");

    const config = new JsonFile(filePath);

    const session = config.newSession();
    const obj = session.getConfig();
    expect(obj.TEST_RESULT).toBeUndefined();
    expect(obj.EXISTING_KEY).toBe(true);

    obj.TEST_RESULT = true;
    config.persistSession(session);

    const obj2 = session.refreshConfig().getConfig();
    expect(obj2.TEST_RESULT).toBe(true);
    expect(obj2.EXISTING_KEY).toBe(true);
  });

  it("should update a key and persist config", () => {
    const filePath = path.resolve(__dirname, fixtureFolder, "update.json");

    const config = new JsonFile(filePath);

    const session = config.newSession();
    const obj = session.getConfig();
    expect(obj.TEST_RESULT).toBe(false);
    expect(obj.EXISTING_KEY).toBe(true);

    obj.TEST_RESULT = true;
    config.persistSession(session);

    const obj2 = session.refreshConfig().getConfig();
    expect(obj2.TEST_RESULT).toBe(true);
    expect(obj2.EXISTING_KEY).toBe(true);
  });

  it("should delete a key and persist config", () => {
    const filePath = path.resolve(__dirname, fixtureFolder, "delete.json");

    const config = new JsonFile(filePath);

    const session = config.newSession();
    const obj = session.getConfig();
    expect(obj.TEST_RESULT).toBe(false);
    expect(obj.EXISTING_KEY).toBe(true);

    delete obj.TEST_RESULT;
    config.persistSession(session);

    const obj2 = session.refreshConfig().getConfig();
    expect(obj2.TEST_RESULT).toBeUndefined();
    expect(obj2.EXISTING_KEY).toBe(true);
  });
});
