import * as joi from 'joi';
import * as dotenv from 'dotenv';
dotenv.config();

interface EnvVars {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  NODE_ENV: string;
  MAIL_USER: string;
  MAIL_PASSWORD: string;
  API_SIMI_URL: string;
}

const envSchema = joi
  .object({
    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
    JWT_SECRET: joi.string().required(),
    NODE_ENV: joi.string().valid('development', 'production', 'test').required(),
    MAIL_USER: joi.string().required(),
    MAIL_PASSWORD: joi.string().required(),
    API_SIMI_URL: joi.string().required(),
  })
  .unknown(true);

const validationResult = envSchema.validate(process.env);

if (validationResult.error) {
  throw new Error(`Config validation error: ${validationResult.error.message}`);
}

export const envVars = validationResult.value as EnvVars;
