//index.js
//try
const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const { addUser, removeUser, getUser, getUsersInRoom } = require('./users.js');

const PORT = process.env.PORT || 3005;

const router = require('./router');
// const { addUser, getUsersInRoom } = require('./users');

const app = express();
const server = http.createServer(app);
const io = socketio(server, {
    cors: {
        origin: "*",
    },
});

io.on('connection', (socket) => {
  
    socket.on('join', ({ name, room }, callback)=> {
        const { error, user } = addUser({ id: socket.id, name: name, room: room });

        if(error) {
            return callback(error);
        }

        socket.emit('message', { user: 'admin', text: `${user.name}, welcom to the room ${user.room}` });
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name}, has joined!` });

        socket.join(user.room);

        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', { user: user.name, text: message });

        callback();
    });

    socket.on('disconnect', () => {
        console.log('User has left');
    });
})

app.use(router);

server.listen(PORT, () => console.log(`server has started on port ${PORT}`));


// https://www.youtube.com/watch?v=ZwFA3YMfkoc&ab_channel=JavaScriptMastery