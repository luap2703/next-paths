import "@testing-library/jest-dom";

// Mock Next.js server components
jest.mock("next/server", () => ({
  NextResponse: {
    json: (data: any) => data,
  },
}));

// Mock Next.js headers
jest.mock("next/headers", () => ({
  headers: () => new Map(),
  cookies: () => new Map(),
}));
