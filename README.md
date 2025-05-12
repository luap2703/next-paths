# 🛣️ nextjs-paths

> Type-safe path utilities for Next.js App Router

[![npm version](https://badge.fury.io/js/nextjs-paths.svg)](https://badge.fury.io/js/nextjs-paths)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

Generate strongly typed path utilities from your Next.js App Router. This package automatically generates a `paths.ts` file that provides type-safe access to ALL your application's routes.

## ✨ Features

- 🔍 **Automatic Scanning** - Scans your Next.js App Router structure
- 📝 **Type Safety** - Full TypeScript support with generated types
- 🛣️ **Route Support** - Handles dynamic routes and route groups
- 🚀 **HTTP Methods** - Includes GET, POST, PUT, DELETE handlers
- 🎯 **URL Utilities** - Path, URL, and URL constructor utilities
- 🔒 **Type Safety** - Type-safe route parameters and query strings
- 🎨 **Naming** - Supports both camelCase and snake_case
- 📦 **Zero Dependencies** - No runtime dependencies
- ⚡️ **Performance** - Fast and efficient path generation
- 🎭 **Declarative** - Write routes in a natural, declarative way

## 📦 Installation

### Using npm

```bash
# Or install globally
npm install -g nextjs-paths
```

### Using yarn

```bash
# Or install globally
yarn global add nextjs-paths
```

### Using pnpm

```bash
# Or install globally
pnpm add -g nextjs-paths
```

## 🚀 Usage

### 1. Install the package

```bash
npm install nextjs-paths
```

### 2. Generate paths

Add a script to your `package.json`:

```json
{
  "scripts": {
    "generate:paths": "nextjs-paths generate"
  }
}
```

Then run:

```bash
npm run generate:paths
```

Or run directly:

```bash
npx nextjs-paths generate
```

### 3. Use in your code

#### Declarative Navigation

```typescript
import { paths } from "./paths";

// Simple navigation
export default function Navigation() {
  return (
    <nav>
      <Link href={paths.blog.GET.path}>Blog</Link>
      <Link href={paths.about.GET.path}>About</Link>
    </nav>
  );
}

// Dynamic routes
export function BlogPost({ slug }: { slug: string }) {
  return <Link href={paths.blog.slug(slug).path}>Read Post</Link>;
}

// API calls
async function fetchBlogPost(slug: string) {
  const response = await fetch(paths.blog.slug(slug).url);
  return response.json();
}

// Form submissions
async function handleSubmit(data: FormData) {
  await fetch(paths.blog.POST.url, {
    method: "POST",
    body: data,
  });
}
```

#### Type-Safe Route Parameters

```typescript
// TypeScript will ensure you provide all required parameters
const post = paths.blog.slug("2024/my-post");
const comment = paths.blog.slug("2024/my-post").comment("123");

// TypeScript error if you forget a parameter
const invalidPost = paths.blog.slug(); // Error: Missing required parameter
```

#### URL Construction

```typescript
// Build URLs with query parameters
const blogWithFilters = paths.blog.GET.URL();
blogWithFilters.searchParams.set("category", "tech");
blogWithFilters.searchParams.set("sort", "newest");

// Use in API calls
const response = await fetch(blogWithFilters.toString());
```

### CLI Options

| Option                  | Description                          | Default                    |
| ----------------------- | ------------------------------------ | -------------------------- |
| `-d, --appDir <dir>`    | App router root directory            | `src/app`                  |
| `-e, --env <var>`       | Environment variable for base URL    | `NEXT_PUBLIC_APP_BASE_URL` |
| `--snake`               | Use snake_case for path keys         | `false`                    |
| `-o, --outputDir <dir>` | Output directory for generated files | Same as appDir             |

### 📝 Example

Given a Next.js app structure:

```
app/
  ├── page.tsx
  ├── about/
  │   └── page.tsx
  ├── blog/
  │   ├── page.tsx
  │   ├── [[...slug]]/
  │   │   └── page.tsx
  │   └── route.ts
  └── api/
      └── hello/
          └── route.ts
```

The generated `paths.ts` provides type-safe access:

```typescript
import { paths } from "./paths";

// Basic paths
paths.path; // "/"
paths.url; // "http://localhost:3000"
paths.URL(); // TS/JS URL class object

// Blog routes
paths.blog.GET.path; // "/blog"
paths.blog.GET.url; // "http://localhost:3000/blog"
paths.blog.GET.URL().toString(); // "http://localhost:3000/blog"

// Dynamic routes
const blogPost = paths.blog.slug("2024/my-post");
blogPost.path; // "/blog/2024/my-post"
blogPost.url; // "http://localhost:3000/blog/2024/my-post"

// Route handlers
paths.blog.GET.path; // "/blog"
paths.blog.POST.path; // "/blog"
paths.blog.PUT.path; // "/blog"

// URL with query params
const blogWithDraft = paths.blog.GET.URL();
blogWithDraft.searchParams.set("draft", "1");
blogWithDraft.toString(); // "http://localhost:3000/blog?draft=1"
```

## ⚙️ Configuration

### Base URL

```bash
# Use custom environment variable
npx nextjs-paths generate --env NEXT_PUBLIC_SITE_URL
```

### Output Directory

```bash
# Generate files in custom directory
npx nextjs-paths generate --outputDir ./generated
```

### Case Style

```bash
# Use snake_case instead of camelCase
npx nextjs-paths generate --snake
```

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test

# Generate test paths
npm run generate:test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT
