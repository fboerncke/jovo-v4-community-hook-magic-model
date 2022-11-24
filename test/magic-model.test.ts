/*
|--------------------------------------------------------------------------
| UNIT TESTING
|--------------------------------------------------------------------------
|
| Run `npm test` to execute this sample test.
| Learn more here: www.jovo.tech/docs/unit-testing
|
*/

import { MagicModelHook } from "../src/MagicModelHook";
import type {
  ExtendedBuildPlatformContext,
  FlatMap,
} from "../src/MagicModelTypes";
import { when } from "jest-when";
import fs from "fs";

const simplifiedExampleModelDe = {
  invocation: {
    alexa: "${MyTestString}",
    googleAssistant: "${MyTestString}",
  },
  version: "4.0",
  intents: {
    HelpIntent: {
      alexa: {
        name: "AMAZON.HelpIntent",
      },
      phrases: ["Hilfe", "Was [jetzt|nun]"],
    },
  },
};

const simplifiedExampleModelEn = {
  invocation: {
    alexa: "${MyTestString}",
    googleAssistant: "${MyTestString}-${MyTestString}",
  },
  version: "${version}.${1+1}",
  intents: {
    HelpIntent: {
      alexa: {
        name: "AMAZON.HelpIntent",
      },
      phrases: ["Help", "What [now|can I do]"],
    },
  },
};

const simplifiedGlobalConfigFile = {
  comment:
    "use this file to set global settings that can be used in all voice models",
  version: "4.1",
  MyTestString: "some test string",
  MyTestArray: ["ALPHA", "BETA", "GAMMA"],
  MyTestSpintaxArray: "Help [ | me] [ | please]",
  PaymentTypeArray: [
    "cash",
    "master",
    "amex",
    "cheque",
    "paypal",
    "bitcoin",
    {
      value: "Visa",
      id: "visa",
      synonyms: ["Visa", "Visa Card", "My Visa Card"],
    },
  ],
};

/**
 * Create some mock context only used for testing
 *
 * @param flatMap
 * @returns
 */
function mockedContext(flatMap: FlatMap) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const someDummyPlaceholder: any = {};
  const extendedBuildPlatformContext: ExtendedBuildPlatformContext = {
    args: someDummyPlaceholder,
    flags: someDummyPlaceholder,
    platforms: [],
    locales: [],
    command: "",
    magicModelConfig: {},
  };

  Object.keys(flatMap).forEach((key: string) => {
    if (key === "locales" || key === "platforms") {
      extendedBuildPlatformContext[key] = flatMap[key] as string[];
    } else if (key === "command") {
      extendedBuildPlatformContext[key] = flatMap[key] as string;
    } else if (key === "magicModelConfig") {
      extendedBuildPlatformContext.magicModelConfig[key] = flatMap[key];
    } else {
      throw "not supported option";
    }
  });

  return extendedBuildPlatformContext;
}

let readFileSyncSpy: jest.SpyInstance;
let writeFileSyncSpy: jest.SpyInstance;
let consoleWarnSpy: jest.SpyInstance;
let consoleLogSpy: jest.SpyInstance;

beforeEach(() => {
  // suppress output on console log
  consoleLogSpy = jest
    .spyOn(console, "log")
    .mockImplementation(() => undefined);

  // suppress output on console warn
  consoleWarnSpy = jest
    .spyOn(console, "warn")
    .mockImplementation(() => undefined);

  // readFileSyncSpy
  readFileSyncSpy = jest.spyOn(fs, "readFileSync");
  // assume 'de' config exists
  when(readFileSyncSpy)
    .calledWith(expect.stringContaining("magicModel/config.json"), "utf8")
    .mockReturnValue(
      //JSON.stringify({ version: "4.1", MyTestString: "some test string" })
      JSON.stringify(simplifiedGlobalConfigFile)
    );

  // assume 'de' config exists
  when(readFileSyncSpy)
    .calledWith(expect.stringContaining("magicModel/config-de"), "utf8")
    .mockReturnValue(JSON.stringify({ MyTestString: ["Käsekuchen"] }));

  // assume 'en' config does not exist
  when(readFileSyncSpy)
    .calledWith(expect.stringContaining("magicModel/config-en"), "utf8")
    .mockImplementation(() => {
      throw new Error();
    });

  // use prepared locale specific templates defined above
  when(readFileSyncSpy)
    .calledWith(expect.stringContaining("magicModel/de-template.json"), "utf8")
    .mockReturnValue(JSON.stringify(simplifiedExampleModelDe));

  when(readFileSyncSpy)
    .calledWith(expect.stringContaining("magicModel/en-template.json"), "utf8")
    .mockReturnValue(JSON.stringify(simplifiedExampleModelEn));

  when(readFileSyncSpy)
    .calledWith(expect.stringContaining("magicModel/es-template.json"), "utf8")
    .mockImplementation(() => {
      throw new Error();
    });

  // writeFileSyncSpy
  writeFileSyncSpy = jest.spyOn(fs, "writeFileSync");
  jest.spyOn(fs, "writeFileSync").mockImplementation(() => undefined);
});

