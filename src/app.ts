import cors from 'cors';
import express from 'express';
import http from 'http';
import { getPort } from './config';
import { cacheClient } from './db/cached';
import routes from './routes';
import logger from './utils/logger';
import { startWebSocketServer } from './websocket';

const startServer = async () => {
  const port = getPort();
  const app = express();
  const server = http.createServer(app);

  const corsOptions = {
    origin: '*',
  };

  app.use(cors(corsOptions));
  app.use(express.json());

  app.use('/api', routes);
  app.get('/api', (_, res) => {
    res.status(200).json({ status: 'ok' });
  });

  try {
    await cacheClient.connect();
    logger.info('缓存连接成功');
  } catch (error) {
    logger.error('缓存连接失败:', error);
    process.exit(1);
  }

  server.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });

  startWebSocketServer(server);
};

// 错误处理
process.on('uncaughtException', (err, origin) => {
  logger.error(`Uncaught Exception at ${origin}: ${err}`);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});

// 启动服务器
startServer().catch((error) => {
  logger.error('服务器启动失败:', error);
  process.exit(1);
});
