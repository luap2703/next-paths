import { generatePaths } from "../src/generatePaths";
import { readFileSync, unlinkSync } from "fs";
import path from "path";

describe("generatePaths", () => {
  const fixturesDir = path.join(__dirname, "fixtures");
  const appDir = path.join(fixturesDir, "app");
  const outputDir = appDir;
  const outputFile = path.join(outputDir, "paths.ts");
  beforeEach(() => {
    // Clean up any existing paths.ts file
    try {
      unlinkSync(outputFile);
    } catch (e) {
      // Ignore if file doesn't exist
    }
  });

  it("should generate paths.ts file with correct structure", () => {
    generatePaths({
      appDir,
      envKey: "NEXT_PUBLIC_TEST_URL",
      caseStyle: "camelCase",
      outputDir,
    });

    const content = readFileSync(outputFile, "utf-8");

    // Check for basic structure
    expect(content).toContain("export const paths = {");
    expect(content).toContain("path: p");
    expect(content).toContain("url: url(p)");
    expect(content).toContain(`URL: () => new URL(url(p))`);

    // Check for specific routes
    expect(content).toContain("login: {");
    expect(content).toContain("blog: {");
    expect(content).toContain("slug: (slug?: string) => ({");
  });

  it("should handle snake_case option", () => {
    generatePaths({
      appDir,
      envKey: "NEXT_PUBLIC_TEST_URL",
      caseStyle: "lowerSnake",
      outputDir,
    });

    const content = readFileSync(outputFile, "utf-8");

    expect(content).toContain("user_settings: {");
    expect(content).toContain("blog_component_id: (");
  });

  it("should handle optional catch-all routes", () => {
    generatePaths({
      appDir,
      envKey: "NEXT_PUBLIC_TEST_URL",
      caseStyle: "camelCase",
      outputDir,
    });

    const content = readFileSync(outputFile, "utf-8");
    expect(content).toContain("slug: (slug?: string) => ({");
  });

  it("should handle route groups", () => {
    generatePaths({
      appDir,
      envKey: "NEXT_PUBLIC_TEST_URL",
      caseStyle: "camelCase",
      outputDir,
    });

    const content = readFileSync(outputFile, "utf-8");
    // Route groups should be invisible in the URL
    expect(content).toContain("blog: {");
    expect(content).not.toContain("(marketing)");
  });

  it("should handle parallel routes", () => {
    generatePaths({
      appDir,
      envKey: "NEXT_PUBLIC_TEST_URL",
      caseStyle: "camelCase",
      outputDir,
    });

    const content = readFileSync(outputFile, "utf-8");
    // Parallel routes should be invisible in the URL
    expect(content).not.toContain("@analytics");
  });

  it("should handle multiple HTTP methods", () => {
    generatePaths({
      appDir,
      envKey: "NEXT_PUBLIC_TEST_URL",
      caseStyle: "camelCase",
      outputDir,
    });

    const content = readFileSync(outputFile, "utf-8");
    expect(content).toContain("GET: make(");
    expect(content).toContain("POST: make(");
    expect(content).toContain("PUT: make(");
  });

  it("should handle nested route groups", () => {
    generatePaths({
      appDir,
      envKey: "NEXT_PUBLIC_TEST_URL",
      caseStyle: "camelCase",
      outputDir,
    });

    const content = readFileSync(outputFile, "utf-8");
    // Nested route groups should be invisible in the URL
    expect(content).not.toContain("(featured)");
  });
});
