(function() {

    // // private functions go here
    // function set_msg_clr() {
    //     var uber = this;
    //     // TODO: check if this is the correct context
    //     if(('#messages').length) { // if message container exists
    //         // set a new hsl value for the textcolor
    //         $('#messages').css('color', 'hsl(0, 0%, ' + uber.hsl_brightness + '%)');
    //     }
    // }

    /**
     * Typewriter makes the necessary
     * DOM-Tree manipulations and writing
     * the output text to the screen with typed.js
     * Dependency: typed.js, jQuery
     */

    // TODO: use http://gabrielflorit.github.io/typewriter-js/
    // as an alternative maybe with better painting performance
    LEAPAPP.Typewriter = function() {
        // constructor
        this.name = "typewriter";
        this.hsl_brightness = 0;

    };

    LEAPAPP.Typewriter.prototype.write = function(msg) {
        // check if writing option is set to true
        if (myLeapApp.typewriter) {

            // remove old message container
            var $el = $('#messages');
            if ($el.length > 0) {
                // if not empty it
                $el.remove();
            }
            $el = $('<div id="messages" class="messages"></div>');
            $('body').append($el);
            // set_msg_clr(); // set color of messages
            $el.typed({
                strings: [msg],
                typeSpeed: 0,
                showCursor: false
            });
        } else {
            // only add text to the div
            $('#messages').html(msg);
        }

    };

}());
