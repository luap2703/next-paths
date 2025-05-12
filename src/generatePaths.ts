/*
 * generatePaths.ts – library edition (stable)
 * -------------------------------------------------------------
 * `generatePaths()` scans a Next 15 App‑Router tree and writes a typed
 * `paths.ts` helper. Call it from your build/dev pipeline — no CLI side‑effects.
 *
 * ▸ Static, dynamic (`[id]`), optional dynamic (`[[id]]`, `[[...slug]]`)
 * ▸ Invisible route groups `(group)` + parallel slots `@slot`
 * ▸ Deep‑merge when `page.*` and `route.*` coexist
 * ▸ `page.*` exposes `{ path, url, URL }`
 * ▸ Each exported HTTP handler in `route.*` exposes the same trio
 *   (GET / POST / PUT / PATCH / DELETE / HEAD / OPTIONS)
 */

import * as ts from "typescript";
import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "fs";
import path from "path";

const f = ts.factory;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type CaseStyle = "camel" | "snake";

export interface GeneratePathsOptions {
  appDir?: string; // default: <cwd>/src/app
  envKey?: string; // default: NEXT_PUBLIC_APP_BASE_URL
  style?: CaseStyle; // camel (default) | snake
  outputDir?: string; // default: <appDir>/paths.ts
}

export function generatePaths(options: GeneratePathsOptions = {}): void {
  const style: CaseStyle = options.style ?? "camel";
  const appDir = options.appDir
    ? path.resolve(options.appDir)
    : path.join(process.cwd(), "src", "app");
  const envKey = options.envKey ?? "NEXT_PUBLIC_APP_BASE_URL";
  const outFile = path.join(options.outputDir ?? appDir, "paths.ts");

  const rawSegments = scanDir(appDir, style);
  const tree = mergeSegments(rawSegments);

  const source = buildSourceFile(tree, envKey, style);
  const code = ts
    .createPrinter({ newLine: ts.NewLineKind.LineFeed })
    .printFile(source);
  writeFileSync(outFile, code);
  console.log(
    "✅  paths.ts generated →",
    path.relative(process.cwd(), outFile)
  );
}

// ---------------------------------------------------------------------------
// Internal types / constants
// ---------------------------------------------------------------------------

interface Segment {
  key: string;
  pathPart: string; // literal URL slice ("" for dynamic)
  dynamic?: { param: string; optional: boolean };
  hasPage: boolean;
  methods: string[]; // HTTP handlers exported in route.*
  children: Segment[];
}

const METHODS = [
  "GET",
  "POST",
  "PUT",
  "PATCH",
  "DELETE",
  "HEAD",
  "OPTIONS",
] as const;

// ---------------------------------------------------------------------------
// Filesystem traversal → raw segments
// ---------------------------------------------------------------------------

function scanDir(dir: string, style: CaseStyle): Segment[] {
  const out: Segment[] = [];

  for (const name of readdirSync(dir)) {
    if (name === "api") continue;
    const full = path.join(dir, name);
    const stats = statSync(full);

    // route groups or parallel slots are URL‑invisible
    if (
      stats.isDirectory() &&
      (/^\(.*\)$/.test(name) || name.startsWith("@"))
    ) {
      out.push(...scanDir(full, style));
      continue;
    }

    if (stats.isDirectory()) {
      const dyn = name.match(/^\[\[?(?:\.\.\.)?([^\]]+)\]\]?$/); // [id] | [[id]] | [...slug] | [[...slug]]
      const key = toCase(dyn ? dyn[1] : name, style);

      const segment: Segment = {
        key,
        pathPart: dyn ? "" : name,
        hasPage: hasFile(full, "page"),
        methods: extractRouteMethods(full),
        children: scanDir(full, style),
      };
      if (dyn)
        segment.dynamic = { param: dyn[1], optional: name.startsWith("[[") };

      out.push(segment);
    }
  }

  return out;
}

function hasFile(dir: string, base: "page" | "route"): boolean {
  return ["tsx", "ts", "jsx", "js"].some((ext) =>
    existsSync(path.join(dir, `${base}.${ext}`))
  );
}

