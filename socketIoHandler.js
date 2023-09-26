import { Server } from 'socket.io'

export default function injectSocketIO(server) {
  const io = new Server(server)

  const chatUsers = {}
  const usersTyping = {}

  io.on('connection', (socket) => {
    socket.on('join-chat', ({ userId, chatId }) => {
      socket.join(chatId)

      chatUsers[chatId] = [...new Set([...(chatUsers[chatId] || []), userId])]

      io.to(chatId).emit('connected-users-changed', chatUsers[chatId])

      socket.on('start-typing', () => {
        usersTyping[chatId] = [...new Set([...(usersTyping[chatId] || []), userId])]

        io.to(chatId).emit('users-typing-changed', usersTyping[chatId])
      })

      socket.on('stop-typing', () => {
        usersTyping[chatId] = (usersTyping[chatId] || []).filter((x) => x !== userId)

        io.to(chatId).emit('users-typing-changed', usersTyping[chatId])
      })

      socket.on('leave-chat', () => {
        chatUsers[chatId] = (chatUsers[chatId] || []).filter((x) => x !== userId)
        socket.leave(chatId)

        io.to(chatId).emit('connected-users-changed', chatUsers[chatId])
      })

      socket.on('disconnect', () => {
        socket.removeAllListeners('connection')
        socket.removeAllListeners('join-chat')
        socket.removeAllListeners('start-typing')
        socket.removeAllListeners('stop-typing')
        socket.removeAllListeners('leave-chat')
      })
    })
  })
}
