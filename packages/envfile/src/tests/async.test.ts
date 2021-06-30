import path from "path";
import fs from "fs";
import { promisify } from "util";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import rimraf from "rimraf";
import { async as AsyncEnvFile } from "..";

const fixtureFolder = "fixtures";

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
  const filePath = path.resolve(
    __dirname,
    fixtureFolder,
    "nonexistent.async.env"
  );
  await promisify(rimraf)(filePath);

  const config = new AsyncEnvFile(filePath);
  await config.newSession();

  expect((await fs.promises.stat(filePath)).isFile()).toBe(true);

  await promisify(rimraf)(filePath);
});

test("Should create a key and persist config", async () => {
  const filePath = path.resolve(__dirname, fixtureFolder, "create.async.env");
  await promisify(rimraf)(filePath);

  await fs.promises.writeFile(filePath, "EXISTING_KEY=true\n");

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

  await promisify(rimraf)(filePath);
});

test("Should update a key and persist config", async () => {
  const filePath = path.resolve(__dirname, fixtureFolder, "update.async.env");
  await promisify(rimraf)(filePath);

  await fs.promises.writeFile(
    filePath,
    "TEST_RESULT=false\nEXISTING_KEY=true\n"
  );

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

  await promisify(rimraf)(filePath);
});

test("Should delete a key and persist config", async () => {
  const filePath = path.resolve(__dirname, fixtureFolder, "delete.async.env");
  await promisify(rimraf)(filePath);

  await fs.promises.writeFile(
    filePath,
    "TEST_RESULT=false\nEXISTING_KEY=true\n"
  );

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

  await promisify(rimraf)(filePath);
});