function extractRouteMethods(dir: string): string[] {
  const routeFile = ["route.tsx", "route.ts", "route.jsx", "route.js"].find(
    (f) => existsSync(path.join(dir, f))
  );
  if (!routeFile) return [];
  const src = readFileSync(path.join(dir, routeFile), "utf8");

  return METHODS.filter((m) => {
    // ES / TS export patterns
    const esRe = new RegExp(
      `export\\s+(?:async\\s+)?(?:function|const|let|var)\\s+${m}\\b`
    );
    // CommonJS compiled pattern: exports.METHOD = or module.exports.METHOD =
    const cjsRe = new RegExp(`(?:exports|module\\.exports)\\.${m}\\s*=`);
    return esRe.test(src) || cjsRe.test(src);
  });
}

// ---------------------------------------------------------------------------
// Deep‑merge to prevent duplicate segment keys
// ---------------------------------------------------------------------------

function mergeSegments(list: Segment[]): Segment[] {
  const map = new Map<string, Segment>();

  for (const seg of list) {
    const existing = map.get(seg.key);
    if (!existing) {
      map.set(seg.key, { ...seg, children: mergeSegments(seg.children) });
      continue;
    }

    // page first, then route ➜ drop GET from route
    if (existing.hasPage && seg.methods.includes("GET")) {
      seg.methods = seg.methods.filter((m) => m !== "GET");
    }
    // route (with GET) first, then page ➜ drop page helpers
    if (!existing.hasPage && existing.methods.includes("GET") && seg.hasPage) {
      seg.hasPage = false;
    }

    existing.hasPage = existing.hasPage || seg.hasPage;
    existing.methods = Array.from(
      new Set([...existing.methods, ...seg.methods])
    );
    existing.children = mergeSegments([...existing.children, ...seg.children]);
  }

  return Array.from(map.values());
}

// ---------------------------------------------------------------------------
// TS factory helpers
// ---------------------------------------------------------------------------

const id = (n: string) => f.createIdentifier(n);
const str = (s: string) => f.createStringLiteral(s);
const concat = (a: ts.Expression, b: ts.Expression) =>
  f.createBinaryExpression(a, ts.SyntaxKind.PlusToken, b);
const paramDecl = (name: string, optional = false) =>
  f.createParameterDeclaration(
    undefined,
    undefined,
    id(name),
    optional ? f.createToken(ts.SyntaxKind.QuestionToken) : undefined,
    f.createKeywordTypeNode(ts.SyntaxKind.StringKeyword),
    undefined
  );
const makeCall = (expr: ts.Expression) =>
  f.createCallExpression(id("make"), undefined, [expr]);

// ---------------------------------------------------------------------------
// Source‑file builder
// ---------------------------------------------------------------------------

