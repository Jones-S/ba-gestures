LEAPAPP.Segment = function (o) {
    // constructor
    // set the name of the instance to the passed objects name e.g 'seg1'
    this.name = 'o';

    // take functions of object
    this.functions = o.fns;
    console.log("o: ", o);
    // if onEnter is not a function define an empty one
    if (typeof this.functions.onEnter !== 'function') {
        this.functions.onEnter = function() {};
    }
};

LEAPAPP.Segment.prototype.say = function(text) {
    console.log("Object says (text): " + text);
};

