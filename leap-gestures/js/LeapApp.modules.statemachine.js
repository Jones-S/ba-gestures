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
        this.segment_instances = []; // holds instances of segments. normally contains only 1, max 2 segment instances
        this.flow = flow;
    };

    /**
     * makes an instance of Segment for the passed segment
     * and deletes the old segment instance
     * @param  {object} segment_obj
     */
    LEAPAPP.StateMachine.prototype.callNextSeg = function(segment_obj) {
        var uber = this;

        // make a new instance of the segment class of the given segment
        var segment = new LEAPAPP.Segment(segment_obj);

        // execute onEnter();
        segment.onEnter();

        // execute onLeave of old segment (= last element in array)
        // if there is an older segment in the array
        if (uber.segment_instances > 0) {
            uber.segment_instances[segment_instances.length - 1].onLeave();
        }

        // remove first element of old segment
        if (uber.segment_instances.length > 0) {
            uber.segment_instances.splice(0,1);
        }

        // and push it to the segment instances array
        uber.segment_instances.push(segment);


    };

}());

