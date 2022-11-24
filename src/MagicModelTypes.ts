import type { BuildPlatformContext } from "@jovotech/cli-command-build";
export type FlatMap = { [key: string]: string | string[] | number };
export type ExtendedBuildPlatformContext = BuildPlatformContext & {
  magicModelConfig: FlatMap;
};
export type MagicModelTemplate = any;
