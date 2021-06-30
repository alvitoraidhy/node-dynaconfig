import path from "path";
import fs from "fs";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import rimraf from "rimraf";
import { sync as EnvFile } from "..";

const fixtureFolder = "fixtures";

test("Should load the relative '.env' by default", () => {
  const currentDir = process.cwd();
  process.chdir(path.resolve(__dirname, fixtureFolder));
  const config = new EnvFile();
  process.chdir(currentDir);

  const testResult = config.newSession().getConfig()[
    "DEFAULT_FILE_TEST_RESULT"
  ];
  expect(testResult).toEqual("success");
});

test("Should load the given '.env' path", () => {
  const config = new EnvFile(
    path.resolve(__dirname, fixtureFolder, "config.env")
  );

  const testResult = config.newSession().getConfig()[
    "PROVIDED_FILE_TEST_RESULT"
  ];
  expect(testResult).toEqual("success");
});

test("Should create a new file if the file does not exist", () => {
  const filePath = path.resolve(
    __dirname,
    fixtureFolder,
    "nonexistent.sync.env"
  );

  rimraf.sync(filePath);

  new EnvFile(filePath);

  expect(fs.existsSync(filePath)).toBe(true);

  rimraf.sync(filePath);
});

test("Should create a key and persist config", () => {
  const filePath = path.resolve(__dirname, fixtureFolder, "create.sync.env");
  rimraf.sync(filePath);

  fs.writeFileSync(filePath, "EXISTING_KEY=true\n");

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

  rimraf.sync(filePath);
});

test("Should update a key and persist config", () => {
  const filePath = path.resolve(__dirname, fixtureFolder, "update.sync.env");
  rimraf.sync(filePath);

  fs.writeFileSync(filePath, "TEST_RESULT=false\nEXISTING_KEY=true\n");

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

  rimraf.sync(filePath);
});

test("Should delete a key and persist config", () => {
  const filePath = path.resolve(__dirname, fixtureFolder, "delete.sync.env");
  rimraf.sync(filePath);

  fs.writeFileSync(filePath, "TEST_RESULT=false\nEXISTING_KEY=true\n");

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

  rimraf.sync(filePath);
});
