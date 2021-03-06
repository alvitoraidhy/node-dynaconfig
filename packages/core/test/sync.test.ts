import { ConfigStore } from "../src";

const createDummyDriver = (initObj?: undefined | Record<string, unknown>) => {
  const obj = {
    storedObj: initObj as undefined | Record<string, unknown>,
    ensureSource: () => {
      if (!obj.storedObj) obj.storedObj = {};
      return;
    },
    getConfigFromSource: () => {
      return obj.storedObj as Record<string, unknown>;
    },
    saveConfig: (uri: string, newObj: Record<string, unknown>) => {
      obj.storedObj = newObj;
      return;
    },
  };

  return obj;
};

test("Should load the configuration from the dummy driver", () => {
  const driver = createDummyDriver({
    DEFAULT_FILE_TEST_RESULT: "success",
  });

  const config = new ConfigStore("", driver);

  const testResult = config.newSession().getConfig()[
    "DEFAULT_FILE_TEST_RESULT"
  ];
  expect(testResult).toEqual("success");
});

test("Should create a key and persist config", () => {
  const driver = createDummyDriver({
    EXISTING_KEY: "true",
  });

  const config = new ConfigStore("", driver);

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

test("Should update a key and persist config", () => {
  const driver = createDummyDriver({
    TEST_RESULT: "false",
    EXISTING_KEY: "true",
  });

  const config = new ConfigStore("", driver);

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

test("Should delete a key and persist config", () => {
  const driver = createDummyDriver({
    TEST_RESULT: "false",
    EXISTING_KEY: "true",
  });

  const config = new ConfigStore("", driver);

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
