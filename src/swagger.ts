// swagger.ts
import swaggerJsdoc from 'swagger-jsdoc'
import swaggerUi from 'swagger-ui-express'
import { Express } from 'express'

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API',
      version: '1.0.0',
      description: 'API documentation'
    },
    servers: [
      {
        url: 'http://localhost:5000'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  security: [
    {
      bearerAuth: [],
    },
  ],
  apis: [
    './src/modules/user/*.routes.ts',
    './src/modules/friend/*.routes.ts',
    './src/modules/chat/*.routes.ts'
  ]
}

const swaggerOptional = {
  customSiteTitle: "API Docs", // Customize the title
  swaggerOptions: {
    authAction: {
      authorize: {
        type: 'apiKey',
        name: 'Authorization',
        in: 'header',
        description: 'Enter Bearer token in the format: `Bearer <token>`',
      }
    }
  }
}
const swaggerSpec = swaggerJsdoc(options)

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerOptional))
}