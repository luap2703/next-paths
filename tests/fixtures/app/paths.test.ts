import { paths } from "./paths";
import { generatePaths } from "../../../src/generatePaths";
import path from "path";
import fs from "fs";

describe("Generated paths", () => {
  const testDir = path.join(__dirname, "test-cases");

  beforeAll(() => {
    // Create test directory if it doesn't exist
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(() => {
    // Clean up test directory
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it("should have correct basic path access", () => {
    expect(paths.path).toBe("");
    expect(paths.url).toBe("http://localhost:3000");
    expect(paths.URL().toString()).toBe("http://localhost:3000/");
  });

  it("should have correct blog paths", () => {
    expect(paths.blog.GET.path).toBe("/blog");
    expect(paths.blog.GET.url).toBe("http://localhost:3000/blog");
    expect(paths.blog.GET.URL().toString()).toBe("http://localhost:3000/blog");
  });

  it("should handle dynamic routes with optional catch-all", () => {
    const blogPost = paths.blog.slug("2024/my-post");
    expect(blogPost.path).toBe(path.join("/blog", "2024/my-post"));
    expect(blogPost.url).toBe(
      "http://localhost:3000" + path.join("/blog", "2024/my-post")
    );
    expect(blogPost.URL().toString()).toBe(
      "http://localhost:3000" + path.join("/blog", "2024/my-post")
    );
  });

  it("should handle optional catch-all without segments", () => {
    const blogIndex = paths.blog.slug("");
    expect(blogIndex.path).toBe("/blog");
    expect(blogIndex.url).toBe("http://localhost:3000/blog");
    expect(blogIndex.URL().toString()).toBe("http://localhost:3000/blog");
  });

  it("should handle route handlers", () => {
    expect(paths.blog.GET.path).toBe("/blog");
    expect(paths.blog.POST.path).toBe("/blog");
    expect(paths.blog.PUT.path).toBe("/blog");
  });

  it("should handle URL with query params", () => {
    const blogWithDraft = paths.blog.GET.URL();
    blogWithDraft.searchParams.set("draft", "1");
    expect(blogWithDraft.toString()).toBe("http://localhost:3000/blog?draft=1");
  });

  it("should have correct login path", () => {
    expect(paths.login.path).toBe("/login");
    expect(paths.login.url).toBe("http://localhost:3000/login");
    expect(paths.login.URL().toString()).toBe("http://localhost:3000/login");
  });

  // Case style tests
  describe("Case styles", () => {
    const caseStyles = [
      "camelCase",
      "lowerSnake",
      "upperSnake",
      "pascalCase",
    ] as const;
    const testRoutes = {
      "blog-post": "/blog-post",
      "user-profile": "/user-profile",
      "admin-dashboard": "/admin-dashboard",
      userSettings: "/userSettings",
    };

    for (const style of caseStyles) {
      describe(`${style} case style`, () => {
        let generatedPaths: any;
        const testFileName = `paths.${style}.ts`;

        beforeAll(() => {
          // Generate paths with current case style
          generatePaths({
            appDir: __dirname,
            caseStyle: style,
            outputDir: testDir,
            fileName: testFileName,
          });

          // Import the generated paths
          generatedPaths = require(path.join(testDir, testFileName));
        });

        it(`should generate correct ${style} case keys`, () => {
          switch (style) {
            case "camelCase":
              expect(generatedPaths.paths.blogPost).toBeDefined();
              expect(generatedPaths.paths.userProfile).toBeDefined();
              expect(generatedPaths.paths.adminDashboard).toBeDefined();
              expect(generatedPaths.paths.userSettings).toBeDefined();
              break;
            case "lowerSnake":
              expect(generatedPaths.paths.blog_post).toBeDefined();
              expect(generatedPaths.paths.user_profile).toBeDefined();
              expect(generatedPaths.paths.admin_dashboard).toBeDefined();
              expect(generatedPaths.paths.user_settings).toBeDefined();
              break;
            case "upperSnake":
              expect(generatedPaths.paths.BLOG_POST).toBeDefined();
              expect(generatedPaths.paths.USER_PROFILE).toBeDefined();
              expect(generatedPaths.paths.ADMIN_DASHBOARD).toBeDefined();
              expect(generatedPaths.paths.USER_SETTINGS).toBeDefined();
              break;
            case "pascalCase":
              expect(generatedPaths.paths.BlogPost).toBeDefined();
              expect(generatedPaths.paths.UserProfile).toBeDefined();
              expect(generatedPaths.paths.AdminDashboard).toBeDefined();
              expect(generatedPaths.paths.UserSettings).toBeDefined();
              break;
          }
        });

        it(`should maintain correct paths with ${style} case style`, () => {
          const testPath = Object.values(testRoutes)[0];
          const pathKey = Object.keys(testRoutes)[0];

          let pathObj;
          switch (style) {
            case "camelCase":
              pathObj =
                generatedPaths.paths[
                  pathKey.replace(/-([a-z])/g, (_, c) => c.toUpperCase())
                ];
              break;
            case "lowerSnake":
              pathObj = generatedPaths.paths[pathKey.replace(/-/g, "_")];
              break;
            case "upperSnake":
              pathObj =
                generatedPaths.paths[pathKey.replace(/-/g, "_").toUpperCase()];
              break;
            case "pascalCase":
              pathObj =
                generatedPaths.paths[
                  pathKey
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join("")
                ];
              break;
          }

          expect(pathObj).toBeDefined();
          expect(pathObj.path).toBe(testPath);
          expect(pathObj.url).toBe(`http://localhost:3000${testPath}`);
        });

        it(`should handle camelCase folder names correctly with ${style} case style`, () => {
          const pathObj =
            generatedPaths.paths[
              style === "camelCase"
                ? "userSettings"
                : style === "lowerSnake"
                ? "user_settings"
                : style === "upperSnake"
                ? "USER_SETTINGS"
                : "UserSettings"
            ];

          expect(pathObj).toBeDefined();
          expect(pathObj.path).toBe("/userSettings");
          expect(pathObj.url).toBe("http://localhost:3000/userSettings");
        });

        it(`should generate file with correct name: ${testFileName}`, () => {
          expect(fs.existsSync(path.join(testDir, testFileName))).toBe(true);
        });
      });
    }
  });

  // Type safety tests
  it("should have correct type safety", () => {
    const invalidPath = paths.blog.slug();
    // @ts-expect-error - Invalid method
    const invalidMethod = paths.blog.INVALID;
    // @ts-expect-error - Invalid URL options
    const invalidUrl = paths.blog.GET.URL({ invalid: true });
  });
});
