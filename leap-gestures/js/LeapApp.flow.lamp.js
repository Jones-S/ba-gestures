/**
 * Flow defines the interaction Flow in one object. For better code structure the whole flow
 * lies in it's own file.
 */

var LAMPFLOW = {

    on_off_count: 0,    // save count and increase if on off
    distinct_count: 0,

    doAlways: {
        onEnter: function() {
            this.played_fns.on_enter = true;
            this.flags = {
                lamp_on:                false,
                first_gesture_saved:    false
            };
            this.brightness = 100;
            this.brightness_publish_count = 0;
            this.on_off_gesture = false; // container for saving the first on off gesture ['swipe' / 'explode']

        },
        onGestureCheck: function(gesture_data, data) {
            var uber = this;

            // check if swipe gesture was registered and if the inititial gesture was not explode
            if (this.try(gesture_data, 'swipe') && this.on_off_gesture != 'explode') {
                if (gesture_data.swipe == 'up') {
                    if (!this.flags.lamp_on) {
                        // check if gesture option is set and on_off_gesture is not defined yet
                        if (myLeapApp.gesture_option && !this.on_off_gesture) {
                            // save first gesture if gesture option is set
                            this.on_off_gesture = 'swipe';
                            console.log("this.on_off_gesture: ", this.on_off_gesture);
                        }
                        myLeapApp.shiftr.publish('/lamp', 'on');
                        myLeapApp.sounder.play('on');
                        myLeapApp.flow.on_off_count++;
                        this.flags.lamp_on = true;
                    }
                }
                else if(gesture_data.swipe == "down") {
                    if (this.flags.lamp_on) {
                        if (myLeapApp.gesture_option && !this.on_off_gesture) {
                            // save first gesture
                            this.on_off_gesture = 'swipe';
                        }
                        myLeapApp.shiftr.publish('/lamp', 'off');
                        myLeapApp.sounder.play('off');
                        myLeapApp.flow.on_off_count++;
                        this.flags.lamp_on = false;
                    }
                }
            }
            else if(this.try(gesture_data, 'on') && this.on_off_gesture != 'swipe') {
                if (!this.flags.lamp_on) {
                    if (myLeapApp.gesture_option && !this.on_off_gesture) {
                        // save first gesture
                        this.on_off_gesture = 'explode';
                        console.log("this.on_off_gesture: ", this.on_off_gesture);
                    }
                    myLeapApp.shiftr.publish('/lamp', 'on');
                    myLeapApp.sounder.play('on');
                    myLeapApp.flow.on_off_count++;
                    this.flags.lamp_on = true;
                }

            }
            else if(this.try(gesture_data, 'off') && this.on_off_gesture != 'swipe') {
                if (this.flags.lamp_on) {
                    if (myLeapApp.gesture_option && !this.on_off_gesture) {
                        // save first gesture
                        this.on_off_gesture = 'explode';
                    }
                    myLeapApp.shiftr.publish('/lamp', 'off');
                    myLeapApp.sounder.play('off');
                    myLeapApp.flow.on_off_count++;
                    this.flags.lamp_on = false;
                }
            }
            // if lamp is on check y axis for dimming
            if (this.flags.lamp_on) {
                // set current position of hand to current brightness
                if (data.hands.length === 1) {
                    uber.brightness_publish_count++;
                    // only publish every x frames
                    if (uber.brightness_publish_count % 15 === 0) {
                        // y-Axis range 120mm – 420mm
                        // mapping this to brightness
                        // console.log("data.hands[0].palmPosition[1]: ", data.hands[0].palmPosition[1]);
                        var y_axis = data.hands[0].palmPosition[1];
                        this.brightness = y_axis.map(120, 420, 5, 150);
                        this.brightness = (this.brightness < 5) ? 5 : this.brightness; // 5 is minimum
                        this.brightness = (this.brightness > 150) ? 150 : this.brightness; // 150 maximum
                        console.log("this.brightness: ", this.brightness);
                        myLeapApp.shiftr.publish('/lamp', 'brightness-' + this.brightness);
                    }
                    // reset counter every now and then
                    if (uber.brightness_publish_count >= 3600) {
                        uber.brightness_publish_count = 0;
                    }
                }

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
            if (myLeapApp.flow.on_off_count > 13) {
                myLeapApp.machine.callNextSeg('seg1');
            }
            // // check if thumb flag is in the object sent and if it's set to true
            // if(this.try(gesture_data, 'interaction')) {
            //     myLeapApp.machine.callNextSeg('seg1');
            // }
        },
        onLeave: function() {
        }
    },
    seg1: {
        onEnter: function() {
            var uber = this;
            this.say('Ich erkenne sehr viele Eingaben.');
            setTimeout(function() {
                uber.say('Ist alles in Ordnung, oder verstehst Du etwas nicht?');
                setTimeout(function() {
                    uber.say('Gib mir doch ein Zeichen, ob alles OK ist oder nicht.');
                    // set flag that onEnter is finished playing
                    uber.played_fns.on_enter = true;
                }, 2500);
            }, 2800);
        },
        onGestureCheck: function(gesture_data, data) {
            if (this.try(gesture_data, 'thumb_up')) {
                myLeapApp.machine.callNextSeg('seg2');
                myLeapApp.flow.distinct_count = 0;
            }
            else if (this.try(gesture_data, 'ok')) {
                myLeapApp.machine.callNextSeg('seg2a');
                myLeapApp.flow.distinct_count = 0;
            }
            else if (this.try(gesture_data, 'cancel')) {
                myLeapApp.machine.callNextSeg('seg3');
                myLeapApp.flow.distinct_count = 0;
            }
            else if (
                       (this.try(gesture_data, 'distinct_interaction'))
                    || (this.try(gesture_data, 'swipe'))
                    || (this.try(gesture_data, 'on'))
                    || (this.try(gesture_data, 'off'))
                ) {
                myLeapApp.flow.distinct_count++;
                // console.log("%c myLeapApp.flow.distinct_count", "background: #0D0B07; color: #FAFBFF", myLeapApp.flow.distinct_count);
                if (myLeapApp.flow.distinct_count > 8) {
                    myLeapApp.machine.callNextSeg('seg6');
                    myLeapApp.flow.distinct_count = 0;    // reset the count for further distinct interaction checking
                }
            }

        },
        onLeave: function() {
        }
    },
    seg2: {
        onEnter: function() {
            var uber = this;
            this.say('Oh ein Connaisseur. <br>Daumen hoch!');
            setTimeout(function() {
                uber.played_fns.on_enter = true;
                myLeapApp.machine.callNextSeg('seg9');
            }, 2300);
        },
        onGestureCheck: function(gesture_data, data) {
        },
        onLeave: function() {
        }
    },
    seg2a: {
        onEnter: function() {
            var uber = this;
            this.say('Das OK Zeichen! <br>Genial.');
            setTimeout(function() {
                uber.played_fns.on_enter = true;
                myLeapApp.machine.callNextSeg('seg9');
            }, 2000);
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
                // console.log("%c myLeapApp.flow.distinct_count", "background: #0D0B07; color: #FAFBFF", myLeapApp.flow.distinct_count);
                if (myLeapApp.flow.distinct_count > 6) {
                    myLeapApp.machine.callNextSeg('seg4');
                    myLeapApp.flow.distinct_count = 0;
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
                    myLeapApp.machine.callNextSeg('seg5');
                }, 3500);
            }, 3500);
        },
        onGestureCheck: function(gesture_data, data) {

        },
        onLeave: function() {
        }
    },
    seg5: {
        onEnter: function() {
            var uber = this;
            this.say('Ok. Halte Deine Hand mit der Handfläche nach unten.');
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
            this.say('Halte Deine Hand mit der Handfläche nach unten.');
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
    seg9: {
        onEnter: function() {
            this.say('Aber dann ist ja alles in Ordnung. Ich lass dich weiter rumprobieren.');
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


