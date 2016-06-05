(function() {

    LEAPAPP.Controller = function(options) {
        this.name               = "LeapApp controller";
        this.flow               = options.flow;
        this.start_seg          = options.start_seg;
        this.debug              = options.debug;
        this.typewriter         = options.typewriter;
        this.gesture_option     = options.gesture_option;
        this.music_folder       = options.music_folder;
        this.ext_sounds         = options.ext_sounds;
        this.visualizer         = options.visualizer;

        this.shiftr_info = {
            mqtt_uri:   options.mqtt_uri,
            client_id:  options.client_id
        };

    };


    LEAPAPP.Controller.prototype.init = function() {
        // save this in var uber for consistency
        var uber = this;

        // initiate Mediator, Statemachine and GestureChecker
        uber.intermediary   = new LEAPAPP.Mediator();
        uber.machine        = new LEAPAPP.StateMachine(uber.flow);
        uber.tracker        = new LEAPAPP.GestureChecker();
        // uber.typer          = new LEAPAPP.Typewriter();
        uber.painter        = new LEAPAPP.CSSPainter();
        uber.shiftr         = new LEAPAPP.Shiftr(uber.shiftr_info);
        uber.sounder        = new LEAPAPP.Sound();
        uber.radio          = new LEAPAPP.Radio();

        // subscribe 'doAlways'-Segment to the publisher
        var new_segment     = new LEAPAPP.Segment(uber.flow.doAlways);
        new_segment.onEnter(); // execute onEnter to skip that (otherwise onGestureCheck won't be executed)

        // reset certain states (like lamp state)
        // only reset if lamp flow is chosen
        if (uber.flow.name == 'lamp') {
            myLeapApp.shiftr.publish('/lamp', 'reset');
        }


        /**
         * the callback function says what is called each frame
         * within the leap frame controller
         * @param  {object} gesture_data: the gesture_data will pass an object with the gesture flags
         * @param  {object} data: will pass the leap frame object
         * @return {[type]}       [description]
         */
        uber.tracker.startTracking(function callbackFunction(gesture_data, data) {
            uber.intermediary.publish("gesture", gesture_data, data);
        });
    };



}());