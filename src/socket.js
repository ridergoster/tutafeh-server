import forEach from 'lodash/forEach'
import Debug from 'debug'
import socketIO from 'socket.io'

const debug = Debug('tutafeh:socket')
const sockets = {}

sockets.rooms = []

sockets.init = (server) => {
  const io = socketIO(server)

  debug('Connection: waiting for connection...')

  io.on('connection', (socket) => {
    debug(`Connection: connection from client: ${socket.id}`)

    let addedUser = false
    let myRooms = []

    socket.on('GET_ROOMS', () => {
      socket.emit('ROOMS_UPDATE', sockets.rooms)
    })

    socket.on('CREATE_USER', (data) => {
      if (!addedUser) {
        debug(`Connection: user creation ${data.username}`)
        socket.username = data.username
        addedUser = true
      }

      socket.emit('USER_CREATED', {
        username: socket.username,
      })
    })

    socket.on('JOIN_ROOM', (data) => {
      const roomIndex = sockets.rooms.findIndex(((it) => it.roomId === data.roomId))
      const myRoomIndex = myRooms.findIndex(((it) => it.roomId === data.roomId))

      if (myRoomIndex > -1) return

      if (roomIndex < 0) {
        debug(`Connection: room creation ${data.roomId} - ${data.lang}`)
        sockets.rooms.push({
          ...data,
          users: 1,
        })
      } else {
        sockets.rooms[roomIndex].users += 1
      }

      debug(`Connection: join room ${data.roomId} - ${data.lang}`)
      myRooms.push(data)
      socket.join(data.roomId)

      io.emit('ROOMS_UPDATE', sockets.rooms)

      io.in(data.roomId).emit('USER_JOINED', {
        username: socket.username,
      })
    })

    socket.on('LEAVE_ROOM', (data) => {
      const roomIndex = sockets.rooms.findIndex(((it) => it.roomId === data.roomId))
      const myRoomIndex = myRooms.findIndex(((it) => it.roomId === data.roomId))

      if (myRoomIndex > -1) {
        debug(`Connection: leaving room ${data.roomId}`)
        socket.leave(data.roomId)
        myRooms.splice(myRoomIndex, 1)
        sockets.rooms[roomIndex].users -= 1

        if (sockets.rooms[roomIndex].users < 1) {
          sockets.rooms.splice(roomIndex, 1)
        }

        io.emit('ROOMS_UPDATE', sockets.rooms)

        io.in(data.roomId).emit('USER_LEFT', {
          username: socket.username,
        })
      }
    })

    socket.on('SEND_MESSAGE', (data) => {
      debug(`Connection: ${socket.username} send message to room: ${data.roomId} - ${data.message}`)

      io.in(data.roomId).emit('MESSAGE_RECEIVED', {
        roomId: data.roomId,
        message: data.message,
        username: socket.username,
      })
    })

    socket.on('TYPING', (data) => {
      io.in(data.roomId).emit('TYPING', {
        username: socket.username,
      })
    })

    socket.on('STOP_TYPING', (data) => {
      io.in(data.roomId).emit('STOP_TYPING', {
        username: socket.username,
      })
    })

    socket.on('DROP_ROOMS', () => {
      sockets.rooms = []
      io.emit('ROOMS_UPDATE', sockets.rooms)
    })

    socket.on('disconnect', () => {
      debug(`Connection: disconnection for client ${socket.id}`)
      forEach(myRooms, (room) => {
        socket.broadcast.to(socket.id).emit('LEAVE_ROOM', room)
      })
      socket.username = null
      addedUser = false
      myRooms = []
    })
  })
}

module.exports = sockets
