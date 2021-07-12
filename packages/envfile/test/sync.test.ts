import path from "path";
import fs from "fs";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import rimraf from "rimraf";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import copyfiles from "copyfiles";
import { sync as EnvFile } from "../src";

const defaultFixtureFolder = "fixtures";
const fixtureFolder = "fixtures/sync";

beforeAll(
  () =>
    new Promise((resolve, reject) => {
      fs.promises
        .mkdir(path.resolve(__dirname, fixtureFolder))
        .catch((err) => {
          if (err.code !== "EEXIST") throw err;
        })
        .then(() => {
          copyfiles(
            [
              path.resolve(__dirname, defaultFixtureFolder, "*"),
              path.resolve(__dirname, fixtureFolder),
            ],
            { up: 1 },
            (err: Error) => {
              if (err) reject(err);
              else resolve(null);
            }
          );
        });
    })
);

afterAll(
  () =>
    new Promise((resolve, reject) => {
      rimraf(path.resolve(__dirname, fixtureFolder), {}, (err: Error) => {
        if (err) reject(err);
        else resolve(null);
      });
    })
);

describe("Synchronous Dynaconfig (envfile)", () => {
  it("should load the relative '.env' by default", () => {
    const currentDir = process.cwd();
    process.chdir(path.resolve(__dirname, fixtureFolder));
    const config = new EnvFile();
    process.chdir(currentDir);

    const testResult = config.newSession().getConfig()[
      "DEFAULT_FILE_TEST_RESULT"
    ];
    expect(testResult).toEqual("success");
  });

  it("should load the given '.env' path", () => {
    const config = new EnvFile(
      path.resolve(__dirname, fixtureFolder, "config.env")
    );

    const testResult = config.newSession().getConfig()[
      "PROVIDED_FILE_TEST_RESULT"
    ];
    expect(testResult).toEqual("success");
  });

  it("should create a new file if the file does not exist", () => {
    const filePath = path.resolve(__dirname, fixtureFolder, "nonexistent.env");

    rimraf.sync(filePath);

    new EnvFile(filePath);

    expect(fs.existsSync(filePath)).toBe(true);
  });

  it("should create a key and persist config", () => {
    const filePath = path.resolve(__dirname, fixtureFolder, "create.env");

    const config = new EnvFile(filePath);

    const session = config.newSession();
    const obj = session.getConfig();
    expect(obj.TEST_RESULT).toBeUndefined();
    expect(obj.EXISTING_KEY).toBe("true");

    obj.TEST_RESULT = "true";
    config.persistSession(session);

    const obj2 = session.refreshConfig().getConfig();
    expect(obj2.TEST_RESULT).toBe("true");
    expect(obj2.EXISTING_KEY).toBe("true");
  });

  it("should update a key and persist config", () => {
    const filePath = path.resolve(__dirname, fixtureFolder, "update.env");

    const config = new EnvFile(filePath);

    const session = config.newSession();
    const obj = session.getConfig();
    expect(obj.TEST_RESULT).toBe("false");
    expect(obj.EXISTING_KEY).toBe("true");

    obj.TEST_RESULT = "true";
    config.persistSession(session);

    const obj2 = session.refreshConfig().getConfig();
    expect(obj2.TEST_RESULT).toBe("true");
    expect(obj2.EXISTING_KEY).toBe("true");
  });

  it("should delete a key and persist config", () => {
    const filePath = path.resolve(__dirname, fixtureFolder, "delete.env");

    const config = new EnvFile(filePath);

    const session = config.newSession();
    const obj = session.getConfig();
    expect(obj.TEST_RESULT).toBe("false");
    expect(obj.EXISTING_KEY).toBe("true");

    delete obj.TEST_RESULT;
    config.persistSession(session);

    const obj2 = session.refreshConfig().getConfig();
    expect(obj2.TEST_RESULT).toBeUndefined();
    expect(obj2.EXISTING_KEY).toBe("true");
  });
});
