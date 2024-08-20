import 'dotenv/config';

import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  STRIPE_API_KEY: string;
  SUCCESS_URL: string;
  CANCEL_URL: string;
  ENDPOINT_SECRET: string;
  RABBITMQ_SERVER: string;
}

const envVarsSchema = joi
  .object({
    PORT: joi.number().required(),
    STRIPE_API_KEY: joi.string().required(),
    SUCCESS_URL: joi.string().required(),
    CANCEL_URL: joi.string().required(),
    ENDPOINT_SECRET: joi.string().required(),
    RABBITMQ_SERVER: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envVarsSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  PORT: envVars.PORT,
  STRIPE_API_KEY: envVars.STRIPE_API_KEY,
  SUCCESS_URL: envVars.SUCCESS_URL,
  CANCEL_URL: envVars.CANCEL_URL,
  ENDPOINT_SECRET: envVars.ENDPOINT_SECRET,
  RABBITMQ_SERVER: envVars.RABBITMQ_SERVER,
};
