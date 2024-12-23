import type { Embeddings } from '@langchain/core/embeddings';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { AIMessage, BaseMessage, HumanMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import express from 'express';
import { config } from '../config';
import { cacheClient } from '../db/cached';
import {
  getAvailableChatModelProviders,
  getAvailableEmbeddingModelProviders,
} from '../lib/providers';
import { MetaSearchAgentType } from '../search/metaSearchAgent';
import logger from '../utils/logger';
import { searchHandlers } from '../websocket/messageHandler';

const router = express.Router();

interface chatModel {
  provider: string;
  model: string;
  customOpenAIBaseURL?: string;
  customOpenAIKey?: string;
}

interface embeddingModel {
  provider: string;
  model: string;
}

interface ChatRequestBody {
  optimizationMode: 'speed' | 'balanced';
  focusMode: string;
  chatModel?: chatModel;
  embeddingModel?: embeddingModel;
  query: string;
  history: Array<[string, string]>;
}

router.post('/', async (req, res) => {
  try {
    const body: ChatRequestBody = req.body;

    if (!body.focusMode || !body.query) {
      return res.status(400).json({ message: 'Missing focus mode or query' });
    }

    // 生成缓存键，包含所有相关参数
    const cacheKey = `search:${JSON.stringify({
      query: body.query,
      focusMode: body.focusMode,
      optimizationMode: body.optimizationMode,
      chatModel: body.chatModel,
      embeddingModel: body.embeddingModel,
      historyLength: body.history?.length || 0,
    })}`;

    // 检查缓存
    const cachedResult = await cacheClient.get(cacheKey);
    if (cachedResult) {
      logger.info(`从缓存获取搜索结果: ${cacheKey}`);
      return res.json(JSON.parse(cachedResult));
    }

    body.history = body.history || [];
    body.optimizationMode = body.optimizationMode || 'balanced';

    const history: BaseMessage[] = body.history.map((msg) => {
      if (msg[0] === 'human') {
        return new HumanMessage({
          content: msg[1],
        });
      } else {
        return new AIMessage({
          content: msg[1],
        });
      }
    });

    const [chatModelProviders, embeddingModelProviders] = await Promise.all([
      getAvailableChatModelProviders(),
      getAvailableEmbeddingModelProviders(),
    ]);

    const chatModelProvider =
      body.chatModel?.provider || Object.keys(chatModelProviders)[0];
    const chatModel =
      body.chatModel?.model ||
      Object.keys(chatModelProviders[chatModelProvider])[0];

    const embeddingModelProvider =
      body.embeddingModel?.provider || Object.keys(embeddingModelProviders)[0];
    const embeddingModel =
      body.embeddingModel?.model ||
      Object.keys(embeddingModelProviders[embeddingModelProvider])[0];

    let llm: BaseChatModel | undefined;
    let embeddings: Embeddings | undefined;

    if (body.chatModel?.provider === 'custom_openai') {
      if (
        !body.chatModel?.customOpenAIBaseURL ||
        !body.chatModel?.customOpenAIKey
      ) {
        return res
          .status(400)
          .json({ message: 'Missing custom OpenAI base URL or key' });
      }

      llm = new ChatOpenAI({
        modelName: body.chatModel.model,
        openAIApiKey: body.chatModel.customOpenAIKey,
        temperature: 0.7,
        configuration: {
          baseURL: body.chatModel.customOpenAIBaseURL,
        },
      }) as unknown as BaseChatModel;
    } else if (
      chatModelProviders[chatModelProvider] &&
      chatModelProviders[chatModelProvider][chatModel]
    ) {
      llm = chatModelProviders[chatModelProvider][chatModel]
        .model as unknown as BaseChatModel | undefined;
    }

    if (
      embeddingModelProviders[embeddingModelProvider] &&
      embeddingModelProviders[embeddingModelProvider][embeddingModel]
    ) {
      embeddings = embeddingModelProviders[embeddingModelProvider][
        embeddingModel
      ].model as Embeddings | undefined;
    }

    if (!llm || !embeddings) {
      return res.status(400).json({ message: 'Invalid model selected' });
    }

    const searchHandler: MetaSearchAgentType = searchHandlers[body.focusMode];

    if (!searchHandler) {
      return res.status(400).json({ message: 'Invalid focus mode' });
    }

    const emitter = await searchHandler.searchAndAnswer(
      body.query,
      history,
      llm,
      embeddings,
      body.optimizationMode,
      [],
    );

    let message = '';
    let sources = [];

    emitter.on('data', (data) => {
      const parsedData = JSON.parse(data);
      if (parsedData.type === 'response') {
        message += parsedData.data;
      } else if (parsedData.type === 'sources') {
        sources = parsedData.data;
      }
    });

    emitter.on('end', async () => {
      const result = { message, sources };

      // 将结果存入缓存
      await cacheClient.set(
        cacheKey,
        JSON.stringify(result),
        config.CACHE.CACHE_EXPIRATION,
      );
      logger.info(`搜索结果已缓存: ${cacheKey}`);
      res.status(200).json(result);
    });

    emitter.on('error', (data) => {
      const parsedData = JSON.parse(data);
      res.status(500).json({ message: parsedData.data });
    });
  } catch (err: any) {
    logger.error(`搜索出错: ${err.message}`);
    res.status(500).json({ message: '发生错误。' });
  }
});

export default router;
