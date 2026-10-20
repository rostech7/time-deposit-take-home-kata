import type { Request, RequestHandler } from 'express'

export interface HttpResponse<T> {
  /** Defaults to 200. */
  status?: number
  body?: T
}

export const handle =
  <T>(handler: (req: Request) => Promise<HttpResponse<T>>): RequestHandler =>
  async (req, res, next) => {
    try {
      const { status = 200, body } = await handler(req)
      if (body === undefined) {
        res.status(status).end()
      } else {
        res.status(status).json(body)
      }
    } catch (error) {
      next(error)
    }
  }
