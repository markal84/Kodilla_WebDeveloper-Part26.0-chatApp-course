const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const UsersService = require('./UsersService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server); // connect server to socketIo
const usersService = new UsersService();

app.use(express.static(`${__dirname}/public`));

app.get('/', (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

server.listen(3000, () => {
  console.log('server is running');
});

//listening to connection between client and app
io.on('connection', (socket) => {
    socket.on('join', (name) => {
    //add active user to users chat list
        usersService.addUser({
        id: socket.id,
        name
        });
    //listening to and updating users list information 
        io.emit('update', {
        users: usersService.getAllUsers()
        });
    });
});

//when user close chat app
io.on('connection', (socket) => {
    socket.on('disconnect', () => {
      usersService.removeUser(socket.id);
      socket.broadcast.emit('update', {
        users: usersService.getAllUsers()
      });
    });
});

//sending messages to another users
io.on('connection', (socket) => {
    socket.on('message', (message) => {
      const {name} = usersService.getUserById(socket.id);
      socket.broadcast.emit('message', {
        text: message.text,
        from: name
      });
    });
});