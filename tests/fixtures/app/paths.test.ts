import { paths } from "./paths";

describe("Generated paths", () => {
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
    expect(blogPost.path).toBe("/blog/2024/my-post");
    expect(blogPost.url).toBe("http://localhost:3000/blog/2024/my-post");
    expect(blogPost.URL().toString()).toBe(
      "http://localhost:3000/blog/2024/my-post"
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

  // Type safety tests
  it("should have correct type safety", () => {
    const invalidPath = paths.blog.slug();
    // @ts-expect-error - Invalid method
    const invalidMethod = paths.blog.INVALID;
    // @ts-expect-error - Invalid URL options
    const invalidUrl = paths.blog.GET.URL({ invalid: true });
  });
});
