(function () {

    // private functions go here

    /**
     * stateMachine object controlls the different
     * steps of a segment, initializes new segment instances
     * and controls onEnter, onGestureCheck and [onLeave]
     */
    LEAPAPP.StateMachine = function (flow) {
        // constructor
        this.name = "stateMachine";
        this.flow = flow;
        this.current_segment = undefined;
    };

    /**
     * makes an instance of Segment for the passed segment
     * and deletes the old segment instance
     * @param  {string} segment_name
     */
    LEAPAPP.StateMachine.prototype.callNextSeg = function(segment_name) {
        var uber = this;

        // get object of segment_name
        var seg_object = uber.flow[segment_name];

        // make a new instance of the segment class of the given segment
        var new_segment = new LEAPAPP.Segment(seg_object);

        // check if current segment exists
        if (uber.current_segment) {
            console.log("uber.current_segment: ", uber.current_segment);
            uber.current_segment.onLeave();
        }
        // execute onEnter();
        new_segment.onEnter();

        // make new segment the current segment
        uber.current_segment = new_segment;

    };

}());

