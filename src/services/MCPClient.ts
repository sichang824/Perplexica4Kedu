import { z } from 'zod';
import { mcpConfig } from '../config';
import logger from '../utils/logger';

export const TextToImageResultSchema = z.object({
  type: z.literal('image'),
  image: z.string(),
  mimeType: z.string(),
});

export class MCPClient {
  private client: any;
  private transport: any;

  constructor() {
    logger.info(mcpConfig);

    const {
      StdioClientTransport,
    } = require('@modelcontextprotocol/sdk/client/stdio.js');
    const { Client } = require('@modelcontextprotocol/sdk/client/index.js');

    this.transport = new StdioClientTransport({
      command: mcpConfig.serverUrl,
    });

    this.client = new Client(
      {
        name: 'perplexica-mcp-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      },
    );
  }

  async connect() {
    await this.client.connect(this.transport);
  }

  async textToImage(text: string): Promise<Buffer> {
    try {
      const result = await this.client.request(
        {
          method: 'textToImage',
          params: { text },
        },
        TextToImageResultSchema,
      );

      return Buffer.from(result.image, 'base64');
    } catch (error) {
      console.error('MCP text-to-image conversion failed:', error);
      throw new Error('图片生成失败');
    }
  }
}

export const mcpClient = new MCPClient();
