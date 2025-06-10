#!/usr/bin/env node

import { Command } from "commander";
import { generatePaths } from "./generatePaths.js";
import path from "path";
import { existsSync } from "fs";

const program = new Command();

program
  .name("nextjs-paths")
  .description(
    "Generate strongly typed path utilities from your Next.js App Router\n\n" +
      "Global options:\n" +
      "  -v, --version    Show version number\n" +
      "  -h, --help       Show help information\n\n" +
      "Commands:\n" +
      "  generate         Generate paths.ts file with options\n\n" +
      "Generate Command Options:\n" +
      "  -d, --appDir <dir>     Specify the app router root directory (default: src/app)\n" +
      "  -e, --env <var>        Set environment variable key for base URL (default: NEXT_PUBLIC_APP_BASE_URL)\n" +
      "  -c, --caseStyle <style>  Set the case style for path keys\n" +
      "                         Options: camelCase (default), lowerSnake, upperSnake, pascalCase\n" +
      "  -o, --outputDir <dir>  Specify output directory for generated file\n" +
      "                         Default: same as appDir\n" +
      "  -f, --fileName <name>  Specify output file name (must end with .ts)\n" +
      "                         Default: paths.ts\n\n" +
      "Examples:\n" +
      "  nextjs-paths generate                    # Generate with default options\n" +
      "  nextjs-paths generate --appDir ./app     # Generate from custom app directory\n" +
      "  nextjs-paths generate --caseStyle lowerSnake  # Generate with snake_case keys\n" +
      "  nextjs-paths generate --outputDir ./lib  # Generate to custom output directory\n" +
      "  nextjs-paths generate --fileName routes.ts  # Generate with custom file name"
  )
  .version("1.0.1", "-v, --version")
  .helpOption("-h, --help", "Display help for command");

program
  .command("generate")
  .description(
    "Generate paths.ts file with options\n\n" +
      "Available Options:\n" +
      "  -d, --appDir <dir>     Specify the app router root directory\n" +
      "                         Default: src/app\n\n" +
      "  -e, --env <var>        Set environment variable key for base URL\n" +
      "                         Default: NEXT_PUBLIC_APP_BASE_URL\n\n" +
      "  -c, --caseStyle <style>  Set the case style for path keys\n" +
      "                         Options: camelCase (default), lowerSnake, upperSnake, pascalCase\n\n" +
      "  -o, --outputDir <dir>  Specify output directory for generated file\n" +
      "                         Default: same as appDir\n\n" +
      "  -f, --fileName <name>  Specify output file name (must end with .ts)\n" +
      "                         Default: paths.ts\n\n" +
      "Examples:\n" +
      "  nextjs-paths generate                    # Generate with default options\n" +
      "  nextjs-paths generate --appDir ./app     # Generate from custom app directory\n" +
      "  nextjs-paths generate --caseStyle lowerSnake  # Generate with snake_case keys\n" +
      "  nextjs-paths generate --outputDir ./lib  # Generate to custom output directory\n" +
      "  nextjs-paths generate --fileName routes.ts  # Generate with custom file name"
  )
  .option("-d, --appDir <dir>", "App router root directory (default: src/app)")
  .option(
    "-e, --env <var>",
    "Environment variable key for base URL (default: NEXT_PUBLIC_APP_BASE_URL)"
  )
  .option(
    "-c, --caseStyle <style>",
    "Case style for path keys (camelCase, lowerSnake, upperSnake, pascalCase)",
    "camelCase"
  )
  .option("-o, --outputDir <dir>", "Output directory for generated file")
  .option(
    "-f, --fileName <name>",
    "Output file name (must end with .ts)",
    "paths.ts"
  )
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
    console.log(
      "Will generate paths.ts in:",
      path.join(process.cwd(), options.outputDir ?? appDir, options.fileName)
    );

    if (!existsSync(appDir)) {
      console.error(`Error: App directory does not exist: ${appDir}`);
      process.exit(1);
    }

    if (!options.fileName.endsWith(".ts")) {
      console.error(`Error: File name must end with .ts: ${options.fileName}`);
      process.exit(1);
    }

    try {
      generatePaths({
        appDir,
        envKey: options.env || "NEXT_PUBLIC_APP_BASE_URL",
        caseStyle: options.caseStyle,
        outputDir: options.outputDir,
        fileName: options.fileName,
      });
      console.log("Path generation completed successfully!");
    } catch (error) {
      console.error("Error during path generation:", error);
      process.exit(1);
    }
  });

program.parse(process.argv);
