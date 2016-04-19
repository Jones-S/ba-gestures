/**
 * Flow defines the interaction Flow in one object. For better code structure the whole flow
 * lies in it's own file.
 * Uses the HTML5 Audio controls with Javascript
 * Methods:
 * media.play(), media.pause(),
 * media.volume = value ( which is a fraction in the range 0.0 (silent) to 1.0 (loudest)),
 * media.muted
 * further information: http://w3c.github.io/html/single-page.html#playback-volume
 */

var INTERACTIONFLOW = {

    on_off_count: 0,    // save count and increase if on off
    distinct_count: 0,


    doAlways: {
        onEnter: function() {
            this.played_fns.on_enter = true;
        },
        onGestureCheck: function(gesture_data, data) {
            if (this.try(gesture_data, 'swipe')) {
                if (gesture_data.swipe == 'up') {
                    myLeapApp.shiftr.publish('/lamp', 'on');    // pubslih via shiftr.io
                    myLeapApp.sounder.play('on'); // play on sound
                    myLeapApp.flow.on_off_count++; // increase count off on/off interactions
                }
                else if(gesture_data.swipe == "down") {
                    myLeapApp.shiftr.publish('/lamp', 'off');
                    myLeapApp.sounder.play('off');
                    myLeapApp.flow.on_off_count++;
                }
            }
            else if(this.try(gesture_data, 'on')) {
                myLeapApp.shiftr.publish('/lamp', 'on');
                myLeapApp.sounder.play('on');
                myLeapApp.flow.on_off_count++;

            }
            else if(this.try(gesture_data, 'off')) {
                myLeapApp.sounder.play('off');
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
            if (myLeapApp.flow.on_off_count > 5) {
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
                uber.say('Ist alles in Ordnung, oder verstehst du etwas nicht?');
                setTimeout(function() {
                    uber.say('Gib mir doch ein Zeichen, ob alles OK ist oder nicht.');
                    // set flag that onEnter is finished playing
                    uber.played_fns.on_enter = true;
                }, 2500);
            }, 2000);
        },
        onGestureCheck: function(gesture_data, data) {
            if (this.try(gesture_data, 'thumb_up')) {
                myLeapApp.machine.callNextSeg('seg2');
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
                }, 2500);
            }, 2000);
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


