export interface HttpRequestService {
    get<T>(url: string, options?: Record<string, unknown>): Promise<T>;
    post<T, D>(
      url: string,
      data: D,
      options?: Record<string, unknown>,
    ): Promise<T>;
  }