import { Server, WebSocket } from 'ws';
import app from './app';
import http from 'http';
import jwt from 'jsonwebtoken';
import Exception from './utils/baseException';
import { config } from './config';
import { sendChatMessage } from './modules/chat/chat.services';

type SocketMessage = {
  token?: string
  receiverId: string
  type: string
  content?: string
}

// Store connected clients
const clients = new Map<string | number, WebSocket>();

// Create HTTP server
const server = http.createServer(app);

// Create WebSocket server on top of the HTTP server
const webSocketServer = new Server({ server });

// WebSocket connection handler
webSocketServer.on('connection', (socket, req) => {
  let userId = ''

  try {
    console.log('New client connection established');

    const url = new URL(req.url || "", `http://${req.headers.host}`) || ''
    const token = url.searchParams.get("token") || ''

    // Abort if no token provided
    if (!token) 
      throw new Exception(401, "Access denied. No token provided.")

    const decoded = jwt.verify(token, config.JWT_SECRET) as { userId: string }
    userId = decoded.userId.toString()

    // Broadcast all users for new user connection
    broadcast({
      type: 'new-user-connect',
      userId
    })

    // Send the list of all users to new user
    socket.send(JSON.stringify({
      type: 'all-connected-users',
      userIds: [...clients.keys()]
    }))

    // Store client connection
    clients.set(userId, socket)
    console.log(`User ${userId} connected.`)

    // On each socket message sender client send to server, deliver the message back to receiver client
    socket.on('message', async (rawMsg) => {
      const socketMessage: SocketMessage = JSON.parse(rawMsg.toString())
      console.log("socketMessage data", socketMessage)

      // Ensure receiver client is still connected by 'receiverId'
      const targetClient = clients.get(socketMessage.receiverId.toString())
      if (!targetClient || targetClient.readyState !== WebSocket.OPEN)
        return false

      // If socket send chat message data
      if (socketMessage.type === 'message') {
        // Then save chat message to DB
        const chatMessage = await sendChatMessage({ 
          senderId: userId, 
          receiverId: socketMessage.receiverId, 
          content: socketMessage.content  || ''
        })
        // Deliver message back to receiver client
        targetClient.send(JSON.stringify({
          type: "message",
          ...chatMessage
        }))

      } else {
        // Else just deliver message back to receiver client
        targetClient.send(JSON.stringify(socketMessage))
      }
    })

    socket.on('close', () => {
      clients.delete(userId);
      broadcast({
        type: 'user-disconnect',
        userId
      })
      console.log(`User ${userId} disconnected.`)
    })

  } catch (e) {
    clients.delete(userId);
    socket.close()
    console.error(e)
  }
})

function broadcast(data: any, excludeUserId?: number) {
  const message = JSON.stringify(data);

  for (const [userId, client] of clients.entries()) {
    if (userId !== excludeUserId && client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

export {
  server
}