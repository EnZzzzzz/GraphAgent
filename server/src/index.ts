import { createServer, type Server } from 'node:http'

export interface InlineServer {
  server: Server
  port: number
  close: () => Promise<void>
}

/**
 * 内联 server 入口（占位实现）。
 *
 * 架构约定：desktop 主进程在应用启动时调用 startServer() 拉起本服务，
 * 渲染进程不直接访问系统能力，统一通过 HTTP / WebSocket 与 server 通信，
 * Agent 运行时、会话持久化、图谱数据等业务逻辑都收敛在 server/ 下。
 */
export function startServer(port = 0): Promise<InlineServer> {
  const server = createServer((req, res) => {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok' }))
      return
    }
    res.writeHead(404)
    res.end()
  })

  return new Promise((resolve, reject) => {
    server.on('error', reject)
    // port 传 0 让系统分配空闲端口，避免与本地其他服务冲突
    server.listen(port, '127.0.0.1', () => {
      const address = server.address()
      const actualPort = typeof address === 'object' && address ? address.port : port
      resolve({
        server,
        port: actualPort,
        close: () => new Promise((done) => server.close(() => done()))
      })
    })
  })
}
