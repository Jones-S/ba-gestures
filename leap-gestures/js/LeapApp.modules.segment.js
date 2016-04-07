(function() {

    LEAPAPP.Segment = function (segment) {
        // constructor
        // set the name of the instance to the passed objects name e.g 'seg1'
        this.name = 'segment';

        // get object with the name of the segment
        // and save the functions in this.functions
        this.functions = LEAPAPP.flow[segment];
        this.say("hi");

        var uber = this;
        // if onEnter is not a function define an empty one
        if (typeof this.functions.onEnter !== 'function') {
            this.functions.onEnter = function() {};
        }
    };

    LEAPAPP.Segment.prototype.say = function(text) {
        console.log("Object says (text): " + text);
    };


}());