import swaggerJsdoc from 'swagger-jsdoc';
import type { Options } from "swagger-jsdoc"

const swaggerOptions: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My Express API (TS)',
      version: '1.0.0',
      description: 'API documentation with TypeScript and ESM',
    },
    servers: [
      { url: 'http://localhost:8000' },
    ],
  },
  apis: ['./routes/*.ts'], 
};
export const swaggerSpec = swaggerJsdoc(swaggerOptions);