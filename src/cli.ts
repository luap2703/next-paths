#!/usr/bin/env node

import { Command } from "commander";
import { generatePaths } from "./generatePaths";
import path from "path";
import { existsSync } from "fs";

const program = new Command();

program
  .name("next-paths")
  .description(
    "Generate strongly typed path utilities from your Next.js App Router"
  )
  .version("1.0.0");

program
  .command("generate")
  .description("Generate paths.ts file")
  .option("-d, --appDir <dir>", "App router root directory (default: src/app)")
  .option(
    "-e, --env <var>",
    "Environment variable key for base URL (default: NEXT_PUBLIC_APP_BASE_URL)"
  )
  .option("--snake", "Use snake_case for path keys (default: camelCase)")
  .option("--outputDir <file>", "Output file for generated paths.ts")
  .action((options) => {
    console.log("Starting path generation...");
    console.log("Current working directory:", process.cwd());
    console.log("Options:", options);

    const appDir = options.appDir
      ? path.isAbsolute(options.appDir)
        ? options.appDir
        : path.join(process.cwd(), options.appDir)
      : path.join(process.cwd(), "src", "app");

    console.log("Target app directory:", appDir);

    if (!existsSync(appDir)) {
      console.error(`Error: App directory does not exist: ${appDir}`);
      process.exit(1);
    }

    try {
      generatePaths({
        appDir,
        envKey: options.env || "NEXT_PUBLIC_APP_BASE_URL",
        style: options.snake ? "snake" : "camel",
        outputDir: options.outputDir,
      });
      console.log("Path generation completed successfully!");
    } catch (error) {
      console.error("Error during path generation:", error);
      process.exit(1);
    }
  });

program.parse();
