// Mock process.env for tests
process.env.NEXT_PUBLIC_APP_BASE_URL = "http://localhost:3000";
process.env.NEXT_PUBLIC_TEST_URL = "http://localhost:3000";

// Mock URLSearchParams
global.URLSearchParams = class URLSearchParams {
  constructor() {
    this.params = new Map();
  }
  append(key, value) {
    this.params.set(key, value);
  }
  delete(key) {
    this.params.delete(key);
  }
  get(key) {
    return this.params.get(key);
  }
  getAll(key) {
    return Array.from(this.params.entries())
      .filter(([k]) => k === key)
      .map(([, v]) => v);
  }
  has(key) {
    return this.params.has(key);
  }
  set(key, value) {
    this.params.set(key, value);
  }
  toString() {
    return Array.from(this.params.entries())
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
      )
      .join("&");
  }
};
