const path = require('path')
const http = require('http')
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');

const {
    generateMessage,
    generateLocationMessage
} = require('./utils/messages')

const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
} = require('./utils/user')

// set up a express server
const app = express();
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000;

// Serve up the public directory
const publicDirectory = path.join(__dirname, '../public')
app.use(express.static(publicDirectory))



// print a message to the terminal when a client connects
io.on("connection", (socket) => {
    console.log('New Websocket Connection')
    // get the username adn room data from the client
    socket.on('join', ({
        username,
        room
    }, callback) => {

        const {
            error,
            user
        } = addUser({
            id: socket.id,
            username,
            room
        })

        if (error) {
            return callback(error)
        }
        // socket.join allows to join a goiven chat room and pass username and room data
        socket.join(user.room)

        // io.to.emit --> allows to send messages to everyone on the room but not to another rooms
        // sends message to the client who entered the chat
        socket.emit('message', generateMessage('Admin', 'Welcome to the chat app'))

        // socket.broadcast.to().emit() --> allows to send messages to everyone on the room except for the specific client
        socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.username} has joined.`))

        // display all the users in the room
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()

    })

    // listening for sendMessage provided by the client
    // providing the callback function (message) to the server
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()
        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        } else {
            io.to(user.room).emit('message', generateMessage(user.username, message))
        }
        callback()
    })

    // server should listen for "sendLocation"
    socket.on('sendLocation', (position, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${position.latitude}${position.longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left the chat.`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})


server.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})