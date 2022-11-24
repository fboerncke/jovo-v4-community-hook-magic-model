// eslint-disable-next-line @typescript-eslint/no-var-requires
const Spinner = require("node-spintax");

import type { BuildPlatformContext } from "@jovotech/cli-command-build";
import type {
  ExtendedBuildPlatformContext,
  MagicModelTemplate,
} from "./MagicModelTypes";
import JEXL from "jexl";
import fs from "fs";

export function MagicModelHook(
  jovoBuildPlatformContext: BuildPlatformContext
): void {
  console.log("🪄 Launching Magic Model");

  const extendedBuildPlatformContext: ExtendedBuildPlatformContext =
    createExtendedBuildPlatformContext(jovoBuildPlatformContext);

  extendedBuildPlatformContext.locales.forEach((locale: string) => {
    try {
      updateContextWithUserConfig(extendedBuildPlatformContext, locale);

      const magicModelTemplateAsString = fs.readFileSync(
        "magicModel/" + locale + "-template.json",
        "utf8"
      );

      const magicModelTemplate: MagicModelTemplate = JSON.parse(
        magicModelTemplateAsString
      );

      // do the magic
      const processedModel: MagicModelTemplate = processMagicModel(
        magicModelTemplate,
        extendedBuildPlatformContext
      );

      // clean up generated model and convert result to string
      const sanitizedModelString = JSON.stringify(
        processedModel,
        (key, value) => {
          // process and filter entries
          if (key === "phrases" || key === "values" || key === "synonyms")
            return value
              .filter(valueIsNotEmpty) // keep only non empty values
              .filter(valueIsUnique) // remove duplicates
              .sort();
          // order ASC
          else return value;
        },
        2
      );

      // write resulting model in JSON format to file
      fs.writeFileSync("models/" + locale + ".json", sanitizedModelString);
    } catch (error) {
      console.warn(
        "💡 You may want to add a file " +
          locale +
          "-template.json to your magicModel folder"
      );
    }
  });
}

/**
 * Create ExtendedBuildPlatformContext from Jovo BuildPlatformContext
 *
 * @param jovoBuildContext
 * @returns
 */
function createExtendedBuildPlatformContext(
  jovoBuildPlatformContext: BuildPlatformContext
): ExtendedBuildPlatformContext {
  const extendedBuildPlatformContext: ExtendedBuildPlatformContext = JSON.parse(
    JSON.stringify(jovoBuildPlatformContext)
  );
  extendedBuildPlatformContext.magicModelConfig = {};

  return extendedBuildPlatformContext;
}

/**
 * Read global and locale specific configuration files.
 *
 * Locale definitions win over global definitions.
 *
 * @param extendedBuildPlatformContext
 * @param locale
 */
function updateContextWithUserConfig(
  extendedBuildPlatformContext: ExtendedBuildPlatformContext,
  locale: string
) {
  try {
    const configAsString = fs.readFileSync("magicModel/config.json", "utf8");
    const config = JSON.parse(configAsString);

    // update context with config
    for (const key in config) {
      extendedBuildPlatformContext.magicModelConfig[key] = config[key];
    }
  } catch (error) {
    console.warn(
      "💡 You may want to add a file config.json to your magicModel folder"
    );
  }

  try {
    const localizedConfigAsString = fs.readFileSync(
      "magicModel/config-" + locale + ".json",
      "utf8"
    );
    const localizedConfig = JSON.parse(localizedConfigAsString);
    // update context with config
    for (const key in localizedConfig) {
      extendedBuildPlatformContext.magicModelConfig[key] = localizedConfig[key];
    }
  } catch (error) {
    console.warn(
      "💡 You may want to add a file config-" +
        locale +
        ".json to your magicModel folder"
    );
  }
}
/////////////////////////////

function processMagicModel(
  model: MagicModelTemplate,
  extendedBuildPlatformContext: ExtendedBuildPlatformContext
): MagicModelTemplate {
  // two pass replacement of expressions
  traverseAndProcessJsonTree(model, doJexl, extendedBuildPlatformContext);
  traverseAndProcessJsonTree(model, doJexl, extendedBuildPlatformContext);

  // explode spintax. Watch out: this may create loads(!) of entries
  traverseAndProcessJsonTree(
    model,
    explodeSpintax,
    extendedBuildPlatformContext
  );

  //traverseAndProcessJsonTree(model, checkSyntax, extendedBuildPlatformContext);

  return model;
}

