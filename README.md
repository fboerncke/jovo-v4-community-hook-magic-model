<a href= "https://prototypefund.de/project/voice-ql-datentabellen-mit-gesprochener-sprache-barrierefrei-erkunden/"><img src="./images/assets/voice-ql-ring.png" width="40%" height="40%" align="right"></a>

# Magic Model for Jovo V4

## Overview

This hook for the [Jovo V4 Framework](https://github.com/jovotech/jovo-framework) makes voice model maintenance much easier. Expect features like _spintax_ within phrases, support of both _variables_ and an _expression language_ within phrases for easier customization and (to some degree) auto clean up of the generated files. Sounds interesting? Then go ahead reading.

## Voice model maintenance is hard

Maintaining voice model files is hard especially when they grow and get bigger. Even if you have a working voice model and want to change a little bit or add only one expression then this may cause unexpected side effects in your voice app.

When you duplicate and modify an intent definition then accidentally this can lead to one phrase being used for different intents.

The hook that comes with this NPM module will help you to use a much more compact notation when defining voice model files. Once configured there is no need to change your workflow when developing with Jovo.

## Install

The hook can be installed as a package via **[npmjs](https://www.npmjs.com/)**. For more information see here:

[![NPM](https://nodei.co/npm/jovo-v4-community-hook-magic-model.png)](https://nodei.co/npm/jovo-v4-community-hook-magic-model/)

From the console you may install the hook right into your Jovo project and save the dependency in your **package.json**:

`npm install jovo-v4-community-hook-magic-model --save`

Register the hook in:

`jovo.project.js`:

```javascript
const { MagicModelHook } = require("jovo-v4-community-hook-magic-model");

const project = new ProjectConfig({
  hooks: {
    'before.build:platform': [MagicModelHook],
  }, // [...]

```

`jovo.project.ts`:

```typescript
import { MagicModelHook } from "jovo-v4-community-hook-magic-model";

const project = new ProjectConfig({
  hooks: {
    'before.build:platform': [MagicModelHook],
  }, // [...]
```

## Setup and configure

After configuring the hook as described above you can proceed to work as usual.

If you want to start using **Magic Model** then perform the following steps:

- Go into your existing project
- Just to make sure: Make a backup of the files contained in the `model` folder
- Create a folder called `magicModel` next to (= on the same level) your existing Jovo `model` folder
- Copy your existing voice model files (`en.json`, `de.json`, ...) into the `magicModel` folder and rename them to `en-template.json`, `de-template.json`, ... respectively.

You are now ready to use **Magic Model** by starting a Jovo build. e.g. as follows:

    $ jovo build:platform alexa

The following will happen:

1. **Magic Model** reads each file within the `magicModel` folder
2. **Magic Model** will then process each voice model file, look for **Magic Model** specific markup and process it
3. **Magic Model** writes the result into your `model` folder _overwriting_ the already existing files
4. The Jovo build process proceeds as usual

## How to use

**Magic Model** comes with a number of features with **Spintax support** being the most important one:

### Spintax

#### Example

You likely have a **HelpIntent** in your voice model which may look similar as follows:

    HelpIntent: {
        phrases: ["Help"],
    }

We will now see how you can use **Spintax** notation to create a lot of phrases in only one line:

1.  Now replace the `phrases` line from above with the following definition:

        HelpIntent: {
            phrases: ["[ | [| would you ] please] [help|support|assist] [ | me [ | with this [| [|crazy|strange] [situation|problem] ] ]]"],
        }

    Spintax expressions look a bit like regular expressions especially if you choose to use nested expressions. But they are much easier to use and in a moment you will see how powerful they are.

2.  Run the build process:

         $ jovo build:platform alexa

    **Magic Model** will now process the Spintax expressions in your file.

3.  Open your Jovo voice model folder, open the voice model file, navigate to the help intent and see what just happened:

        HelpIntent: {
            phrases: [
              "assist",
              "assist me",
              "assist me with this",
              "assist me with this crazy problem",
              "assist me with this crazy situation",
              "assist me with this problem",
              "assist me with this situation",
              "assist me with this strange problem",
              "assist me with this strange situation",
              "help",
              "help me",
              "help me with this",
              "help me with this crazy problem",
              "help me with this crazy situation",
              "help me with this problem",
              "help me with this situation",
              "help me with this strange problem",
              "help me with this strange situation",
              "please assist",
              "please assist me",
              "please assist me with this",
              "please assist me with this crazy problem",
              "please assist me with this crazy situation",
              "please assist me with this problem",
              "please assist me with this situation",
              "please assist me with this strange problem",
              "please assist me with this strange situation",
              "please help",
              "please help me",
              "please help me with this",
              "please help me with this crazy problem",
              "please help me with this crazy situation",
              "please help me with this problem",
              "please help me with this situation",
              "please help me with this strange problem",
              "please help me with this strange situation",
              "please support",
              "please support me",
              "please support me with this",
              "please support me with this crazy problem",
              "please support me with this crazy situation",
              "please support me with this problem",
              "please support me with this situation",
              "please support me with this strange problem",
              "please support me with this strange situation",
              "support",
              "support me",
              "support me with this",
              "support me with this crazy problem",
              "support me with this crazy situation",
              "support me with this problem",
              "support me with this situation",
              "support me with this strange problem",
              "support me with this strange situation",
              "would you please assist",
              "would you please assist me",
              "would you please assist me with this",
              "would you please assist me with this crazy problem",
              "would you please assist me with this crazy situation",
              "would you please assist me with this problem",
              "would you please assist me with this situation",
              "would you please assist me with this strange problem",
              "would you please assist me with this strange situation",
              "would you please help",
              "would you please help me",
              "would you please help me with this",
              "would you please help me with this crazy problem",
              "would you please help me with this crazy situation",
              "would you please help me with this problem",
              "would you please help me with this situation",
              "would you please help me with this strange problem",
              "would you please help me with this strange situation",
              "would you please support",
              "would you please support me",
              "would you please support me with this",
              "would you please support me with this crazy problem",
              "would you please support me with this crazy situation",
              "would you please support me with this problem",
              "would you please support me with this situation",
              "would you please support me with this strange problem",
              "would you please support me with this strange situation"
          ],
        }

This example might give you an idea about how powerful Spintax expressions in **Magic Model** can be. For a moment think about you had to work out all these permutations of words manually ...

#### Spintax expression syntax

The syntax of Spintax expressions is straightforward. If you are somehow familiar with regular expressions then you will not have any problems using them:

- Alternative options

  You distinguish multiple alternations using the symbol ‘|’ and delimit the list using square brackets like “[“ and “]”. An example expression might look like this:

      " [ nice | beautiful] "

  This means either “_nice_“ or “_beautiful_“.

- Marking text as optional

  One of two options may be an empty string which is a way to mark variants as optional:

      " [ | please] "

  This means either nothing (= empty string) or “_please_“.

- Nested expressions

  Expressions may be nested to build up powerful expressions as shown in the introductory example:

      " help [ | me [  | please] ] "

  This means either “_help_“ or “_help me_“ or “_help me please_“.

### House keeping

**Question**: If you simply copy your `en.json` file to `en-template.json` without any changes and run the build process will the result of the **Magic Model** process look exactly as the input file?

**Answer**: Not exactly. "_Why_", you ask? **Magic Model** will always do some _house keeping_ to support voice model maintenance:

- Entries in phrases will be sorted alphabetically
- Duplicate entries in phrases will be removed
- Empty elements in arrays are removed
- Strings will be trimmed to remove whitespace before and after an entry
- Superfluous white space between strings will implode to one blank
- The resulting file will be reformatted

This feature alone makes it worth to give **Magic Model** a try.

### Expression language support in voice model files with Jexl

**Magic Model** comes with expression language support using the [Jexl framework](https://github.com/TomFrost/Jexl). This means you can use dynamic Jexl expressions within your voice model template file and write something like "${1+1}" which would result in "2" within your Jovo voice model file.

Based on this example **expression support** may make no sense to you right now but it becomes a powerful feature when being used together with our next feature: **Configuration files** and **variables**.

### Configuration files and variables

**Magic Model** supports both global and locale specific configuration files in Json format. Your `magicModel` folder may contain configuration files like this:

- config.json
- config-en.json
- config-de.json
  ...

The contents of a configuration file may look as follows:

        {
          "comment": "use this file to define some settings",
          "MyTestString": "purple",
          "MyTestArray": ["Alpha", "Beta", "Gamma"],
          "MyTestSpintaxArray": "Help [ | me] [ | please]"],
          "MyTestComplexArray": [
            "cash",
            "master",
            "amex",
            "cheque",
            "paypal",
            "crypto",
            {
              "value": "crypto",
              "id": "crypto",
              "synonyms": ["bitcoin", "dodge", "ethereum", "tether", "ftx"]
            }
          ]
        }

You can then use these predefined variables in your voice model using Jexl expressions. But **watch out**: Jexl expressions may return a **string** or an **array of strings** or even a **Json object**. To not break you voice model use these expressions carefully.

**String support**:

    "ColorIntent": {
      "phrases": ["red", "${MyTestString}", "green", "blue"]
    },

This will become:

    "ColorIntent": {
      "phrases": ["red", "purple", "green", "blue"]
    },

**Array support**:

    "GreekIntent": {
          "phrases": "${MyTestArray}"
        }

This will become:

    "GreekIntent": {
          "phrases": ["Alpha", "Beta", "Gamma"]
        }

**Spintax support**:

Spintax can be used in configuration files. This will also result in an array as return type:

    "HelpIntent": {
      "phrases": ["${MyTestSpintaxArray}"]
    },

This will become:

    "HelpIntent": {
      "phrases": [
        "Help",
        "Help me",
        "Help me please",
        "Help please"
      ]
    },

## Features work throughout the model

All the features described above not only work for `phrases` but also for `values` and `synonyms`.

## Summarizing some use cases for Magic Model

Bringing all these features together then Magic Model can support you with a number of use cases:

- **House keeping**: Keep your voice model clean

- **Branding**: reuse an existing white label voice application multiple times by simply (re-)configuring some settings in the configuration file.

- **Reuse definitions**: from application to application it is now much easier to reuse Spintax definitions if you keep them in external variables. Phrase collections for `HelpIntent` or `StopIntent` are obvious examples.

- **Voice model maintenance**: Long arrays with phrases are difficult to maintain when they grow over time. Spintax makes this an easy task.

## F.A.Q.

- "_Do you use Magic Model in your own work?_"

  Yes. So far it saved me a lot of time and I thought this could be useful for others too. But the code was an instable collection of scripts. This is why I decided to clean up the code, bring it all together within one hook and write this documentation.

- "_I like this. How can I help?_"

  Spread the word.

- "_Sorry, this doesn't work for me but I have an idea to make this a better tool._"

  I am happy about feedback and suggestions, send a note to me at frank.boerncke@gmail.com.

- "_Why the hook approach? Shouldn't Jovo support all these features out of the box?_"

  If you think so then send a note to [Jan König](https://www.linkedin.com/in/koenigj/?originalSubdomain=de) 🙂

- "_Unfortunately I am new to Jovo and I need a similar solution only for the Alexa environment without the Jovo context_."

  You want to have a closer look at the page [voicemodel.applicate.de](https://voicemodel.applicate.de/) which may solve your problem.

  There is also an [article on LinkedIn](https://www.linkedin.com/pulse/adding-expression-language-alexa-voice-models-frank-b%C3%B6rncke/) about this Alexa specific service.

- "_To complete the branding usecase it would be nice if I could use those configuration settings also in my speech utterances. Is there a way to make this possible?_"

  **Magic Model** intentionally has a specific focus on the model aspect only and I don't plan to change that. But you might like to hear that I am working on another extension (working title **Magic Prototyper**) which comes close to what you describe.

  Stay tuned!

## License

Apache V2

## Acknowledgements

The code published here is part of the project "[Voice QL](https://prototypefund.de/project/voice-ql-datentabellen-mit-gesprochener-sprache-barrierefrei-erkunden/)" which receives funding from the [German Federal Ministry of Education and Research](https://www.bmbf.de/) (FKZ 01IS22S30)

[![Logo Bundesministerium für Bildung und Forschung](./images/assets/logo-bmbf.svg)](https://www.bmbf.de/)
&nbsp; &nbsp;
[![Logo Open Knowledge Foundation](./images/assets/logo-okfn.svg)](https://okfn.de)
&nbsp; &nbsp;
[![Logo Prototype Fund](./images/assets/PrototypeFund_Logo_smallest.svg)](https://prototypefund.de/)

The Prototype Fund is a project of the Open Knowledge Foundation Germany, funded by the German Federal Ministry of Education and Research (BMBF).
