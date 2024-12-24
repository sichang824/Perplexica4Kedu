import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { generateTextImage } from './image-service.js';

// 定义参数验证schema
const CreateImageArgumentsSchema = z.object({
  text: z.string().min(1),
});

// 创建服务器实例
const server = new Server(
  {
    name: 'text-to-image-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'create-image',
        description: 'Create an image from text',
        inputSchema: {
          type: 'object',
          properties: {
            text: {
              type: 'string',
              description: 'The text to create an image from',
            },
          },
          required: ['text'],
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    if (name === 'create-image') {
      const { text } = CreateImageArgumentsSchema.parse(args);

      // 生成图片
      const imageBuffer = await generateTextImage({ text });

      // 将buffer转换为base64
      const base64Image = imageBuffer.toString('base64');

      return {
        content: [
          {
            type: 'image',
            data: base64Image,
            mimeType: 'image/png',
          },
        ],
      };
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(
        `Invalid arguments: ${error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', ')}`,
      );
    }
    throw error;
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.log('Text-to-Image MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
