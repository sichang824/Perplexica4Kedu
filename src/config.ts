import toml from '@iarna/toml';
import fs from 'fs';
import path from 'path';

const configFileName = 'config.toml';

interface Config {
  GENERAL: {
    PORT: number;
    SIMILARITY_MEASURE: string;
    KEEP_ALIVE: string;
  };
  API_KEYS: {
    OPENAI: string;
    GROQ: string;
    ANTHROPIC: string;
    GEMINI: string;
  };
  API_ENDPOINTS: {
    SEARXNG: string;
    OLLAMA: string;
  };
  CACHE: {
    REDIS_URL: string;
    REDIS_DB: number;
    CACHE_EXPIRATION: number;
  };
  MCP: {
    SERVER_URL: string;
  };
}

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

const loadConfig = () =>
  toml.parse(
    fs.readFileSync(path.join(__dirname, `../${configFileName}`), 'utf-8'),
  ) as any as Config;

let cachedConfig: Config | null = null;

const getConfig = (): Config => {
  if (!cachedConfig) {
    cachedConfig = loadConfig();
  }
  return cachedConfig;
};

export const config = new Proxy({} as Config, {
  get: (target, prop: keyof Config) => {
    return getConfig()[prop];
  },
});

export const getPort = () => config.GENERAL.PORT;

export const getSimilarityMeasure = () => config.GENERAL.SIMILARITY_MEASURE;

export const getKeepAlive = () => config.GENERAL.KEEP_ALIVE;

export const getOpenaiApiKey = () => config.API_KEYS.OPENAI;

export const getGroqApiKey = () => config.API_KEYS.GROQ;

export const getAnthropicApiKey = () => config.API_KEYS.ANTHROPIC;

export const getGeminiApiKey = () => config.API_KEYS.GEMINI;

export const getSearxngApiEndpoint = () =>
  process.env.SEARXNG_API_URL || config.API_ENDPOINTS.SEARXNG;

export const getOllamaApiEndpoint = () => config.API_ENDPOINTS.OLLAMA;

export const updateConfig = (newConfig: RecursivePartial<Config>) => {
  const currentConfig = loadConfig();

  for (const key in currentConfig) {
    if (!newConfig[key]) newConfig[key] = {};

    if (typeof currentConfig[key] === 'object' && currentConfig[key] !== null) {
      for (const nestedKey in currentConfig[key]) {
        if (
          !newConfig[key][nestedKey] &&
          currentConfig[key][nestedKey] &&
          newConfig[key][nestedKey] !== ''
        ) {
          newConfig[key][nestedKey] = currentConfig[key][nestedKey];
        }
      }
    } else if (currentConfig[key] && newConfig[key] !== '') {
      newConfig[key] = currentConfig[key];
    }
  }

  fs.writeFileSync(
    path.join(__dirname, `../${configFileName}`),
    toml.stringify(newConfig),
  );

  cachedConfig = null;
};

export const mcpConfig = {
  serverUrl: config?.MCP?.SERVER_URL || 'http://localhost:3002',
  endpoints: {
    textToImage: '/api/text-to-image',
  },
  timeout: 30000,
};
