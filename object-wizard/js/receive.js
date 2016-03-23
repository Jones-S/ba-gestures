(function ($) { // iief = Immediately-Invoked Function Expression, mainly useful to limit scope
    $(function() { // Shorthand for $( document ).ready()

    var socket = io();

    var $el = $('#messages');
    var alpha = 0;
    var hsl_brightness = 0;


    socket.on('chat message', function(msg) {
        console.log("receiving a chat message.");
        // check if body is empty
        if ($('body').children().length > 0) {
            // if not empty it
            $('body').empty();
        }

        $el = $('<div id="messages"></div>');
        $('body').append($el);
        // $el.text(msg);
        $el.typed({
            strings: [msg],
            typeSpeed: 0
        });
    });

    // receive image
    socket.on("image", function(img_source) {
        console.log("image receiving");
        // empty body tag
        $( 'body' ).empty();
        // add container for div
        $('body').append('<div id="img-container" class="img-container"></div>');
        $('<img class="img-fullscreen" src="'+ img_source +'">').load(function() {
            $(this).appendTo('#img-container');
        });

    });

    // receive brightness command
    socket.on("brightness", function(cmd) {
        console.log("cmd: " + cmd);
        calc_alpha(cmd); // calc new alpha
        calc_font_clr(alpha);
        $('body').css('background-color', 'rgba( 0, 0 ,0, ' + alpha + ')');
        if(('#messages').length) { // if message container exists
            // set a new hsl value for the textcolor
            $('#messages').css('color', 'hsl(0, 0%, ' + hsl_brightness + '%)');
        }
    });


    function calc_alpha(_cmd) {
        if (_cmd == "decrease") {
            if (alpha < 1) {
                alpha += 0.05;
            }
        } else {
            if (alpha > 0) {
                alpha -= 0.05;
            }
        }
    }

    function calc_font_clr(_alpha) {
        hsl_brightness = 100 * easeInOutExpo(_alpha, 0, 1, 1);
        console.log("hsl_brightness: " + hsl_brightness);
    }

    function easeInOutExpo(t, b, c, d) {
        /*
        t is current time
        b is start value
        c is change in value
        d is duration
         */
        t /= d/2;
        if (t < 1) {
            return (c/2 * Math.pow( 2, 10 * (t - 1) ) + b);
        }
        t--;
        return c/2 * ( -Math.pow( 2, -10 * t) + 2 ) + b;
    };

    });
}(jQuery));
