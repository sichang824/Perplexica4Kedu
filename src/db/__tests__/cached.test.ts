import { CacheClient } from '../cached';

describe('CacheClient', () => {
  let cacheClient: CacheClient;

  beforeEach(async () => {
    cacheClient = new CacheClient();
    await cacheClient.connect();
  });

  afterEach(async () => {
    await cacheClient.clear();
    await cacheClient.disconnect();
  });

  it('应该成功设置和获取字符串值', async () => {
    const key = 'testKey';
    const value = 'testValue';

    await cacheClient.set(key, value);
    const result = await cacheClient.get(key);

    expect(result).toBe(value);
  });

  it('应该成功设置和获取对象值', async () => {
    const key = 'testKey';
    const value = { name: 'test', age: 25 };

    await cacheClient.set(key, value);
    const result = await cacheClient.get(key);

    expect(result).toEqual(value);
  });

  it('应该成功删除键', async () => {
    const key = 'testKey';
    await cacheClient.set(key, 'value');

    const result = await cacheClient.delete(key);
    const exists = await cacheClient.exists(key);

    expect(result).toBe(true);
    expect(exists).toBe(false);
  });

  it('应该正确检查键是否存在', async () => {
    const key = 'testKey';
    await cacheClient.set(key, 'value');

    const result = await cacheClient.exists(key);
    expect(result).toBe(true);
  });
});
