import axios, { AxiosRequestConfig, Method } from 'axios';
import * as zlib from 'zlib';
import { HttpRequestService } from './types';

export class AxiosService implements HttpRequestService {
  private readonly baseUrl: string;
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  private async gunzip(data): Promise<string> {
    return new Promise((resolve) => {
      zlib.gunzip(data, function (error, result) {
        if (error) throw error;
        return resolve(result.toString());
      });
    });
  }
  private async request<T>(
    url: string,
    method: Method,
    options?: AxiosRequestConfig,
  ): Promise<T> {
    const requestConfig = options || {};
    requestConfig.url = url;
    requestConfig.method = method;
    requestConfig.baseURL = this.baseUrl;
    requestConfig.responseType = 'arraybuffer';
    requestConfig.decompress = true;

    const response = await axios<T>({
      ...requestConfig,
    });
    const data = await this.gunzip(response.data);
    
    return JSON.parse(data) as T;
  }

  public async get<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
    return this.request<T>(url, 'get', options);
  }

  public async post<T, D>(
    url: string,
    data: D,
    options?: AxiosRequestConfig,
  ): Promise<T> {
    const reqOptions = options || {};
    reqOptions.data = data;
    return this.request(url, 'post', reqOptions);
  }
}
