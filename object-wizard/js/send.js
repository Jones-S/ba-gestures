(function ($) { // iief = Immediately-Invoked Function Expression, mainly useful to limit scope
    $(function() { // Shorthand for $( document ).ready()

    var socket = io();
    var int00;
    var command;

    // send message if send button is pressed
    $('.form-input').submit(function() {
        socket.emit('chat message', $('#m').val());
        $('#m').val('');
        return false;
    });
    // append the sent message to the history
    socket.on('chat message', function(msg) {
        $('#messages').append($('<li>').text(msg));
    });

    // emit image if button is pressed
    $('.gesture').on( "click", function() {
        console.log('send that gesture: ' + this.getAttribute('src'));
        socket.emit('image', this.getAttribute('src'));
    });

    // emit order to increase or decrease brightness
    $('.brightness').mousedown(function(){
        // save cmd
        command = $(this).data('cmd');
        int00 = setInterval(function() { emit_brightness(); }, 50);
    }).mouseup(function() {
        clearInterval(int00);
    });

    function emit_brightness() {
        console.log('increase or decrease: ' + command);
        socket.emit('brightness', command);
    }

    });

}(jQuery));