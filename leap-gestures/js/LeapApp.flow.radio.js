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

var RADIOFLOW = {

    distinct_count:     0,
    radio_on:           false,
    initial_count:      {
                            on_off:     0,
                            next_prev:  0,
                            volume:     0
                        },




    doAlways: {
        onEnter: function() {
            this.played_fns.on_enter = true;
        },
        onGestureCheck: function(gesture_data, data) {
            if (this.try(gesture_data, 'swipe')) {
                if (gesture_data.swipe == 'right') {
                    myLeapApp.radio.nextTrack();
                    myLeapApp.sounder.play('next');
                    // set radio on flag to on
                    this.radio_on = true;
                    // myLeapApp.shiftr.publish('/radio', 'next-track');    // pubslih via shiftr.io
                    // myLeapApp.sounder.play('right'); // play on sound
                }
                else if(gesture_data.swipe == "left") {
                    myLeapApp.radio.previousTrack();
                    myLeapApp.sounder.play('prev');
                    this.radio_on = true;
                    // myLeapApp.shiftr.publish('/radio', 'prev-track');
                    // myLeapApp.sounder.play('left');
                }
            }
            else if(this.try(gesture_data, 'on')) {
                // myLeapApp.shiftr.publish('/radio', 'on');
                if (!this.radio_on) {
                    myLeapApp.sounder.play('on');
                }
                console.log("start playing");
                myLeapApp.radio.play();
                this.radio_on = true;

            }
            else if(this.try(gesture_data, 'off')) {
                if (this.radio_on) {
                    myLeapApp.sounder.play('off');
                }
                myLeapApp.radio.pause();
                this.radio_on = false;
            }
            else if (this.try(gesture_data, 'rotation')) {
                // send angle difference to radio to adjust volume
                myLeapApp.radio.setVolume(gesture_data.rotation);
                myLeapApp.sounder.play('vol');

            }
        },
        onLeave: function() {
        }

    },
    seg0: {
        onEnter: function() {
            this.played_fns.on_enter = true;
        },
        onGestureCheck: function(gesture_data, data) {
            var uber = this;
            var timer_started = false;

            if (this.try(gesture_data, 'interaction') && !timer_started) {
                timer_started = true;
                // start timer as soon as hands are visible
                setTimeout(function() {
                    // check for counts of interactions to determine how much help a user needs
                    if (   myLeapApp.flow.initial_count.volume >= 2
                        && myLeapApp.flow.initial_count.next_prev >= 2
                        && myLeapApp.flow.initial_count.on_off >= 3
                    ) {
                        // prolong the timer to say hello later
                        setTimeout(function() {
                            myLeapApp.machine.callNextSeg('seg4');
                        }, 8000);
                    }


                }, 20000);
            }

            if (this.try(gesture_data, 'rotation')) {
                // TODO: now counting all frames with rotation
                myLeapApp.flow.initial_count.volume++;
            }
            else if (this.try(gesture_data, 'on') || this.try(gesture_data, 'off')) {
                myLeapApp.flow.initial_count.on_off++;
            }
            else if (this.try(gesture_data, 'swipe') && (gesture_data.swipe == 'right' || gesture_data.swipe == 'left')) {
                myLeapApp.flow.initial_count.next_prev++;
            }

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


