(function() {

    // private functions go here
    function set_msg_clr() {
        var uber = this;
        if(('#messages').length) { // if message container exists
            // set a new hsl value for the textcolor
            $('#messages').css('color', 'hsl(0, 0%, ' + uber.hsl_brightness + '%)');
        }
    }

    /**
     * Typewriter makes the necessary
     * DOM-Tree manipulations and writing
     * the output text to the screen with typed.js
     * Dependency: typed.js, jQuery
     */
    LEAPAPP.Typewriter = function() {
        // constructor
        this.name = "typewriter";
        this.hsl_brightness = 0;

    };

    LEAPAPP.Typewriter.prototype.write = function(msg) {
        // remove old message container
        var $el = $('#messages');
        if ($el.length > 0) {
            // if not empty it
            $el.remove();
        }
        $el = $('<div id="messages"></div>');
        $('body').append($el);
        set_msg_clr(); // set color of messages
        $el.typed({
            strings: [msg],
            typeSpeed: 0,
            showCursor: false
        });
    };

}());
