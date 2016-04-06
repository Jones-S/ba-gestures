LEAPAPP.Controller = function() {
    this.function_name = "controller";
};


LEAPAPP.Controller.prototype = {
    init: function() {
        console.log("controller initialized");
        // populate variables
        this.currentSeg = "seg0";
    },

    startTracking: function() {
        console.log("tracking started");
        console.log("this: " + this);
        console.log(JSON.stringify(this,null, 4));

    }
};