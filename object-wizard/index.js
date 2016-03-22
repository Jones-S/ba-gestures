var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


app.get('/', function(req, res){
    res.sendFile(__dirname + '/receive.html');
    // https://nodejs.org/api/globals.html#globals_dirname

});

// add static for serving files
app.use('/bower_components', express.static('bower_components'));

app.get('/send', function(req, res){
    res.sendFile(__dirname + '/send.html');
    // https://nodejs.org/api/globals.html#globals_dirname

});

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
    console.log('message: ' + msg);
  });

});

http.listen(3000, function(){
  console.log('listening on *:3000');
});