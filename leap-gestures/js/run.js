(function ($, app) { // iief = Immediately-Invoked Function Expression, mainly useful to limit scope
    /**
     * Dependencies: jQuery, LEAPAPP
     * LEAPAPP = app for shorter compiling result
     */
    $(function() { // Shorthand for $( document ).ready()

        var flow = {
            on_off_count: 0,    // save count and increase if on off
            distinct_count: 0,


            doAlways: {
                onEnter: function() {
                    this.played_fns.on_enter = true;
                },
                onGestureCheck: function(gesture_data, data) {
                    if (this.try(gesture_data, 'swipe')) {
                        if (gesture_data.swipe == 'up') {
                            myLeapApp.shiftr.publish('/lamp', 'on');
                            myLeapApp.flow.on_off_count++;
                        }
                        else if(gesture_data.swipe == "down") {
                            myLeapApp.shiftr.publish('/lamp', 'off');
                            myLeapApp.flow.on_off_count++;

                        }
                    }
                    else if(this.try(gesture_data, 'on')) {
                        console.log("ON is true");
                        myLeapApp.shiftr.publish('/lamp', 'on');
                        myLeapApp.flow.on_off_count++;

                    }
                    else if(this.try(gesture_data, 'off')) {
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
                    else if (this.try(gesture_data, 'cancel')) {
                        myLeapApp.machine.callNextSeg('seg3');
                    }
                    // TODO: all distinct interactions should count
                    // else if (this.try(gesture_data, 'distinct_interaction') || this.try(gesture_data, 'swipe')) {
                    //     myLeapApp.flow.distinct_count++;
                    //     console.log("%c myLeapApp.flow.distinct_count", "background: #0D0B07; color: #FAFBFF", myLeapApp.flow.distinct_count);
                    //     if (myLeapApp.flow.distinct_count > 6) {
                    //         myLeapApp.machine.callNextSeg('seg6');
                    //     }
                    // }

                },
                onLeave: function() {
                }
            },
            seg2: {
                onEnter: function() {
                    this.say('Ok, dann ist ja alles in Ordnung. Ich lass dich weiter rumprobieren.');
                    this.played_fns.on_enter = true;
                },
                onGestureCheck: function(gesture_data, data) {
                },
                onLeave: function() {
                }
            },
            seg3: {
                onEnter: function() {
                    this.say('Ist für dich nicht klar, mit welcher Geste du das Objekt steuerst?');
                    this.played_fns.on_enter = true;
                },
                onGestureCheck: function(gesture_data, data) {
                    if (this.try(gesture_data, 'thumb_up')) {
                        myLeapApp.machine.callNextSeg('seg5');
                    }
                    else if (this.try(gesture_data, 'distinct_interaction')) {
                        myLeapApp.flow.distinct_count++;
                        console.log("%c myLeapApp.flow.distinct_count", "background: #0D0B07; color: #FAFBFF", myLeapApp.flow.distinct_count);
                        if (myLeapApp.flow.distinct_count > 3) {
                            myLeapApp.machine.callNextSeg('seg4');
                        }
                    }
                },
                onLeave: function() {
                }
            },
            seg4: {
                onEnter: function() {
                    var uber = this;
                    this.say('Ich habe zwar deine Antwort wieder nicht komplett erkannt,');
                    setTimeout(function() {
                        uber.say('Aber ich gehe davon aus, dass nicht alles so ganz klar ist.');
                        setTimeout(function() {
                            uber.say('Gib mir doch ein Zeichen, falls alles OK ist.');
                            // set flag that onEnter is finished playing
                            uber.played_fns.on_enter = true;
                        }, 4000);
                    }, 3000);
                },
                onGestureCheck: function(gesture_data, data) {

                },
                onLeave: function() {
                }
            },
            seg5: {
                onEnter: function() {
                    var uber = this;
                    this.say('Ok. Halte Deine Hand mit der Handfläche nach unten.')
                    setTimeout(function() {
                        uber.say('Und bewege Deine Hand nach oben oder unten.');
                        uber.played_fns.on_enter = true;
                    }, 3000);                },
                onGestureCheck: function(gesture_data, data) {
                    if (gesture_data.swipe == "up" || gesture_data.swipe == 'down') {
                        // set lamp on in doAlways
                        myLeapApp.machine.callNextSeg('seg8');
                    }
                },
                onLeave: function() {
                }
            },
            seg5a: {
                onEnter: function() {
                    var uber = this;
                    this.say('Halte Deine Hand mit der Handfläche nach unten.')
                    setTimeout(function() {
                        uber.say('Und bewege Deine Hand nach oben oder unten.');
                        uber.played_fns.on_enter = true;
                    }, 3000);                },
                onGestureCheck: function(gesture_data, data) {
                    if (gesture_data.swipe == "up" || gesture_data.swipe == 'down') {
                        // set lamp on in doAlways
                        myLeapApp.machine.callNextSeg('seg8');
                    }
                },
                onLeave: function() {
                }
            },
            seg6: {
                onEnter: function() {
                    var uber = this;
                    this.say('Ich verstehe nicht ganz, was Du mir sagen willst.');
                    setTimeout(function() {
                        uber.say('Falls alles Ok ist, halt doch deinen Daumen hoch.');
                        setTimeout(function() {
                            uber.say('Falls nicht, schüttle Deine Hand, als würdest Du etwas ablehnen.');
                            // set flag that onEnter is finished playing
                            uber.played_fns.on_enter = true;
                        }, 4000);
                    }, 3000);
                },
                onGestureCheck: function(gesture_data, data) {
                    if (this.try(gesture_data, 'thumb_up')) {
                        myLeapApp.machine.callNextSeg('seg2');
                    }
                    else if (this.try(gesture_data, 'cancel')) {
                        myLeapApp.machine.callNextSeg('seg3');
                    }
                    else if (this.try(gesture_data, 'distinct_interaction')) {
                        myLeapApp.flow.distinct_count++;
                        console.log("%c myLeapApp.flow.distinct_count", "background: #0D0B07; color: #FAFBFF", myLeapApp.flow.distinct_count);
                        if (myLeapApp.flow.distinct_count > 10) {
                            myLeapApp.machine.callNextSeg('seg7');
                        }
                    }
                },
                onLeave: function() {
                }
            },
            seg7: {
                onEnter: function() {
                    this.say('Ok, vielleicht kommen wir einfach nicht miteinander aus.');
                    setTimeout(function() {
                        uber.say('Ich lass dich einfach weiter probieren');
                        uber.played_fns.on_enter = true;
                    }, 3000);
                },
                onGestureCheck: function(gesture_data, data) {

                },
                onLeave: function() {
                }
            },
            seg8: {
                onEnter: function() {
                    this.say('Geht doch ;).');
                    // setTimeout(function() {
                    //     resetAssistent();
                    // }, 3000);
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
        var controller_options = {
            flow:       flow,
            start_seg:  'seg1',
            mqtt_uri:   'mqtt://e0b7ded5:04f776d89819bfdb@broker.shiftr.io',
            client_id:  'jonas laptop'
        };
        var myLeapApp = new LEAPAPP.Controller(controller_options);
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