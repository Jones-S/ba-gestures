(function() {

    // private functions go here

    /**
     * CSS Painter parses gesture data
     * and changes DOM-Tree elements accordingly.
     */
    LEAPAPP.CSSPainter = function() {
        // constructor
        this.name = "CSS Painter";
        this.css_classes = [];
        this.old_css_classes = [];

    };

    LEAPAPP.CSSPainter.prototype.paint = function(gesture_data) {
        var uber = this;

        // if specific gesture is triggered
        if (gesture_data.thumb_up || gesture_data.cancel) {
            uber.addToCSSClasses('gesture');
        } else {
            uber.removeFromCSSClasses('gesture');
        }

        // if any interaction is detected indicate that
        if (gesture_data.interaction) {
            uber.addToCSSClasses('any-interaction');
        } else {
            uber.removeFromCSSClasses('any-interaction');
        }

        // if a distinct interaction is seen
        if (gesture_data.distint_interaction) {
            uber.addToCSSClasses('distint-interaction');
        } else {
            uber.removeFromCSSClasses('distint-interaction');
        }

        // if arrays are not equal change the dom tree
        if (! _.isEqual(uber.css_classes.sort(), uber.old_css_classes.sort())) {
            var classes = "";
            for (var i = uber.css_classes.length - 1; i >= 0; i--) {
                classes += uber.css_classes[i] + " ";
            }
            $('body').attr('class', classes);
        }

        // save current array to old_css_classes (copy via slice)
        uber.old_css_classes = uber.css_classes.slice();



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

    LEAPAPP.CSSPainter.prototype.addToCSSClasses = function(class_name) {
        var uber = this;
        // check if the class is not already in the css class array
        // indexOf returns -1 if the array does not contain the string
        if (_.indexOf(uber.css_classes, class_name) == -1) {
            uber.css_classes.push(class_name);
        }
    };

    LEAPAPP.CSSPainter.prototype.removeFromCSSClasses = function(class_name) {
        var uber = this;
        var index_of_string = _.indexOf(uber.css_classes, class_name);

        // if an index is given, splice it
        if (index_of_string > -1) {
            uber.css_classes.splice(index_of_string, 1);
        }
    };

}());
