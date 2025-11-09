import * as joi from 'joi';
import * as dotenv from 'dotenv';
dotenv.config();

interface EnvVars {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  NODE_ENV: string;
  RESEND_API_KEY: string;
  MAIL_FROM: string;
  API_SIMI_URL: string;
  APP_URL: string;
  ADMIN_EMAIL: string;
  ADMIN_PASSWORD: string;
}

const envSchema = joi
  .object({
    PORT: joi.number().required(),
    DATABASE_URL: joi.string().required(),
    JWT_SECRET: joi.string().required(),
    NODE_ENV: joi.string().valid('development', 'production', 'test').required(),
    RESEND_API_KEY: joi.string().required(),
    MAIL_FROM: joi.string().required(),
    API_SIMI_URL: joi.string().required(),
    APP_URL: joi.string().required(),
    ADMIN_EMAIL: joi.string().email().required(),
    ADMIN_PASSWORD: joi.string().required(),
  })
  .unknown(true);

const validationResult = envSchema.validate(process.env);

if (validationResult.error) {
  throw new Error(`Config validation error: ${validationResult.error.message}`);
}

export const envVars = validationResult.value as EnvVars;
