LEAPAPP.Controller = function() {
    this.function_name = "controller";
};


LEAPAPP.Controller.prototype = {
    init: function(flow) {
        console.log("controller initialized");

        // populate variables
        this.currentSeg = "seg0";

        // loop through all passed segments in flow
        // and create a new segment object for it
        for (var i in flow){
            if (hasOwn.call(flow, i)) {
                // create a new Segment
                var segment = new LEAPAPP.Segment();
                LEAPAPP.segments.push(segment);
            }
        }

    },

    startTracking: function() {
        console.log("tracking started");
    }
};