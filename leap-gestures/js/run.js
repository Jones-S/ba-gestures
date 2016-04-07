(function ($, app) { // iief = Immediately-Invoked Function Expression, mainly useful to limit scope
    /**
     * Dependencies: jQuery, LEAPAPP
     * LEAPAPP = app for shorter compiling result
     */
    $(function() { // Shorthand for $( document ).ready()

        var flow = {
            seg0: {
                onEnter: function() {
                    // subscribe to topic "gesture"

                    uber.say("I am ready");
                },
                onGestureCheck: function(gesture_data, data) {
                    // check if thumb flag is in the object sent and if it's set to true
                    if(gesture_data.hasOwnProperty('thumb_up') && gesture_data.thumb_up) {
                        machine.callNextSeg('seg1');
                    }
                },
                onLeave: function() {

                },
            },
            seg1: {
                onEnter: function() {
                    uber.say('Hi Human');
                },
                onGestureCheck: function(gesture_data, data) {

                },
                onLeave: function() {

                },
            }
        };

        // Object.create > creates an object without going through its constructor
        // Only the prototype is used
        var first_context = this;
        console.log("this: ", this);
        var myLeapApp = new LEAPAPP.Controller(first_context);
        window.myLeapApp = myLeapApp;
        myLeapApp.init();
        console.log(myLeapApp.name + " initialized.");
    });
}(jQuery, LEAPAPP));