import { Server } from 'socket.io'

export default function injectSocketIO(server) {
  const io = new Server(server)

  const users = {}

  const connectUser = (userId, chatId) => {
    users[chatId] = [
      ...users[chatId].filter((u) => u.id !== userId), // filter other instances of the same user
      { id: userId, connected: true, typing: false },
    ]
  }

  const disconnectUser = (userId, chatId) => {
    users[chatId] = users[chatId].filter((u) => u.id !== userId)
  }

  const setUserTyping = (userId, chatId) => {
    users[chatId] = [
      ...users[chatId].filter((u) => u.id !== userId),
      { id: userId, connected: true, typing: true },
    ]
  }

  const unsetUserTyping = (userId, chatId) => {
    users[chatId] = [
      ...users[chatId].filter((u) => u.id !== userId),
      { id: userId, connected: true, typing: false },
    ]
  }

  io.on('connection', (socket) => {
    socket.on('join-chat', ({ userId, chatId }) => {
      socket.join(chatId)

      users[chatId] ||= []

      connectUser(userId, chatId)
      io.to(chatId).emit('users-changed', users[chatId])

      socket.on('start-typing', () => {
        setUserTyping(userId, chatId)
        io.to(chatId).emit('users-changed', users[chatId])
      })

      socket.on('stop-typing', () => {
        unsetUserTyping(userId, chatId)
        io.to(chatId).emit('users-changed', users[chatId])
      })

      socket.on('stream-response', (data) => {
        connectUser(userId, chatId)
        io.to(chatId).emit('users-changed', users[chatId])

        socket.to(chatId).emit('streaming-response', data)
      })

      socket.on('leave-chat', () => {
        disconnectUser(userId, chatId)
        socket.leave(chatId)

        io.to(chatId).emit('users-changed', users[chatId])
      })
    })

    socket.on('disconnect', () => {
      socket.removeAllListeners('connection')
      socket.removeAllListeners('join-chat')
      socket.removeAllListeners('start-typing')
      socket.removeAllListeners('stop-typing')
      socket.removeAllListeners('leave-chat')
    })
  })
}
