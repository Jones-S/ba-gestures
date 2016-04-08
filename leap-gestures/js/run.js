(function ($, app) { // iief = Immediately-Invoked Function Expression, mainly useful to limit scope
    /**
     * Dependencies: jQuery, LEAPAPP
     * LEAPAPP = app for shorter compiling result
     */
    $(function() { // Shorthand for $( document ).ready()

        var flow = {
            seg0: {
                onEnter: function() {
                    this.say('First segment starts off');
                },
                onGestureCheck: function(gesture_data, data) {
                    // check if thumb flag is in the object sent and if it's set to true
                    if(gesture_data.hasOwnProperty('thumb_up') && gesture_data.thumb_up) {
                        myLeapApp.machine.callNextSeg('seg1');
                    }
                },
                onLeave: function() {
                    this.say('Bye machine');
                }
            },
            seg1: {
                onEnter: function() {
                    this.say('Hi Human');
                },
                onGestureCheck: function(gesture_data, data) {

                },
                onLeave: function() {
                    this.say('Bye human');
                },
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