afterEach(() => {
  jest.clearAllMocks();
});

test("basic test two locales", async () => {
  MagicModelHook(mockedContext({ locales: ["de", "en"] }));

  expect(writeFileSyncSpy).toHaveBeenCalledTimes(2); // once for each locale
  expect(writeFileSyncSpy).toHaveBeenCalledWith(
    "models/en.json",
    expect.stringMatching(/What now/)
  );
  expect(writeFileSyncSpy).toHaveBeenCalledWith(
    "models/de.json",
    expect.stringMatching(/Was nun/)
  );
  expect(consoleWarnSpy).not.toHaveBeenCalledWith(
    "💡 You may want to add a file config-de.json to your magicModel folder"
  );
  expect(consoleWarnSpy).toHaveBeenCalledWith(
    "💡 You may want to add a file config-en.json to your magicModel folder"
  );
});

test("basic test locale de", async () => {
  MagicModelHook(mockedContext({ locales: ["de"] }));

  expect(writeFileSyncSpy).toHaveBeenCalledTimes(1); // once for each locale
  expect(writeFileSyncSpy).toHaveBeenCalledWith(
    "models/de.json",
    expect.stringMatching(/Was nun/)
  );
  expect(consoleWarnSpy).not.toHaveBeenCalledWith(
    "💡 You may want to add a file config-de.json to your magicModel folder"
  );
  expect(consoleWarnSpy).not.toHaveBeenCalledWith(
    "💡 You may want to add a file config-en.json to your magicModel folder"
  );
});

test("basic test locale en", async () => {
  MagicModelHook(mockedContext({ locales: ["en"] }));

  expect(writeFileSyncSpy).toHaveBeenCalledTimes(1); // once for each locale
  expect(writeFileSyncSpy).toHaveBeenCalledWith(
    "models/en.json",
    expect.stringMatching(/What now/)
  );
  expect(consoleWarnSpy).not.toHaveBeenCalledWith(
    "💡 You may want to add a file config-de.json to your magicModel folder"
  );
  expect(consoleWarnSpy).toHaveBeenCalledWith(
    "💡 You may want to add a file config-en.json to your magicModel folder"
  );
});

test("basic test missing file locale es", async () => {
  MagicModelHook(mockedContext({ locales: ["es"] }));

  expect(writeFileSyncSpy).toHaveBeenCalledTimes(0); // once for each locale
  expect(consoleWarnSpy).toHaveBeenCalledWith(
    "💡 You may want to add a file config-es.json to your magicModel folder"
  );
  expect(consoleWarnSpy).toHaveBeenCalledWith(
    "💡 You may want to add a file es-template.json to your magicModel folder"
  );
});

test("basic test spintax de", async () => {
  MagicModelHook(mockedContext({ locales: ["de"] }));

  expect(writeFileSyncSpy).toHaveBeenCalledWith(
    "models/de.json",
    expect.stringMatching(/Was jetzt/)
  );
  expect(writeFileSyncSpy).toHaveBeenCalledWith(
    "models/de.json",
    expect.stringMatching(/Was nun/)
  );
});

test("basic test spintax en", async () => {
  MagicModelHook(mockedContext({ locales: ["en"] }));

  expect(writeFileSyncSpy).toHaveBeenCalledWith(
    "models/en.json",
    expect.stringMatching(/What now/)
  );
  expect(writeFileSyncSpy).toHaveBeenCalledWith(
    "models/en.json",
    expect.stringMatching(/What can I do/)
  );
});

test("basic test jexl", async () => {
  MagicModelHook(mockedContext({ locales: ["en"] }));

  expect(writeFileSyncSpy).toHaveBeenCalledWith(
    "models/en.json",
    expect.stringMatching(/"version": "4.1.2"/)
  );
});

test("basic test config variable replacement", async () => {
  MagicModelHook(mockedContext({ locales: ["en"] }));

  expect(writeFileSyncSpy).toHaveBeenCalledWith(
    "models/en.json",
    expect.stringMatching(/"alexa": "some test string"/)
  );
  expect(writeFileSyncSpy).toHaveBeenCalledWith(
    "models/en.json",
    expect.stringMatching(
      /"googleAssistant": "some test string-some test string"/
    )
  );
});
