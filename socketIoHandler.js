// socketIoHandler.js
import { Server } from 'socket.io'

export default function injectSocketIO(server) {
  const io = new Server(server)

  const chatUsers = {}
  const usersTyping = {}

  io.on('connection', (socket) => {
    console.log('connection in')

    socket.on('join-chat', ({ userId, chatId }) => {
      console.log('on.join-chat', { userId, chatId })

      chatUsers[chatId] = [...new Set([...(chatUsers[chatId] || []), userId])]

      socket.emit('connected-users-changed', chatUsers)
      console.log(`socket.emit('connected-users-changed', ${JSON.stringify(chatUsers)})`)
    })

    socket.on('start-typing', ({ userId, chatId }) => {
      console.log('on.start-typing', { userId, chatId })
      usersTyping[chatId] = [...new Set([...(usersTyping[chatId] || []), userId])]
      socket.emit('users-typing-changed', usersTyping)
      console.log(`socket.emit('users-typing-changed', ${JSON.stringify(usersTyping)})`)
    })

    socket.on('stop-typing', ({ userId, chatId }) => {
      console.log('on.stop-typing', { userId, chatId })
      usersTyping[chatId] = (usersTyping[chatId] || []).filter((x) => x !== userId)
      socket.emit('users-typing-changed', usersTyping)
      console.log(`socket.emit('users-typing-changed', ${JSON.stringify(usersTyping)})`)
    })

    socket.on('leave-chat', ({ userId, chatId }) => {
      console.log('on.leave-chat', { userId, chatId })

      chatUsers[chatId] = (chatUsers[chatId] || []).filter((x) => x !== userId)
      socket.emit('connected-users-changed', chatUsers)

      console.log(`socket.emit('connected-users-changed', ${JSON.stringify(chatUsers)})`)
    })

    socket.on('disconnect', () => {
      console.log('on.disconnect and removeAllListeners')
      socket.removeAllListeners('connection')
      socket.removeAllListeners('join-chat')
      socket.removeAllListeners('start-typing')
      socket.removeAllListeners('stop-typing')
      socket.removeAllListeners('leave-chat')
    })
  })
}
