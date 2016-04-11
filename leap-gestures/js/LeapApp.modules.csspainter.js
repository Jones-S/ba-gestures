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
        this.css_classes = [];

    };

    LEAPAPP.CSSPainter.prototype.paint = function(gesture_data) {
        var uber = this;

        // if specific gesture is triggered
        if (gesture_data.thumb_up || gesture_data.cancel) {
            // overwrite class attribute with one class
            uber.css_classes.push('gesture');
        } else {
            uber.css_classes.splice(_.indexOf(uber.css_classes, "gesture"), 1);
        }

        // if any interaction is detected indicate that
        if (gesture_data.interaction) {
            uber.css_classes.push('any-interaction');
        } else {
            uber.css_classes.splice(_.indexOf(uber.css_classes, "any-interaction"), 1);
        }

        // if a distinct interaction is seen
        if (gesture_data.distint_interaction) {
            uber.css_classes.push('distinct-interaction');
        } else {
            // $('body').removeClass('distinct-interaction');
        }

        console.log("uber.css_classes: ", uber.css_classes);


            $('body').attr('class', 'gesture');

        /*
        DEBUG Mode
         */

        if (LEAPAPP.debug) {

            // if any interaction is detected indicate that
            if (gesture_data.fast_moves) {
                if (!$('.hint').length) {
                    $('body').prepend('<div class="hint"></div>');
                }
            } else {
                if ($('.hint').length) {
                    // select children of body, because
                    // dynamically added element is otherwise not found
                    $('body').children('.hint').remove();
                }
            }
        }


    };

}());
