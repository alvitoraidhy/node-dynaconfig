import { AsyncConfigStore } from "..";

const createDummyDriver = (initObj?: undefined | Record<string, unknown>) => {
  const obj = {
    storedObj: initObj as undefined | Record<string, unknown>,
    ensureConfigFile: async () => {
      if (!obj.storedObj) obj.storedObj = {};
      return;
    },
    getConfigFromFile: async () => {
      return obj.storedObj as Record<string, unknown>;
    },
    saveConfig: async (filePath: string, newObj: Record<string, unknown>) => {
      obj.storedObj = newObj;
      return;
    },
  };

  return obj;
};

test("Should load the configuration from the dummy driver", async () => {
  const driver = createDummyDriver({
    DEFAULT_FILE_TEST_RESULT: "success",
  });

  const config = new AsyncConfigStore("", driver);

  const testResult = (await config.newSession()).getConfig()[
    "DEFAULT_FILE_TEST_RESULT"
  ];
  expect(testResult).toEqual("success");
});

test("Should create a key and persist config", async () => {
  const driver = createDummyDriver({
    EXISTING_KEY: "true",
  });

  const config = new AsyncConfigStore("", driver);

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
  const driver = createDummyDriver({
    TEST_RESULT: "false",
    EXISTING_KEY: "true",
  });

  const config = new AsyncConfigStore("", driver);

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
  const driver = createDummyDriver({
    TEST_RESULT: "false",
    EXISTING_KEY: "true",
  });

  const config = new AsyncConfigStore("", driver);

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
