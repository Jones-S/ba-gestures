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

  socket.on('image', function(info) {
    // fs = fileSystem in Node: https://nodejs.org/api/fs.html#fs_fs_readfile_file_options_callback
    fs.readFile(__dirname + '/img/ok_gesture.jpg', function(err, buf) {
        io.emit('image', {
            image: true,
            buffer: buf.toString('base64')
        });
        console.log('image file is initialized');
    });
  });
});




http.listen(3000, function(){
  console.log('listening on *:3000');
});