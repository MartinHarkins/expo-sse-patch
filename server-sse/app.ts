// src/index.js
import dotenv from 'dotenv'
import express, { Express, Request, Response } from 'express'

dotenv.config()

const app: Express = express()
const port = process.env.PORT || 3000

app.get('/', (req: Request, res: Response) => {
  res.send('Express + TypeScript Server')
})

app.get('/streaming', (req, res) => {
  console.log('sse: starting')

  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders() // flush the headers to establish SSE with client

  console.log('sse: started')

  let counter = 0
  const interValID = setInterval(() => {
    counter++
    if (counter >= 100) {
      clearInterval(interValID)
      res.end() // terminates SSE session
      return
    }
    res.write(`data: ${JSON.stringify({ num: counter })}\n\n`) // res.write() instead of res.send()
    console.log('sse: data sent')
  }, 1000)

  // If client closes connection, stop sending events
  res.on('close', () => {
    console.log('sse: client closed')
    clearInterval(interValID)
    res.end()
  })
})

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})
