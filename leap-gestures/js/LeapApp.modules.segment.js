(function() {

    LEAPAPP.Segment = function (segment) {
        var uber = this;
        // constructor
        // set the name of the instance to the passed objects name e.g 'seg1'
        uber.name = 'segment';

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
    };

    LEAPAPP.Segment.prototype.say = function(text) {
        console.log("Object says (text): " + text);
    };


}());

