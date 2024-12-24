# 运行

本机运行

```bash
bun dev
cd mcp-server && bun dev
cd ui && bun dev
```

或者 docker-compose运行

```bash
docker-compose up -d
```

优化后的 [docker-compose.yml](docker-compose.yml)

```bash
services:
  searxng:
    image: docker.io/searxng/searxng:latest
    volumes:
      - ./searxng:/etc/searxng:rw
    ports:
      - 4000:8080
    networks:
      - perplexica-network
    restart: unless-stopped

  perplexica-backend:
    build:
      context: .
      dockerfile: backend.dockerfile
    image: itzcrazykns1337/perplexica-backend:main
    environment:
      - SEARXNG_API_URL=http://searxng:8080
      - MCP_SERVER_URL=http://mcp-server:3001
    depends_on:
      - searxng
      - mcp-server
    ports:
      - 3001:3001
    volumes:
      - backend-dbstore:/home/perplexica/data
      - uploads:/home/perplexica/uploads
      - ./config.toml:/home/perplexica/config.toml
    extra_hosts:
      - 'host.docker.internal:host-gateway'
    networks:
      - perplexica-network
    restart: unless-stopped

  perplexica-frontend:
    build:
      context: .
      dockerfile: app.dockerfile
      args:
        - NEXT_PUBLIC_API_URL=http://127.0.0.1:3001/api
        - NEXT_PUBLIC_WS_URL=ws://127.0.0.1:3001
    image: itzcrazykns1337/perplexica-frontend:main
    depends_on:
      - perplexica-backend
    ports:
      - 3000:3000
    networks:
      - perplexica-network
    restart: unless-stopped

  redis:
    image: redis:alpine
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    restart: always

  mcp-server:
    build:
      context: .
      dockerfile: Dockerfile.mcp
    ports:
      - "3002:3002"


networks:
  perplexica-network:

volumes:
  backend-dbstore:
  uploads:
  redis_data:

```

## 题目1（前端）：新增高级 Focus 模式管理界面

![image](docs/image.png)

<video src="https://github.com/sichang824/Perplexica4Kedu/blob/master/docs/Screen%20Recording%202024-12-24%20at%2015.47.49.mov" controls="controls" style="max-width: 730px;">
</video>

## 题目2（后端）：实现 Redis 缓存层优化搜索结果

![image](docs/image1.png)
<video src="https://github.com/sichang824/Perplexica4Kedu/blob/master/docs/Screen%20Recording%202024-12-24%20at%2016.20.35.mov" controls="controls" style="max-width: 730px;">
</video>

## 题目3（后端）：整合 MCP 到 Perplexica，支持文字转图片功能
