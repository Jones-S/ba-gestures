LEAPAPP.Controller = function() {
    this.function_name = "controller";
};


LEAPAPP.Controller.prototype = {
    init: function(flow) {
        console.log("controller initialized");

        // populate variables
        LEAPAPP.currentSeg = "seg0";
        this.gestureChecker = {};

        // loop through all passed segments in flow
        // and create a new segment object for it
        for (var i = 0; i < flow.length; i++) {
            flow[i]
        }
        for (var i in flow){
            if (hasOwn.call(flow, i)) {
                // create a new Segment
                var segment = new LEAPAPP.Segment(flow[i]);

                // use jQuery extend method to deep copy the object from flow into new Segment
                $.extend( true, segment,  );
                LEAPAPP.segments.push(segment);
            }
        }

    },

    startTracking: function() {
        // create new Tracker
        gestureChecker = new LEAPAPP.GestureChecker("gestureChecker");
        gestureChecker.init(LEAPAPP.draw, function callbackFunction(data) {
            Mediator.publish("gesture", data);
        });
    },

    /**
     * go through all functions of the current segment and execute them
     * @return {[type]} [description]
     */
    execSegments: function(currentSeg) {
        console.log("Execute!");
        console.log("currentSeg: " + currentSeg);
        var cs = LEAPAPP.segments[0];
        for (var i = cs.fns.length - 1; i >= 0; i--) {
            seg.fns[i]();
        }
    }
};