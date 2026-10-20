import express, { type ErrorRequestHandler } from 'express'
import request from 'supertest'
import { handle } from '../adapters/in/http/handle'

const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  res.status(500).json({ message: error.message })
}

const appWith = (route: ReturnType<typeof handle>) => {
  const app = express()
  app.get('/', route)
  app.use(errorHandler)
  return app
}

describe('handle', () => {
  test('sends the returned status and JSON body', async () => {
    const app = appWith(handle(async () => ({ status: 201, body: { ok: true } })))

    const response = await request(app).get('/').expect(201)

    expect(response.body).toEqual({ ok: true })
  })

  test('defaults the status to 200', async () => {
    const app = appWith(handle(async () => ({ body: { ok: true } })))

    const response = await request(app).get('/').expect(200)

    expect(response.body).toEqual({ ok: true })
  })

  test('sends an empty response when no body is returned', async () => {
    const app = appWith(handle(async () => ({ status: 204 })))

    const response = await request(app).get('/').expect(204)

    expect(response.text).toBe('')
  })

  test('forwards a rejected handler to the error handler', async () => {
    const app = appWith(
      handle(async () => {
        throw new Error('database is down')
      }),
    )

    const response = await request(app).get('/').expect(500)

    expect(response.body).toEqual({ message: 'database is down' })
  })
})
