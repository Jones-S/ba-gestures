(function ($, app) { // iief = Immediately-Invoked Function Expression, mainly useful to limit scope
    /**
     * Dependencies: jQuery, LEAPAPP
     * LEAPAPP = app for shorter compiling result
     */
    $(function() { // Shorthand for $( document ).ready()

        var flow = {
            on_off_count: 0,    // save count and increase if on off


            doAlways: {
                onEnter: function() {
                    this.played_fns.on_enter = true;
                },
                onGestureCheck: function(gesture_data, data) {
                    if (gesture_data.swipe == "up") {
                        // myLeapApp.machine.callNextSeg('seg_lamp_on');
                        myLeapApp.shiftr.publish('/lamp', 'on');
                        myLeapApp.flow.on_off_count++;

                    } else if(gesture_data.swipe == "down") {
                        myLeapApp.shiftr.publish('/lamp', 'off');
                        myLeapApp.flow.on_off_count++;

                    } else if(gesture_data.on) {
                        console.log("ON is true");
                        myLeapApp.shiftr.publish('/lamp', 'on');
                        myLeapApp.flow.on_off_count++;

                    } else if(gesture_data.off) {
                        console.log("OFF is true");
                        myLeapApp.shiftr.publish('/lamp', 'off');
                        myLeapApp.flow.on_off_count++;
                    }
                },
                onLeave: function() {
                }

            },
            seg0: {
                onEnter: function() {
                    this.played_fns.on_enter = true;
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
                    // if gesture count is high enough aks user
                    if (flow.on_off_count > 5) {
                        myLeapApp.machine.callNextSeg('seg1');
                    }
                    // // check if thumb flag is in the object sent and if it's set to true
                    // if(this.try(gesture_data, 'interaction')) {
                    //     myLeapApp.machine.callNextSeg('seg1');
                    // }
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
                    var uber = this;
                    this.say('Ich erkenne sehr viele Eingaben.');
                    setTimeout(function() {
                        uber.say('Ist alles in Ordnung, oder verstehst du etwas nicht?');
                        setTimeout(function() {
                            uber.say('Gib mir doch ein Zeichen, falls alles OK ist.');
                            // set flag that onEnter is finished playing
                            uber.played_fns.on_enter = true;
                        }, 4000);
                    }, 3000);
                },
                onGestureCheck: function(gesture_data, data) {
                    if (this.try(gesture_data, 'thumb_up')) {
                        myLeapApp.machine.callNextSeg('seg2');
                    }
                },
                onLeave: function() {
                }
            },
            seg2: {
                onEnter: function() {
                    this.say('Ok, dann ist ja alles in Ordnung. Ich lass dich weiter spielen.');
                    this.played_fns.on_enter = true;
                },
                onGestureCheck: function(gesture_data, data) {
                },
                onLeave: function() {
                }
            },
            seg3: {
                onEnter: function() {
                    this.say('Oh irgendwas');
                    this.played_fns.on_enter = true;
                },
                onGestureCheck: function(gesture_data, data) {

                },
                onLeave: function() {
                }
            },










            seg99: {
                onEnter: function() {
                    this.played_fns.on_enter = true;
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