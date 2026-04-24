import { execFile } from "child_process";
import { promisify } from "util";
import type { ClientConfig, RequestOptions } from "./types";

const execFileAsync = promisify(execFile);

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

interface ApiResponse {
  ret: number;
  msg?: string;
  jData?: unknown;
}

export class HttpClient {
  constructor(private config: ClientConfig) { }

  private isTokenExpired(): boolean {
    if (!this.config.token) {
      return true;
    }
    try {
      const parts = this.config.token.split(".");
      if (parts.length !== 3) {
        return true;
      }
      const payload = JSON.parse(atob(parts[1]));
      if (typeof payload.exp !== "number") {
        return false;
      }
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }

  private async refreshTokenIfNeeded(): Promise<void> {
    if (!this.isTokenExpired()) {
      return;
    }

    const args = [
      "-s",
      "-D", "-",
      "-o", "/dev/null",
      // "-H", `User-Agent: ${SHARED_HEADERS["User-Agent"]}`,
      // "-H", `Accept: ${SHARED_HEADERS["Accept"]}`,
      // "-H", `Accept-Language: ${SHARED_HEADERS["Accept-Language"]}`,
      "-H", `Referer: ${this.config.refreshReferer}`,
      // "-H", `Origin: ${this.config.origin}`,
      "-H", `Cookie: __Secure-refresh_token=${this.config.refreshToken}`,
      this.config.refreshUrl,
    ];

    const { stdout } = await execFileAsync("curl", args);

    const statusMatch = stdout.match(/^HTTP\/\S+ (\d+)/);
    if (statusMatch && parseInt(statusMatch[1]) >= 400) {
      throw new Error(`HTTP error ${statusMatch[1]} during token refresh`);
    }

    for (const line of stdout.split(/\r?\n/)) {
      if (!line.toLowerCase().startsWith("set-cookie:")) continue;
      const cookieValue = line.slice(line.indexOf(":") + 1).trim();
      const [nameValue] = cookieValue.split(";");
      const eqIdx = nameValue.indexOf("=");
      if (eqIdx === -1) continue;
      const name = nameValue.slice(0, eqIdx).trim();
      const value = nameValue.slice(eqIdx + 1).trim();
      if (name === "__Secure-access_token") {
        this.config.token = value;
      } else if (name === "__Secure-refresh_token") {
        this.config.refreshToken = value;
      }
    }
  }

  /** Replace the __Secure-access_token value in the stored cookie string. */
  updateToken(jwt: string): void {
    this.config.token = jwt;
  }

  async request(
    method: string,
    path: string,
    options: RequestOptions = {}
  ): Promise<unknown> {
    const url = new URL(path, this.config.baseUrl + "/");
    if (options.params) {
      for (const [key, value] of Object.entries(options.params)) {
        url.searchParams.set(key, value);
      }
    }

    await this.refreshTokenIfNeeded();

    const headers: Record<string, string> = {
      ...SHARED_HEADERS,
      Referer: this.config.referer,
      Origin: this.config.origin,
      Cookie: `__Secure-access_token=${this.config.token}`,
      ...options.headers,
    };

    const response = await fetch(url.toString(), {
      method,
      headers,
      body: options.body,
    });

    if (response.status !== 200) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const body = (await response.json()) as ApiResponse;

    if (body.ret !== 0) {
      throw new Error(body.msg ?? `API error: ret=${body.ret}`);
    }

    return body.jData;
  }

  get(path: string, options?: RequestOptions) {
    return this.request("GET", path, options);
  }

  post<T = unknown>(path: string, data: Record<string, unknown>, options?: RequestOptions): Promise<T> {
    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      formData.append(key, String(value));
    }
    return this.request("POST", path, { ...options, body: formData }) as Promise<T>;
  }
}