/**
 * Traverse model tree using a recursive strategy and apply the
 * selected nodeProcessor function
 *
 * @param modelNode
 * @param nodeProcessor
 * @param extendedBuildPlatformContext
 */
function traverseAndProcessJsonTree(
  modelNode: any,
  nodeProcessor: any,
  extendedBuildPlatformContext: ExtendedBuildPlatformContext
) {
  for (const key in modelNode) {
    if (typeof modelNode[key] === "object" && modelNode[key] !== null) {
      modelNode[key] = nodeProcessor(
        key,
        modelNode[key],
        extendedBuildPlatformContext
      );
      traverseAndProcessJsonTree(
        modelNode[key],
        nodeProcessor,
        extendedBuildPlatformContext
      );
      //    } else if (modelNode.hasOwnProperty(key)) {
    } else if (Object.prototype.hasOwnProperty.call(modelNode, key)) {
      // process value and update object
      modelNode[key] = nodeProcessor(
        key,
        modelNode[key],
        extendedBuildPlatformContext
      );
    }
  }
}

const explodeSpintax = (
  key: string,
  value: any,
  extendedBuildPlatformContext: ExtendedBuildPlatformContext
): any => {
  if (key === "phrases") {
    return createAllPermutationsFromSpinnerArray(value);
  }
  return value;
};

const doJexl = (
  key: string,
  value: string,
  extendedBuildPlatformContext: ExtendedBuildPlatformContext
): string | string[] | number => {
  if (typeof value === "string") {
    for (const contextKey in extendedBuildPlatformContext.magicModelConfig) {
      if (value === "${" + contextKey + "}") {
        // watch out: some expression like '${varName}' can return pure
        // javascript data structures
        return extendedBuildPlatformContext.magicModelConfig[contextKey];
      }
    }

    const regEx = new RegExp(/\${(.+?)}/g);
    let newText = value;
    let matches = regEx.exec(value);
    while (matches !== null) {
      // matches[0] = ${4+4}
      // matches[1] = 4+4
      const result = JEXL.evalSync(
        matches[1],
        extendedBuildPlatformContext.magicModelConfig
      );
      // console.log("JEXL result: " + result);
      newText = newText.replace(matches[0], result);
      matches = regEx.exec(value);
    }
    return newText;
  }
  return value;
};

const checkSyntax = (
  key: string,
  value: string,
  extendedBuildPlatformContext: ExtendedBuildPlatformContext
): string => {
  if (typeof value === "string") {
    // console.log('Checking syntax for ' + value);
    if (!value.match(/^[{}äöüÄÖÜßa-zA-Z0-4_. ]*$/)) {
      throw new Error("Invalid syntax error in node " + key + ": " + value);
    }
  }
  return value;
};

/**
 * Iterate string array and process each Spintax expression (if any)
 *
 * @param spinnerDefinitionArray
 * @returns
 */
function createAllPermutationsFromSpinnerArray(
  spinnerDefinitionArray: string[]
) {
  let resultArray: string[] = [];
  for (const spinnerDefinition in spinnerDefinitionArray) {
    resultArray = resultArray.concat(
      createAllPermutations(spinnerDefinitionArray[spinnerDefinition])
    );
  }
  return resultArray;
}

/**
 * Create all possible permutations of Spintax expression
 *
 * @param spinnerDefinition
 * @returns array of results
 */
function createAllPermutations(spinnerDefinition: string) {
  if (spinnerDefinition === undefined) {
    return [];
  }
  const spinner = new Spinner(spinnerDefinition, {
    syntax: {
      startSymbol: "[",
      endSymbol: "]",
      delimiter: "|",
    },
  });
  const resultArray = spinner.unspin();
  return resultArray.map((element: string) =>
    element.trim().replace(/ {1,}/g, " ")
  );
}

function valueIsUnique(value: any, index: any, self: any) {
  return self.indexOf(value) === index;
}

function valueIsNotEmpty(value: any, index: any, self: any) {
  return (
    value !== undefined && value !== null && value.toString().trim().length > 0
  );
}
