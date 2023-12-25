import * as express from 'express'
import { Server as SocketServer, Socket } from 'socket.io'
import { join } from 'path'
import { Server as HttpServer, createServer as createServerHttp } from 'http'
import { Server as HttpsServer, createServer as createServerHttps } from 'https'

export abstract class ApiServerBase {
  app: express.Application
  server: HttpServer
  io: SocketServer
  sockets: Socket[] = []

  start?(): Promise<any>
}