export interface ClientConfig {
  /** Base URL, e.g. "https://as.api.h5.wildrift.leagueoflegends.com/5c/crystalrose" */
  baseUrl: string;
  /** Token string */
  token?: string;
  /** Refresh token string */
  refreshToken: string;
  /** Refresh url string */
  refreshUrl: string;
  /** Refresh referer string */
  refreshReferer: string;
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
