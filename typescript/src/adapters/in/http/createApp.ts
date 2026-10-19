import { readFileSync } from 'node:fs'
import path from 'node:path'
import express, { type ErrorRequestHandler } from 'express'
import * as OpenApiValidator from 'express-openapi-validator'
import swaggerUi from 'swagger-ui-express'
import { parse } from 'yaml'
import { type TimeDepositUseCases, timeDepositRoutes } from './timeDepositRoutes'

const OPENAPI_SPEC_PATH = path.join(__dirname, 'openapi.yaml')

export function createApp(useCases: TimeDepositUseCases) {
  const apiSpec = parse(readFileSync(OPENAPI_SPEC_PATH, 'utf8'))
  const app = express()

  app.use(express.json())
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(apiSpec))
  app.use(
    '/api',
    OpenApiValidator.middleware({
      apiSpec: OPENAPI_SPEC_PATH,
      validateRequests: true,
      validateResponses: true,
    }),
  )
  app.use('/api', timeDepositRoutes(useCases))
  app.use(errorHandler)

  return app
}

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const status = typeof error.status === 'number' ? error.status : 500
  res.status(status).json({ message: status === 500 ? 'Internal server error' : error.message })
}
