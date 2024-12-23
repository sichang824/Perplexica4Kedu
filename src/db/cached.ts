import { createClient, RedisClientType } from 'redis';
import { config } from '../config';
import logger from '../utils/logger';
interface CacheConfig {
  url?: string;
  host?: string;
  port?: number;
  password?: string;
  db?: number;
}

class CacheClient {
  private client: RedisClientType;
  private isConnected: boolean = false;
  private config: CacheConfig;

  constructor(config?: CacheConfig) {
    this.config = {
      url: process.env.REDIS_URL,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || '0'),
      ...config,
    };

    const url =
      this.config.url || `redis://${this.config.host}:${this.config.port}`;

    this.client = createClient({
      url,
      password: this.config.password,
      database: this.config.db,
    });

    this.client.on('error', (err) => {
      logger.error('Redis错误:', err);
    });
  }

  async connect(): Promise<void> {
    if (!this.isConnected) {
      await this.client.connect();
      this.isConnected = true;
    }
  }

  async disconnect(): Promise<void> {
    if (this.isConnected) {
      await this.client.disconnect();
      this.isConnected = false;
    }
  }

  async get<T = string>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      if (!value) return null;
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    } catch (error) {
      logger.error(`获取缓存失败 [${key}]:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<boolean> {
    try {
      const stringValue =
        typeof value === 'string' ? value : JSON.stringify(value);

      if (ttl) {
        await this.client.setEx(key, ttl, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }
      return true;
    } catch (error) {
      logger.error(`设置缓存失败 [${key}]:`, error);
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      logger.error(`删除缓存失败 [${key}]:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      return (await this.client.exists(key)) === 1;
    } catch (error) {
      logger.error(`检查键是否存在失败 [${key}]:`, error);
      return false;
    }
  }

  async clear(): Promise<boolean> {
    try {
      await this.client.flushDb();
      return true;
    } catch (error) {
      logger.error('清空缓存失败:', error);
      return false;
    }
  }
}

// 创建默认实例
export const cacheClient = new CacheClient({
  url: config.CACHE.REDIS_URL,
  db: config.CACHE.REDIS_DB,
});

// 导出类和接口以供自定义使用
export { CacheClient, CacheConfig };
