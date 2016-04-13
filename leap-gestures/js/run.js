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
                // TODO: write interpreter for simplified language
                // gestures: {
                //     thumb_up: {
                //         next: 4
                //     }
                // },
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

                    if (this.try(gesture_data, 'on')) {
                        myLeapApp.machine.callNextSeg('seg4');
                    }

                    // else if (this.try(gesture_data, 'interaction')) {
                    //         myLeapApp.machine.callNextSeg('seg3');
                    // }
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
            seg3: {
                onEnter: function() {
                    this.say('Oh irgendwas');
                },
                onGestureCheck: function(gesture_data, data) {

                },
                onLeave: function() {
                }
            },
            seg4: {
                onEnter: function() {
                    this.say('Lamp On');
                    myLeapApp.shiftr.publish('/lamp', 'on');
                },
                onGestureCheck: function(gesture_data, data) {
                    if (this.try(gesture_data, 'off')) {
                        myLeapApp.machine.callNextSeg('seg5');
                    }
                },
                onLeave: function() {
                }
            },
            seg5: {
                onEnter: function() {
                    this.say('Lamp Off');
                    myLeapApp.shiftr.publish('/lamp', 'off');
                },
                onGestureCheck: function(gesture_data, data) {
                    if (this.try(gesture_data, 'on')) {
                        myLeapApp.machine.callNextSeg('seg4');
                    }
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


        $("body").on( "click", function() {
            if (!myLeapApp.lamp_on) {
                myLeapApp.shiftr.publish('/lamp', 'on');
                myLeapApp.lamp_on = true;
                console.log("on");
            } else {
                myLeapApp.shiftr.publish('/lamp', 'off');
                myLeapApp.lamp_on = false;
                console.log("off");
            }
        });
    });
}(jQuery, LEAPAPP));