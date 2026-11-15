import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development'),
  PORT: Joi.number().default(4000),
  APP_NAME: Joi.string().default('Adashi API'),
  API_PREFIX: Joi.string().default('api/v1'),
  APP_URL: Joi.string().uri().default('http://localhost:3000'),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),

  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_USERNAME: Joi.string().default('postgres'),
  DATABASE_PASSWORD: Joi.string().allow('').default(''),
  DATABASE_NAME: Joi.string().default('adashi'),
  DATABASE_SSL: Joi.string().valid('true', 'false').default('false'),

  JWT_ACCESS_SECRET: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.string().min(32).required(),
    otherwise: Joi.string().allow('').default('dev_access_secret'),
  }),
  JWT_ACCESS_EXPIRES_IN: Joi.string().default('15m'),
  JWT_REFRESH_SECRET: Joi.string().when('NODE_ENV', {
    is: 'production',
    then: Joi.string().min(32).required(),
    otherwise: Joi.string().allow('').default('dev_refresh_secret'),
  }),
  JWT_REFRESH_EXPIRES_IN: Joi.string().default('7d'),
  AUTH_REQUIRE_VERIFICATION: Joi.string().valid('true', 'false').default('false'),

  REDIS_HOST: Joi.string().default('localhost'),
  REDIS_PORT: Joi.number().default(6379),
  REDIS_PASSWORD: Joi.string().allow('').default(''),

  STORAGE_PROVIDER: Joi.string().allow('').default('local'),
  STORAGE_BUCKET: Joi.string().allow('').default(''),
  STORAGE_REGION: Joi.string().allow('').default(''),
  STORAGE_ACCESS_KEY: Joi.string().allow('').default(''),
  STORAGE_SECRET_KEY: Joi.string().allow('').default(''),

  MAIL_HOST: Joi.string().allow('').default(''),
  MAIL_PORT: Joi.number().allow(null, '').default(''),
  MAIL_USERNAME: Joi.string().allow('').default(''),
  MAIL_PASSWORD: Joi.string().allow('').default(''),
  MAIL_FROM: Joi.string().allow('').default(''),

  BOOTSTRAP_OWNER_EMAIL: Joi.string().email().allow('').default(''),
  BOOTSTRAP_SECRET: Joi.string().allow('').default(''),

  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'debug')
    .default('info'),
});
