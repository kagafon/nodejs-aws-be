import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { ProxyService } from './services/proxy.service';
import { CacheMiddleware } from './middlewares/cache.middleware';
import { CacheService } from './services/cache.service';

@Module({
  imports: [ConfigModule.forRoot()],
  controllers: [AppController],
  providers: [ProxyService, CacheService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    if (process.env['cachePaths']) {
      process.env['cachePaths'].split(';').forEach((path) => {
        consumer
          .apply(CacheMiddleware)
          .forRoutes({ path, method: RequestMethod.GET });
        consumer
          .apply(CacheMiddleware)
          .forRoutes({ path: `${path}/`, method: RequestMethod.GET });
      });
    }
  }
}
