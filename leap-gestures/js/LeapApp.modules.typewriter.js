(function() {

    // private functions go here

    /**
     * Use vanilla js fade functions to use requestAnimationFrame
     * instead of using jQuery fadeIn fadeOut functions, which don't use requestAnimationFrame
     */

    // fade out
    function fadeOut(el) {
        el[0].style.opacity = 1;

        (function fade() {
            if ((el[0].style.opacity -= 0.1) < 0) {
                el[0].style.display = "none";
            } else {
                requestAnimationFrame(fade);
            }
        })();
    }

    function hide(el) {
        // use el[0] because it is a jquery array and only the first should be the one to check
        el[0].style.opacity = 0.0;
    }

    // fade in
    function fadeIn(el, display) {
        el[0].style.opacity = 0;
        el[0].style.display = display || "block";

        (function fade() {
            var val = parseFloat(el[0].style.opacity);
            if ((val += 0.025) < 1) {
                el[0].style.opacity = val;
                requestAnimationFrame(fade);
            }
        })();
    }

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
        // process message
        var messages = msg.split("/nl "); // look for new line indicators
        var html_string = '';
        messages.forEach(function(current, i) {
            html_string += '<p>' + messages[i] + '</p>';
        });

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
            // $('#messages').hide().html(html_string).fadeIn(1600);
            var $elm = $('#messages'); // use val to return only the first element, otherwise it will return an array
            $elm.html(html_string);
            hide($elm);
            fadeIn($elm);
        }

    };

}());
