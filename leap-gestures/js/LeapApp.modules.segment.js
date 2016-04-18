(function() {

    LEAPAPP.Segment = function (segment) {
        // constructor
        var uber = this;
        uber.played_fns = {
            on_enter: false,
            on_gesture_check: false,
            on_leave: false
        };
        /**
         * this for Each loop iterates over the functions
         * defined in the segment and
         *  binds the context of the instance
         * to the function defined in the flow object.
         * by that: this in e.g. this.say points to the instance and
         * can call the say function.
         * @param  {Function} fn         the function
         * @param  {string}   fn_name    functionname
         */
        _.forEach(segment, function(fn, fn_name){
            uber[fn_name] = _.bind(fn, uber);
        });

        // if onEnter is not a function define an empty one
        if (typeof uber.onEnter !== 'function') {
            uber.onEnter = function() {};
        }
        if (typeof uber.onGestureCheck !== 'function') {
            uber.onGestureCheck = function() {};
        }
        if (typeof uber.onLeave !== 'function') {
            uber.onLeave = function() {};
        }
        // register segment instance as subscriber
        myLeapApp.intermediary.subscribe(uber, "gesture");
    };

    LEAPAPP.Segment.prototype.say = function(text) {
        // type it to the screen using typewriter class
        myLeapApp.typer.write(text);
    };

    LEAPAPP.Segment.prototype.try = function(gesture_data, gesture) {
        if (gesture_data.hasOwnProperty(gesture) && gesture_data[gesture]) {
            return true;
        } else {
            return false;
        }

    };

}());

