import { Injectable } from '@nestjs/common';
import axios, { AxiosResponse, Method } from 'axios';

@Injectable()
export class ProxyService {
  async getResponse(
    method: string,
    url: string,
    data: Record<string, unknown>,
    params: Record<string, unknown>,
    headers: Record<string, unknown>,
  ): Promise<AxiosResponse<unknown>> {
    // API Gateway returns 403 if GET request has a body.
    // Axios.request() always send a body
    if (method === 'GET') {
      return axios.get(url, { params, headers });
    }
    return axios.request<Record<string, unknown>>({
      method: method as Method,
      url,
      ...(Object.keys(data || {}).length > 0 ? data : {}),
      params,
      headers,
    });
  }
}
