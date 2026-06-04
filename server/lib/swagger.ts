import swaggerJsdoc from "swagger-jsdoc";
import type { Options } from "swagger-jsdoc";
const API_URI = process.env.API_URI || "http://localhost:8000";
const swaggerOptions: Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "My Express API (TS)",
      version: "1.0.0",
      description: "API documentation with TypeScript and ESM",
    },
    servers: [{ url: `${API_URI}` }],
  },
  apis: ["./routes/*.ts"],
};
export const swaggerSpec = swaggerJsdoc(swaggerOptions);
