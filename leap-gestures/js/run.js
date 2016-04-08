(function ($, app) { // iief = Immediately-Invoked Function Expression, mainly useful to limit scope
    /**
     * Dependencies: jQuery, LEAPAPP
     * LEAPAPP = app for shorter compiling result
     */
    $(function() { // Shorthand for $( document ).ready()

        var flow = {
            seg0: {
                onEnter: function() {
                    this.say("hi there");
                },
                /**
                 * checks for gestures
                 * possible gesture booleans are
                 * [ gestures.interaction
                 *   gestures.thumb_up
                 *   gestures.cancel
                 *   gestures.fast_moves ]
                 * @param  {[type]} gesture_data holds the gesture booleans
                 * @param  {[type]} data         holds the frame data from leap
                 */
                onGestureCheck: function(gesture_data, data) {
                    // check if thumb flag is in the object sent and if it's set to true
                    if(this.try(gesture_data, 'interaction')) {
                        myLeapApp.machine.callNextSeg('seg1');
                    }
                },
                onLeave: function() {
                }
            },
            seg1: {
                onEnter: function() {
                    this.say('Hey. Kontrolliere mich doch per Gesten.');
                },
                onGestureCheck: function(gesture_data, data) {
                    if (this.try(gesture_data, 'thumb_up')) {
                        myLeapApp.machine.callNextSeg('seg2');
                    }
                    // else if(this.returnValidationQuery('interaction')) {
                    //     myLeapApp.machine.callNextSeg('seg2');
                    // }
                },
                onLeave: function() {
                }
            },
            seg2: {
                onEnter: function() {
                    this.say('Oh I registered a thumb.');
                },
                onGestureCheck: function(gesture_data, data) {

                },
                onLeave: function() {
                }
            },









            seg99: {
                onEnter: function() {
                },
                onGestureCheck: function(gesture_data, data) {

                },
                onLeave: function() {
                }
            }
        };


        // Object.create > creates an object without going through its constructor
        // Only the prototype is used
        var myLeapApp = new LEAPAPP.Controller(flow);
        window.myLeapApp = myLeapApp;
        myLeapApp.init();
        console.log(myLeapApp.name + " initialized.");
    });
}(jQuery, LEAPAPP));