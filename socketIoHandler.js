import { Server } from 'socket.io'

export default function injectSocketIO(server) {
  const io = new Server(server)

  const chatUsers = {}
  const usersTyping = {}

  io.on('connection', (socket) => {
    socket.on('join-chat', ({ userId, chatId }) => {
      console.log('join-chat', JSON.stringify({ userId, chatId, chatUsers: chatUsers }))
      socket.join(chatId)

      chatUsers[chatId] ||= []
      usersTyping[chatId] ||= []

      chatUsers[chatId] = unique([...chatUsers[chatId], userId])

      io.to(chatId).emit('connected-users-changed', chatUsers[chatId])

      socket.on('start-typing', () => {
        chatUsers[chatId] = unique([...chatUsers[chatId], userId])
        usersTyping[chatId] = unique([...usersTyping[chatId], userId])

        io.to(chatId).emit('connected-users-changed', chatUsers[chatId])
        io.to(chatId).emit('users-typing-changed', usersTyping[chatId])
      })

      socket.on('stop-typing', () => {
        chatUsers[chatId] = unique([...chatUsers[chatId], userId])
        usersTyping[chatId] = usersTyping[chatId].filter((x) => x !== userId)

        io.to(chatId).emit('connected-users-changed', chatUsers[chatId])
        io.to(chatId).emit('users-typing-changed', usersTyping[chatId])
      })

      socket.on('leave-chat', () => {
        chatUsers[chatId] = chatUsers[chatId].filter((x) => x !== userId)
        socket.leave(chatId)

        console.log('leave-chat', JSON.stringify({ userId, chatId, chatUsers: chatUsers[chatId] }))

        io.to(chatId).emit('connected-users-changed', chatUsers[chatId])
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

const unique = (arr) => [...new Set(arr)]
