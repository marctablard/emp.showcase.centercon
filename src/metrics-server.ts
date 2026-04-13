import { createServer } from 'http';
import type { MetricsService } from '@/platform/services/metrics/MetricsService';

const DEFAULT_METRICS_PORT = 3001;

export function getMetricsPort(): number {
  const envPort = process.env.NEXT_MONITORING_PORT;
  if (envPort) {
    const parsed = parseInt(envPort, 10);
    if (!isNaN(parsed) && parsed > 0 && parsed <= 65535) {
      return parsed;
    }
  }
  return DEFAULT_METRICS_PORT;
}

export function startMetricsServer(metricsService: MetricsService): { started: boolean; port: number } {
  const port = getMetricsPort();

  if (!metricsService.isEnabled()) {
    return { started: false, port };
  }

  const registry = metricsService.getRegistry();

  const server = createServer(async (req, res) => {
    switch (req.url) {
      case '/health':
        res.setHeader('Content-Type', 'application/json');
        res.statusCode = 200;
        res.end(JSON.stringify({ status: 'OK' }));
        return;
      case '/metrics/prometheus':
        try {
          const metrics = await registry.metrics();
          res.setHeader('Content-Type', registry.contentType);
          res.end(metrics);
        } catch {
          res.statusCode = 500;
          res.end();
        }
        return;
      default:
        res.statusCode = 404;
        res.end();
    }
  });

  server.listen(port);
  return { started: true, port };
}
