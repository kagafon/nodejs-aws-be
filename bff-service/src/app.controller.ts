import { All, Controller, Req, Res } from '@nestjs/common';
import { AxiosError } from 'axios';
import { Request, Response } from 'express';
import { CacheService } from './services/cache.service';
import { ProxyService } from './services/proxy.service';
@Controller()
export class AppController {
  private cachedPaths: string[];
  constructor(
    private readonly proxyService: ProxyService,
    private readonly cacheService: CacheService,
  ) {
    this.cachedPaths = process.env['cachePaths']
      .split(';')
      .map((path) => `/${path}/`);
  }

  @All()
  async proxyAll(@Req() req: Request, @Res() res: Response) {
    const pathParts = req.url.split('?')[0].split('/');
    const sourceUrl = [process.env[pathParts[1]], ...pathParts.slice(2)].join(
      '/',
    );

    if (pathParts[1] && process.env[pathParts[1]]) {
      return this.proxyService
        .getResponse(req.method, sourceUrl, req.body, req.query, req.headers)
        .then((resp) => {
          if (
            req.method === 'GET' &&
            pathParts[1] &&
            (this.cachedPaths.includes(req.path) ||
              this.cachedPaths.includes(req.path + '/'))
          ) {
            this.cacheService.setCachedResponse(pathParts[1], resp);
          }
          res.status(resp.status).json(resp.data);
        })
        .catch((err: AxiosError) => {
          return res
            .status(err.response?.status || 500)
            .json(err.response?.data);
        });
    } else {
      return res.status(502).json({ message: 'Cannot process request' });
    }
  }
}
