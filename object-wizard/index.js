var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var fs = require('fs'); // required for file serving

app.get('/', function(req, res){
    res.sendFile(__dirname + '/receive.html');
    // https://nodejs.org/api/globals.html#globals_dirname

});

// add static for serving files
app.use('/bower_components', express.static('bower_components'));
app.use('/css', express.static('css'));
app.use('/js', express.static('js'));
app.use('/img', express.static('img'));

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

  // send an image - or rather the command to load a url
  socket.on('image', function(source) {
    console.log("source: " + source);
    // dont send image but rather the file path
    io.emit('image', source);
  });

  // send cmd to increase or decrease screen brightness
  socket.on('brightness', function(cmd) {
    console.log("cmd: " + cmd);
    io.emit('brightness', cmd);
  });
});




http.listen(3000, function(){
  console.log('listening on *:3000');
});