function buildSourceFile(
  tree: Segment[],
  envKey: string,
  style: CaseStyle
): ts.SourceFile {
  // url helper
  const urlDecl = f.createVariableStatement(
    undefined,
    f.createVariableDeclarationList(
      [
        f.createVariableDeclaration(
          "url",
          undefined,
          undefined,
          f.createArrowFunction(
            undefined,
            undefined,
            [paramDecl("p")],
            undefined,
            f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            concat(
              f.createElementAccessExpression(
                f.createPropertyAccessExpression(id("process"), "env"),
                str(envKey)
              ),
              id("p")
            )
          )
        ),
      ],
      ts.NodeFlags.Const
    )
  );

  // make helper
  const makeDecl = f.createVariableStatement(
    undefined,
    f.createVariableDeclarationList(
      [
        f.createVariableDeclaration(
          "make",
          undefined,
          undefined,
          f.createArrowFunction(
            undefined,
            undefined,
            [paramDecl("p")],
            undefined,
            f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
            f.createParenthesizedExpression(
              f.createObjectLiteralExpression(
                [
                  f.createPropertyAssignment("path", id("p")),
                  f.createPropertyAssignment(
                    "url",
                    f.createCallExpression(id("url"), undefined, [id("p")])
                  ),
                  f.createPropertyAssignment("URL", buildURLHelper()),
                ],
                true
              )
            )
          )
        ),
      ],
      ts.NodeFlags.Const
    )
  );

  // Build object tree
  const pathsObj = buildRoot(tree);
  const exportDecl = f.createVariableStatement(
    [f.createModifier(ts.SyntaxKind.ExportKeyword)],
    f.createVariableDeclarationList(
      [f.createVariableDeclaration("paths", undefined, undefined, pathsObj)],
      ts.NodeFlags.Const
    )
  );

  return f.createSourceFile(
    [urlDecl, makeDecl, exportDecl],
    f.createToken(ts.SyntaxKind.EndOfFileToken),
    ts.NodeFlags.None
  );

  // ───── local helpers ────────────────────────────────────────────────

  function buildURLHelper(): ts.ArrowFunction {
    // () => new URL(url(p)) – no args allowed
    return f.createArrowFunction(
      undefined,
      undefined,
      [],
      undefined,
      f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
      f.createNewExpression(id("URL"), undefined, [
        f.createCallExpression(id("url"), undefined, [id("p")]),
      ])
    );
  }

  function buildRoot(children: Segment[]): ts.ObjectLiteralExpression {
    const props: ts.ObjectLiteralElementLike[] = [
      f.createSpreadAssignment(makeCall(str(""))),
    ];
    props.push(...children.map((c) => buildProp(c, str(""))));
    return f.createObjectLiteralExpression(props, true);
  }

  function buildProp(seg: Segment, base: ts.Expression): ts.PropertyAssignment {
    if (seg.dynamic)
      return f.createPropertyAssignment(seg.key, buildDynamic(seg, base));
    const nextBase = concat(base, str("/" + seg.pathPart));
    return f.createPropertyAssignment(seg.key, buildSegment(seg, nextBase));
  }

  function buildDynamic(seg: Segment, base: ts.Expression): ts.ArrowFunction {
    const argName = toCase(seg.dynamic!.param, "camel");
    const argId = id(argName);
    const nextBase = seg.dynamic!.optional
      ? f.createConditionalExpression(
          argId,
          f.createToken(ts.SyntaxKind.QuestionToken),
          concat(base, concat(str("/"), argId)),
          f.createToken(ts.SyntaxKind.ColonToken),
          base
        )
      : concat(base, concat(str("/"), argId));
    return f.createArrowFunction(
      undefined,
      undefined,
      [paramDecl(argName, seg.dynamic!.optional)],
      undefined,
      f.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
      buildSegment(seg, nextBase)
    );
  }

  function buildSegment(seg: Segment, base: ts.Expression): ts.Expression {
    const props: ts.ObjectLiteralElementLike[] = [];
    if (seg.hasPage) props.push(f.createSpreadAssignment(makeCall(base)));

    const methodList = seg.hasPage
      ? seg.methods.filter((m) => m !== "GET")
      : seg.methods;
    for (const m of methodList)
      props.push(f.createPropertyAssignment(m, makeCall(base)));

    for (const child of seg.children) props.push(buildProp(child, base));

    return props.length
      ? f.createObjectLiteralExpression(props, true)
      : makeCall(base);
  }
}

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

function toCase(str: string, cs: CaseStyle): string {
  if (cs === "snake") {
    return str
      .replace(/([A-Z])/g, "_$1")
      .replace(/[-\s]+/g, "_")
      .replace(/__+/g, "_")
      .replace(/^_/, "")
      .toLowerCase()
      .replace(/\[\[\.\.\.([^\]]+)\]\]/, "$1") // Handle optional catch-all
      .replace(/\[\.\.\.([^\]]+)\]/, "$1") // Handle catch-all
      .replace(/\[\[([^\]]+)\]\]/, "$1") // Handle optional dynamic
      .replace(/\[([^\]]+)\]/, "$1"); // Handle dynamic
  }
  // camelCase (default)
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^[A-Z]/, (c) => c.toLowerCase());
}
