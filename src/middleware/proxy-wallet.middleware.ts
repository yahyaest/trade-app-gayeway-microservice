import { NestMiddleware } from '@nestjs/common';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { CustomLogger } from 'src/myLogger';

// This is a reverse proxy class per service (wallet) . 
// This implementation require to create a class per service and configure it in app.module.ts
// Instead a dynamic solution is to introduce a routes.json config file that contains services config and in main.ts parse routes.json and for each service add a createProxyMiddleware method from 'http-proxy-middleware' library


export class ReverseProxyWalletMiddleware implements NestMiddleware {
  private readonly logger = new CustomLogger(ReverseProxyWalletMiddleware.name);

  private proxy = createProxyMiddleware({
    target: 'http://wallet:3000/',
    // changeOrigin: true,
    pathRewrite: { '/trade-wallet': '' },
    secure: false,
    on: {
      proxyReq: (proxyReq, req, res) => {
        // this.logger.log(`ProxyReq is ${proxyReq}`);
        this.logger.log(
          `Proxing ${req.method} request originally made to ${req.url}`,
        );
      },
    },
  });

  use(req: any, res: any, next: () => void) {
    this.proxy(req, res, next);
  }
}
