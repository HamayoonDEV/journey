import dotenv, { config } from "dotenv";
dotenv.config();

const PORT = process.env.PORT;
const DATABASE_CONNECTION_STRING = process.env.DATABASE_CONNECTION_STRING;
const ACCESS_TOKEN_STRING = process.env.ACCESS_TOKEN_STRING;
const REFRESH_TOKEN_STRING = process.env.REFRESH_TOKEN_STRING;
const BACKEND_URL = process.env.BACKEND_URL;

export {
  PORT,
  DATABASE_CONNECTION_STRING,
  ACCESS_TOKEN_STRING,
  REFRESH_TOKEN_STRING,
  BACKEND_URL,
};
