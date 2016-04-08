(function() {

    LEAPAPP.Segment = function (segment) {
        // constructor
        var uber = this;
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
            console.log("fn_name: ", fn_name);
            uber[fn_name] = _.bind(fn, uber);
        });

        // if onEnter is not a function define an empty one
        if (typeof uber.onEnter !== 'function') {
            uber.onEnter = function() {};
        }
        // register segment instance as subscriber
        // TODO: bind uber/this context correctly
        myLeapApp.intermediary.subscribe(uber, "gesture");
    };

    LEAPAPP.Segment.prototype.say = function(text) {
        console.log("Object says (text): " + text);
    };


}());

