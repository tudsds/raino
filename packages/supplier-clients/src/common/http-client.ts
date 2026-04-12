/**
 * HTTP client abstraction for supplier adapters.
 * Real adapters use this instead of calling `fetch` directly,
 * making them testable with injected mock clients.
 */

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string>;
}

export interface HttpClient {
  get<T>(path: string, options?: RequestOptions): Promise<T>;
  post<T>(path: string, body: unknown, options?: RequestOptions): Promise<T>;
  postForm<T>(path: string, params: Record<string, string>, options?: RequestOptions): Promise<T>;
}

export class HttpError extends Error {
  readonly status: number;
  readonly body: string;

  constructor(status: number, statusText: string, body: string) {
    super(`HTTP ${status} ${statusText}: ${body.slice(0, 200)}`);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

export class FetchHttpClient implements HttpClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;

  constructor(baseUrl: string, defaultHeaders?: Record<string, string>) {
    // Ensure trailing slash for correct URL resolution with relative paths
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
    this.defaultHeaders = defaultHeaders ?? {};
  }

  async get<T>(path: string, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(path, options?.params);
    const headers = { ...this.defaultHeaders, ...options?.headers };

    const response = await globalThis.fetch(url, { method: 'GET', headers });

    return this.handleResponse<T>(response);
  }

  async post<T>(path: string, body: unknown, options?: RequestOptions): Promise<T> {
    const url = this.buildUrl(path, options?.params);
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.defaultHeaders,
      ...options?.headers,
    };

    const response = await globalThis.fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    return this.handleResponse<T>(response);
  }

  async postForm<T>(
    path: string,
    params: Record<string, string>,
    options?: RequestOptions,
  ): Promise<T> {
    const url = this.buildUrl(path, options?.params);
    const headers: Record<string, string> = {
      'Content-Type': 'application/x-www-form-urlencoded',
      ...this.defaultHeaders,
      ...options?.headers,
    };

    const response = await globalThis.fetch(url, {
      method: 'POST',
      headers,
      body: new URLSearchParams(params).toString(),
    });

    return this.handleResponse<T>(response);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new HttpError(response.status, response.statusText, body);
    }

    const text = await response.text();
    if (!text) {
      return {} as T;
    }
    return JSON.parse(text) as T;
  }

  private buildUrl(path: string, params?: Record<string, string>): string {
    const url = new URL(path, this.baseUrl);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  }
}
