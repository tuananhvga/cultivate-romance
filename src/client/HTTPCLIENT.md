<!-- COPILOT CONTEXT: attach this file (@HTTPCLIENT.md) at the start of a new session to instantly recover HttpClient context. -->

# HttpClient Context

## Project

Express + TypeScript fullstack app (`cultivate_romance`). Single process serves frontend (`public/`) and backend API.
Stack: Node 22, TypeScript (commonjs, ES2020), `tsx` for dev, `tsc` for production build.

## Purpose of HttpClient

Thin fetch wrapper for the Crystal Rose Wild Rift external API. Centralises:
- Cookie-based authentication (`__Secure-access_token` is the only token that matters)
- Shared browser-like headers (User-Agent, Sec-Fetch-*, Cache-Control, etc.)
- Base URL, Referer, Origin

Config is loaded from `config.json` (gitignored). See `config.example.json` for shape.

## File layout

```
src/client/
├── types.ts          ← ClientConfig, RequestOptions interfaces
├── client.ts         ← HttpClient class
├── index.ts          ← barrel export
└── actions/
    └── farm.ts       ← example action (POST pub/farm)
```

## Source files (current state)

### `src/client/types.ts`
```typescript
export interface ClientConfig {
  /** Base URL, e.g. "https://as.api.h5.wildrift.leagueoflegends.com/5c/crystalrose" */
  baseUrl: string;
  /** Full cookie header string */
  cookies: string;
  /** Referer header value */
  referer: string;
  /** Origin header value */
  origin: string;
}

export interface RequestOptions {
  /** URL query params */
  params?: Record<string, string>;
  headers?: Record<string, string>;
  body?: string | FormData | URLSearchParams | Buffer | null;
}
```

### `src/client/client.ts`
```typescript
import type { ClientConfig, RequestOptions } from "./types";

const SHARED_HEADERS: Record<string, string> = {
  "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:150.0) Gecko/20100101 Firefox/150.0",
  Accept: "application/json, text/plain, */*",
  "Accept-Language": "en-US,en;q=0.9",
  "Accept-Encoding": "gzip, deflate, br, zstd",
  Connection: "keep-alive",
  "Sec-Fetch-Dest": "empty",
  "Sec-Fetch-Mode": "cors",
  "Sec-Fetch-Site": "same-site",
  Pragma: "no-cache",
  "Cache-Control": "no-cache",
};

export class HttpClient {
  constructor(private config: ClientConfig) {}

  /** Replace the __Secure-access_token value in the stored cookie string. */
  updateToken(jwt: string): void {
    this.config.cookies = this.config.cookies.replace(
      /(?<=__Secure-access_token=)[^;]*/,
      jwt
    );
  }

  async request(method: string, path: string, options: RequestOptions = {}): Promise<Response> {
    const url = new URL(path, this.config.baseUrl + "/");
    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        url.searchParams.set(key, value);
      }
    }
    const headers: Record<string, string> = {
      ...SHARED_HEADERS,
      Referer: this.config.referer,
      Origin: this.config.origin,
      Cookie: this.config.cookies,
      ...options.headers,
    };
    return fetch(url.toString(), { method, headers, body: options.body });
  }

  get(path: string, options?: RequestOptions) { return this.request("GET", path, options); }
  post(path: string, options?: RequestOptions) { return this.request("POST", path, options); }
}
```

### `src/client/index.ts`
```typescript
export { HttpClient } from "./client";
export * from "./actions/farm";
export type { ClientConfig, RequestOptions } from "./types";
```

### `src/client/actions/farm.ts` (example action)
```typescript
import type { HttpClient } from "../client";

/** POST /pub/farm?a=garden */
export async function farm(client: HttpClient): Promise<unknown> {
  const boundary = "----geckoformboundary866060abcde2c9fd97900078c5404f92";
  const body = `--${boundary}--\r\n`;
  const response = await client.post("pub/farm", {
    params: { a: "garden" },
    headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
    body,
  });
  return response.json();
}
```

## Conventions

- Actions live in `src/client/actions/<name>.ts`, one function per file.
- Each action receives `client: HttpClient` as its only argument.
- Return type is the parsed JSON response (use a typed interface when the shape is known).
- Export the function from `src/client/index.ts`.
- `Content-Type` is the only header actions typically need to set; everything else is automatic.

## Adding a new action (checklist)

1. Create `src/client/actions/<name>.ts` — import `HttpClient`, export one `async function`.
2. Add `export * from "./actions/<name>";` to `src/client/index.ts`.
3. Run `npm run build` to verify TypeScript compiles cleanly.

