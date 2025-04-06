import 'dotenv/config'

export const config = {
  JWT_SECRET: process.env.JWT_SECRET ?? (() => { throw new Error("Missing JWT_SECRET") })(),
  SERVER_PORT: process.env.SERVER_PORT ?? (() => { throw new Error("Missing SERVER_PORT") })(),
};