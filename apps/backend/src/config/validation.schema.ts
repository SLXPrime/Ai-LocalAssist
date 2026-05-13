import * as Joi from 'joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
  PORT: Joi.number().optional(),
  BACKEND_PORT: Joi.number().optional(),
  BACKEND_API_KEY: Joi.string().min(12).optional(),
  OLLAMA_BASE_URL: Joi.string().uri().required(),
  OLLAMA_MODEL: Joi.string().default('llama3.1:8b'),
  OLLAMA_API_KEY: Joi.string().default('ollama'),
  POSTGRES_HOST: Joi.string().default('localhost'),
  POSTGRES_PORT: Joi.number().default(5432),
  POSTGRES_DB: Joi.string().default('ai_operator'),
  POSTGRES_USER: Joi.string().default('ai_operator'),
  POSTGRES_PASSWORD: Joi.string().required(),
  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').optional(),
  TOOL_DEFAULT_TIMEOUT_MS: Joi.number().default(15000),
  ALLOWED_DOCKER_CONTAINERS: Joi.string().allow('').default(''),
  SAFE_SHELL_COMMANDS_JSON: Joi.string().default('{}'),
  MINECRAFT_RCON_HOST: Joi.string().default('minecraft'),
  MINECRAFT_RCON_PORT: Joi.number().default(25575),
  MINECRAFT_RCON_PASSWORD: Joi.string().optional(),
}).unknown(true);

