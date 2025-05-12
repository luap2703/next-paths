# next-paths

Generate strongly typed path utilities from your Next.js App Router. This package automatically generates a `paths.ts` file that provides type-safe access to your application's routes.

## Features

- 🔍 Automatically scans your Next.js App Router structure
- 📝 Generates TypeScript types for all your routes
- 🛣️ Supports dynamic routes and route groups
- 🚀 Includes HTTP method handlers (GET, POST, etc.)
- 🎯 Provides path, URL, and URL constructor utilities

## Installation

```bash
npm install next-paths
# or
yarn add next-paths
# or
pnpm add next-paths
```

## Usage

### CLI

```bash
npx next-paths generate
```

Options:

- `-d, --appDir <dir>` - App router root directory (default: src/app)
- `-e, --env <var>` - Environment variable key for base URL (default: NEXT_PUBLIC_APP_BASE_URL)
- `--snake` - Use snake_case for path keys (default: camelCase)

### Example

Given a Next.js app structure like this:

```
app/
  ├── page.tsx
  ├── about/
  │   └── page.tsx
  ├── blog/
  │   ├── page.tsx
  │   ├── [slug]/
  │   │   └── page.tsx
  │   └── route.ts
  └── api/
      └── hello/
          └── route.ts
```

Running `next-paths generate` will create a `paths.ts` file that you can use like this:

```typescript
import { paths } from "./paths";

// Get path strings
paths.about.path; // "/about"
paths.blog.path; // "/blog"
paths.blog["[slug]"]("my-post").path; // "/blog/my-post"

// Get full URLs
paths.about.url; // "https://your-domain.com/about"
paths.blog.url; // "https://your-domain.com/blog"

// Create URL objects with query params
paths.blog.URL({ search: { draft: "1" } }); // URL object with query params

// Access route handlers
paths.blog.POST; // Only if POST handler exists in route.ts
```

## Configuration

The generated paths use the `NEXT_PUBLIC_APP_BASE_URL` environment variable by default. You can change this using the `-e` or `--env` option:

```bash
npx next-paths generate --env NEXT_PUBLIC_SITE_URL
```

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm test
```

## License

MIT
