import { Server } from 'socket.io'

export default function injectSocketIO(server) {
  const io = new Server(server)

  io.on('connection', (socket) => {
    let user = `User ${Math.round(Math.random() * 999999)}`
    console.log(`connection established with user ${user}`)
    socket.emit('user', user)

    socket.on('message', (message) => {
      io.emit('message', {
        from: user,
        message: message,
        time: new Date().toLocaleString(),
      })
    })

    socket.on('typing', () => {
      io.emit('typing', user)
    })

    socket.on('stopped-typing', () => {
      io.emit('stopped-typing', user)
    })
  })

  console.log('SocketIO injected')
}
