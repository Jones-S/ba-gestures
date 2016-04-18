(function ($, app) { // iief = Immediately-Invoked Function Expression, mainly useful to limit scope
    /**
     * Dependencies: jQuery, LEAPAPP
     * LEAPAPP = app for shorter compiling result
     */
    $(function() { // Shorthand for $( document ).ready()
        var object = { start: "test"};

        function parseJSON(json_data){
            var temp_data = {};
            $.each(json_data, function(key, val) {
                // do some rewriting
                if (key === "onEnter") {
                    console.log("onenterli");
                }
                // check if val is object
                if (typeof val === 'object') {
                    temp_data[key] = parseJSON(val);
                } else {
                    temp_data[key] = val;
                }
            });
            return temp_data;
        }


        // load json file
        $.getJSON("/js/flow.json", function(data) {
            object = parseJSON(data);
            console.log("£OObjectli: ", object);
        });


        var flow = {
            doAlways: {
                onEnter: function() {
                    this.say('Oh irgendwas');
                },
                onGestureCheck: function(gesture_data, data) {
                    if (gesture_data.swipe == "up") {
                        // myLeapApp.machine.callNextSeg('seg_lamp_on');
                        myLeapApp.shiftr.publish('/lamp', 'on');
                        console.log("go up but no segment");

                    } else if(gesture_data.swipe == "down") {
                        myLeapApp.shiftr.publish('/lamp', 'off');

                    } else if(gesture_data.on) {
                        console.log("ON is true");
                        myLeapApp.shiftr.publish('/lamp', 'on');

                    } else if(gesture_data.off) {
                        console.log("OFF is true");
                        myLeapApp.shiftr.publish('/lamp', 'off');
                    }
                },
                onLeave: function() {
                }

            },
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