(function() {

    // private functions go here

    /**
     * Typewriter makes the necessary
     * DOM-Tree manipulations and writing
     * the output text to the screen with typed.js
     * Dependency: typed.js, jQuery
     */
    LEAPAPP.CSSPainter = function() {
        // constructor
        this.name = "CSS Painter";

    };

    LEAPAPP.CSSPainter.prototype.paint = function(gesture_data) {
        // if specific gesture is triggered
        if (gesture_data.thumb_up || gesture_data.cancel) {
            // overwrite class attribute with one class
            $('body').attr('class', 'gesture');
        }

        // if any interaction is detected indicate that
        else if (gesture_data.interaction) {
            $('body').attr('class', 'any-interaction');
        }
        else {
            // remove all classes if no interaction
            $('body').removeClass();
        }
    };

}());
