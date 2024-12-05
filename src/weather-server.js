import { WebSocketServer } from 'ws'
import { EventEmitter } from 'node:events'

const wss = new WebSocketServer({ port: 8765 })
const emitter = new EventEmitter()
let pendingPromises = []
let pendingData = null

emitter.on('ai-responded', async data => {
  pendingData = null
  await Promise.all(pendingPromises.map(p => p.resolve(data)))
  pendingPromises = []
})

wss.on('connection', ws => {
  console.log('new client has connected to the server')
  // if there's a pending promise, emit the ai request to the newly connected client
  if (pendingPromises.length > 0) {
    ws.send(JSON.stringify({ op: 'ai-request', ...pendingData }))
  }

  // listen to messages and decode them. if it's opcode pred-request, broadcast so an AI client can answer
  ws.on('message', message => {
    const { op, ...jsonData } = JSON.parse(message)
    if (op === 'pred-request') {
      broadcastMessage('pred-request', jsonData)
    } else if (op === 'ai-response') {
      console.log('received ai response', jsonData)
      emitter.emit('ai-responded', { ...jsonData })
    }
  })
})

wss.on('close', ws => {
  console.log('client has disconnected from the server')
})

export const broadcastMessage = (op, jsonData) => {
  console.log(`broadcasting ${op.toUpperCase()} to ${wss.clients.size} clients`)
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ op, ...jsonData }))
    }
  })
}

export const broadcastINMETAlert = ({ title, message, urgency }) => {
  return broadcastMessage('inmet-alert', { title, message, urgency })
}

export const broadcastAIRequest = ({ hour, timeOfDay, maxTemp, minTemp, maxHumidity, minHumidity }) => {
  pendingData = { hour, timeOfDay, maxTemp, minTemp, maxHumidity, minHumidity }
  broadcastMessage('ai-request', pendingData)
}

export const broadcastWeatherData = (data) => {
  return broadcastMessage('weather-data', data)
}

export const waitForAIResponse = () => {
  return new Promise((resolve, reject) => {
    pendingPromises.push({ resolve, reject })
  })
}