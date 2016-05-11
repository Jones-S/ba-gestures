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

    radio_on:           false,
    timer_started:      false,
    initial_count:      {
                            on_off:     0,
                            next_prev:  0,
                            volume:     0
                        },
    // object to hold information which of the gestures were found without help
    without_help:       {
                            on_off:     false,
                            next_prev:  false,
                            volume:     false
                        },




    doAlways: {
        onEnter: function() {
            this.played_fns.on_enter = true;
        },
        onGestureCheck: function(gesture_data, data) {
            // play hover sound for new hands
            if (this.try(gesture_data, 'start')) {
                myLeapApp.sounder.play('start');
            }
            if (this.try(gesture_data, 'exit')) {
                myLeapApp.sounder.play('exit');
            }
            if (this.try(gesture_data, 'swipe')) {
                if (gesture_data.swipe == 'right') {
                    myLeapApp.radio.pause();
                    myLeapApp.sounder.play('next');
                    setTimeout(function(){
                        myLeapApp.radio.nextTrack();
                    }, 400);
                    // set radio on flag to on
                    this.radio_on = true;
                    // myLeapApp.shiftr.publish('/radio', 'next-track');    // pubslih via shiftr.io
                    // myLeapApp.sounder.play('right'); // play on sound
                }
                else if(gesture_data.swipe == "left") {
                    myLeapApp.radio.pause();
                    myLeapApp.sounder.play('prev');
                    setTimeout(function(){
                        myLeapApp.radio.previousTrack();
                    }, 400);
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
                // wait a bit before playing
                setTimeout(function(){
                    myLeapApp.radio.play();
                }, 400);
                this.radio_on = true;

            }
            else if(this.try(gesture_data, 'off')) {
                if (this.radio_on) {
                    myLeapApp.sounder.play('off');
                }
                myLeapApp.radio.pause();
                this.radio_on = false;
            }
            // else if (this.try(gesture_data, 'rotation')) {
            //     // only change volume when grabbing and the rotation gesture is true as well
            //     if (gesture_data.rotation.grabbing && gesture_data.rotation.rotation_gesture) {
            //         console.log("gesture_data.rotation.duration: ", gesture_data.rotation.duration);

            //         // send angle difference to radio to adjust volume
            //         myLeapApp.radio.setVolume(gesture_data.rotation);
            //     }
            //     if (gesture_data.rotation.finish_rotation) {
            //         myLeapApp.sounder.play('dock_off');
            //     }
            //     // play sound only at first
            //     if (gesture_data.rotation.new_rotation) {
            //         myLeapApp.sounder.play('dock_on');
            //     }
            // }
            else if (this.try(gesture_data, 'vol_adjust')) {
                // if adjusting volume then map y-axis to volume
                console.log("%c vol adjust", "background: #FDD187; color: #DA5C1B");

                // check for hands first, because when hand left
                if (!(this.try(gesture_data, 'exit'))) {
                    // y-Axis range 120mm – 420mm
                    // mapping this to volume (0.1 - 1.0)
                    var y_axis = data.hands[0].palmPosition[1];
                    this.volume = y_axis.map(120, 420, 0.1, 1.0);
                    this.volume = (this.volume < 0.1) ? 0.1 : this.volume; // 0.1 is minimum
                    this.volume = (this.volume > 1) ? 1 : this.volume; // 1 maximum
                    console.log("this.volume: ", this.volume);
                    // send volume to radio module to adjust volume
                    myLeapApp.radio.setVolumeYAxis(this.volume);
                }

            }
            // // if radio is on check y axis for volume
            // if (this.radio_on) {
            //     // set current position of hand to current brightness
            //     if (data.hands.length === 1) {
            //         // y-Axis range 120mm – 420mm
            //         // mapping this to volume (0.1 - 1.0)
            //         var y_axis = data.hands[0].palmPosition[1];
            //         this.volume = y_axis.map(120, 420, 0.1, 1.0);
            //         this.volume = (this.volume < 0.1) ? 0.1 : this.volume; // 0.1 is minimum
            //         this.volume = (this.volume > 1) ? 1 : this.volume; // 1 maximum
            //         console.log("this.volume: ", this.volume);
            //         // send volume to radio module to adjust volume
            //         myLeapApp.radio.setVolumeYAxis(this.volume);

            //     }

            // }

        },
        onLeave: function() {
        }

    },
    seg0: {
        onEnter: function() {
            this.played_fns.on_enter = true;
            this.timer_started = false;
            this.new_rotation = false;
            this.new_volume = false;
        },
        onGestureCheck: function(gesture_data, data) {
            var uber = this;

            if (this.try(gesture_data, 'interaction') && !uber.timer_started) {
                uber.timer_started = true;
                // start timer as soon as hands are visible
                setTimeout(function() {
                    // check for counts of interactions to determine how much help a user needs
                    if (   myLeapApp.flow.initial_count.volume >= 2
                        && myLeapApp.flow.initial_count.next_prev >= 2
                        && myLeapApp.flow.initial_count.on_off >= 3
                    ) {
                        // set all flags to true
                        for (var prop in myLeapApp.flow.without_help) {
                            // skip loop if the property is from prototype
                            if(!myLeapApp.flow.without_help.hasOwnProperty(prop)) { continue; }
                            myLeapApp.flow.without_help[prop] = true;
                        }
                        // prolong the timer to say hello later
                        setTimeout(function() {
                            myLeapApp.machine.callNextSeg('seg4');
                        }, 8000);
                    }

                    else if (
                          myLeapApp.flow.initial_count.on_off >= 3
                       && myLeapApp.flow.initial_count.next_prev >= 2
                    ) {
                        // set flags for later segments
                        myLeapApp.flow.without_help.on_off = true;
                        myLeapApp.flow.without_help.next_prev = true;
                        myLeapApp.machine.callNextSeg('seg2');
                    }

                    else if (myLeapApp.flow.initial_count.on_off >= 3) {
                        // set flags for later segments
                        myLeapApp.flow.without_help.on_off = true;
                        myLeapApp.machine.callNextSeg('seg3');
                    }

                    else if (myLeapApp.flow.initial_count.next_prev >= 2) {
                        // set flags for later segments
                        myLeapApp.flow.without_help.next_prev = true;
                        myLeapApp.machine.callNextSeg('seg3a');
                    }

                    else {
                        myLeapApp.machine.callNextSeg('seg1');
                    }
                }, 20000);
            }

            // dont use rotation grab anymore

            // if (this.try(gesture_data, 'rotation')) {
            //     // check if new rotation
            //     if (gesture_data.rotation.new_rotation) {
            //         // set flag for the time the rotation is on
            //         uber.new_rotation = true;
            //     }
            //     // check if the gesture is made for sufficient time
            //     if (uber.new_rotation && gesture_data.rotation.duration > 30) {
            //         myLeapApp.flow.initial_count.volume++;
            //         // reset flag
            //         uber.new_rotation = false;
            //     }
            //     // also increase count if the gesture is made for a long time
            //     if (gesture_data.rotation.duration == 200) {
            //         myLeapApp.flow.initial_count.volume++;
            //     }
            // }

            if (this.try(gesture_data, 'vol_adjust') && !uber.new_volume) {
                uber.new_volume = true;
                myLeapApp.flow.initial_count.volume++;
                console.log("myLeapApp.flow.initial_count.volume: ", myLeapApp.flow.initial_count.volume);
            } else if (!this.try(gesture_data, 'vol_adjust')) {
                uber.new_volume = false;
            }

            if (this.try(gesture_data, 'on') || this.try(gesture_data, 'off')) {
                myLeapApp.flow.initial_count.on_off++;
            }

            if (this.try(gesture_data, 'swipe') && (gesture_data.swipe == 'right' || gesture_data.swipe == 'left')) {
                myLeapApp.flow.initial_count.next_prev++;
                console.log("myLeapApp.flow.initial_count.next_prev: ", myLeapApp.flow.initial_count.next_prev);
            }

        },
        onLeave: function() {
        }
    },
    seg1: {
        onEnter: function() {
            var uber = this;
            this.say('Hey Grünschnabel. :)<br>Probier doch noch ein wenig aus! /nl Ein paar generelle Tipps vorweg:<br>Führe Bewegungen langsam und bestimmt aus und höre dabei auf Klänge. Diese geben dir Auskunft, ob und welche Aktion gerade ausgeführt wird.');
            // prolong the timer to say hello later
            setTimeout(function() {
                uber.played_fns.on_enter = true;
            }, 2500);
        },
        onGestureCheck: function(gesture_data, data) {
            myLeapApp.machine.callNextSeg('seg0');
        },
        onLeave: function() {
        }
    },
    seg2: {
        onEnter: function() {
            var uber = this;
            uber.say('Du scheinst sehr versiert zu sein, mit dem Umgang des Musikplayers. /nl Zusätzlich zum Ein- und Ausschalten und dem Wechseln der Lieder gibt es auch eine Geste, um die Lautstärke zu verändern.');
            setTimeout(function() {
                uber.played_fns.on_enter = true;
            }, 12000);
        },
        onGestureCheck: function(gesture_data, data) {
            myLeapApp.machine.callNextSeg('seg5');
        },
        onLeave: function() {
        }
    },
    seg3: {
        onEnter: function() {
            var uber = this;
            uber.say('Ich habe bemerkt, dass Du den Musikplayer ein- und ausgeschaltet hast.<br> Es gibt jedoch noch mehr Gesten, um diesen Musikplayer zu steuern. <br>Du kannst die Lieder wechseln und die Lautstärke einstellen.');
            setTimeout(function() {
                uber.played_fns.on_enter = true;
            }, 14000);
        },
        onGestureCheck: function(gesture_data, data) {
            myLeapApp.machine.callNextSeg('seg5');
        },
        onLeave: function() {
        }
    },
    seg3a: {
        onEnter: function() {
            var uber = this;
            uber.say('Lieder wechseln kannst du ja bereits.<br>Zusätzlich kannst du auch ein- und ausschalten <br>sowie die Lautstärke verstellen.');
            setTimeout(function() {
                uber.played_fns.on_enter = true;
            }, 9500);
        },
        onGestureCheck: function(gesture_data, data) {
            myLeapApp.machine.callNextSeg('seg5');
        },
        onLeave: function() {
        }
    },
    seg4: {
        onEnter: function() {
            var uber = this;
            uber.say('Salut. Ich wollte nur kurz «Hallo» sagen.');
            setTimeout(function() {
                uber.say('Grossartig wie du alle Gesten schon kennst!');
                    uber.played_fns.on_enter = true;
            }, 3500);        },
        onGestureCheck: function(gesture_data, data) {

        },
        onLeave: function() {
        }
    },
    seg5: {
        onEnter: function() {
            var uber = this;
            // set a counter to 0 to count interactions later on
            uber.distinct_count = 0;
            uber.say('Ich würde Dir nun ein paar Tipps geben.<br>Gib mir doch ein Zeichen, falls das das OK is, oder falls du die Hilfe abbrechen und selber noch weiterprobieren willst?');
                setTimeout(function() {
                    uber.played_fns.on_enter = true;
                }, 1200);
        },
        onGestureCheck: function(gesture_data, data) {
            var uber = this;
            if (this.try(gesture_data, 'ok')) {
                myLeapApp.machine.callNextSeg('seg6');
            }
            else if (this.try(gesture_data, 'thumb_up')) {
                myLeapApp.machine.callNextSeg('seg7');
            }
            else if (this.try(gesture_data, 'cancel')) {
                myLeapApp.machine.callNextSeg('seg8');
            }
            else if (
                   (this.try(gesture_data, 'distinct_interaction'))
                || (this.try(gesture_data, 'rotation') && (gesture_data.rotation.grabbing))
                || (this.try(gesture_data, 'swipe'))
                || (this.try(gesture_data, 'off'))
                || (this.try(gesture_data, 'on'))
            ) {
                uber.distinct_count++;
                console.log("uber.distinct_count: ", uber.distinct_count);
                if (uber.distinct_count > 12) {
                    myLeapApp.machine.callNextSeg('seg16');
                }
            }
        },
        onLeave: function() {
        }
    },
    seg6: {
        onEnter: function() {
            var uber = this;
            uber.say('Das OK-Zeichen ist auch mein Favorit.');
            setTimeout(function() {
                uber.played_fns.on_enter = true;
            }, 3000);
        },
        onGestureCheck: function(gesture_data, data) {
            myLeapApp.machine.callNextSeg('seg8a');
        },
        onLeave: function() {
        }
    },
    seg7: {
        onEnter: function() {
            var uber = this;
            uber.say('Gut, die «Daumen-Hoch»-Geste scheint bekannt zu sein.');
            setTimeout(function() {
                uber.say('Dann zu den Tipps.');
                setTimeout(function() {
                    uber.played_fns.on_enter = true;
                }, 3000);
            }, 4000);
        },
        onGestureCheck: function(gesture_data, data) {
            myLeapApp.machine.callNextSeg('seg8a');
        },
        onLeave: function() {
        }
    },
    seg8: {
        onEnter: function() {
            var uber = this;
            uber.say('Dann lasse ich dich noch ein wenig probieren.');
            setTimeout(function() {
                uber.say('Falls du doch Hilfe brauchen solltest, swipe 3 mal nach oben, um mich zu rufen. (Kommentar: Geht noch nicht)');
                    uber.played_fns.on_enter = true;
            }, 4000);
        },
        onGestureCheck: function(gesture_data, data) {
            //TODO: check for 3 swipes up
        },
        onLeave: function() {
        }
    },

    // check variables and get correspondig elements
    seg8a: {
        onEnter: function() {
            this.played_fns.on_enter = true;
        },
        onGestureCheck: function(gesture_data, data) {
            var uber = this;
            // only on/off
            if (myLeapApp.flow.without_help.on_off && !myLeapApp.flow.without_help.next_prev && !myLeapApp.flow.without_help.volume) {
                myLeapApp.machine.callNextSeg('seg9');
            }
            // swipe and on/off
            else if (myLeapApp.flow.without_help.next_prev && myLeapApp.flow.without_help.on_off && !myLeapApp.flow.without_help.volume) {
                myLeapApp.machine.callNextSeg('seg12');
            }
            // only swipe
            else if (myLeapApp.flow.without_help.next_prev && !myLeapApp.flow.without_help.volume && !myLeapApp.flow.without_help.on_off) {
                myLeapApp.machine.callNextSeg('seg17');
            }
        },
        onLeave: function() {
        }
    },
    seg9: {
        onEnter: function() {
            var uber = this;
            uber.say('Um ein Lied zu wechseln, swipe doch von links nach rechts oder umgekehrt.');
            uber.played_fns.on_enter = true;
            uber.timer_started = false;
            uber.swipe_count = 0;
        },
        onGestureCheck: function(gesture_data, data) {
            var uber = this;
            if (this.try(gesture_data, 'swipe') && (gesture_data.swipe == 'right' || gesture_data.swipe == "left")) {
                uber.swipe_count++;
                if (uber.swipe_count > 2) {
                    // clear timeout
                    clearTimeout(uber.timer);
                    myLeapApp.machine.callNextSeg('seg10');
                }
            }
            else if (!uber.timer_started) {
                uber.timer_started = true;
                uber.timer = setTimeout(function() {
                    myLeapApp.machine.callNextSeg('seg11');
                }, 18000);
            }
        },
        onLeave: function() {
        }
    },
    seg10: {
        onEnter: function() {
            var uber = this;
            this.say('Perfekt.<br>Die Lautstärke wechselst du mit einem imaginären Drehknopf.');
            setTimeout(function() {
                uber.played_fns.on_enter = true;
            }, 4500);
        },
        onGestureCheck: function(gesture_data, data) {
            myLeapApp.machine.callNextSeg('seg13');
        },
        onLeave: function() {
        }
    },
    seg11: {
        onEnter: function() {
            var uber = this;
            uber.swipe_count = 0;
            this.say('Öffne deine Hand und imitiere eine Ohrfeige.');
            setTimeout(function() {
                uber.played_fns.on_enter = true;
            }, 4500);
        },
        onGestureCheck: function(gesture_data, data) {
            var uber = this;
            if (this.try(gesture_data, 'swipe') && (gesture_data.swipe == 'right' || gesture_data.swipe == "left")) {
                uber.swipe_count++;
                if (uber.swipe_count > 3) {
                    myLeapApp.machine.callNextSeg('seg10');
                }
            }
        },
        onLeave: function() {
        }
    },
    seg12: {
        onEnter: function() {
            var uber = this;
            this.say('Um die Lautstärke zu ändern, denke doch mal an einen klassischen Drehknopf.');
            setTimeout(function() {
                uber.played_fns.on_enter = true;
            }, 4400);
        },
        onGestureCheck: function(gesture_data, data) {
            myLeapApp.machine.callNextSeg('seg13');
        },
        onLeave: function() {
        }
    },
    seg13: {
        onEnter: function() {
            var uber = this;
            uber.say('Am besten hörst du es, wenn ein Lied abgespielt wird.');
            uber.played_fns.on_enter = true;
            uber.timer_started = false;
            uber.rotation_count = 0;
        },
        onGestureCheck: function(gesture_data, data) {
            var uber = this;
            if (this.try(gesture_data, 'rotation') && (gesture_data.rotation.grabbing)) {
                // count the frames for the rotation duration
                uber.rotation_count++;
                // TODO: rather check for minimal volume change
                if (uber.rotation_count >= 100) { // 100 frames, ~1.5s
                    // clear timer
                    clearTimeout(uber.timer);
                    // check if song is playing, then go to 14
                    if (myLeapApp.radio.isPlaying()) {
                        console.log("yes sound on");
                        myLeapApp.machine.callNextSeg('seg14');
                    } else {
                        myLeapApp.machine.callNextSeg('seg14a');
                    }
                }
            }
            else if (!uber.timer_started) {

                uber.timer_started = true;
                // set a new variable for the timer uber.timer holds the timeout Id
                uber.timer = setTimeout(function() {

                    myLeapApp.machine.callNextSeg('seg15');
                }, 13000);
            }

        },
        onLeave: function() {
        }
    },
    seg14: {
        onEnter: function() {
            this.say('Ausgezeichnet. <br>Du beherrschst nun den Musikplayer.');
        },
        onGestureCheck: function(gesture_data, data) {
        },
        onLeave: function() {
        }
    },
    seg14a: {
        onEnter: function() {
            var uber = this;
            uber.say('Spiel doch mal ein Lied ab, damit du den Unterschied hörst.');
            uber.played_fns.on_enter = true;
            uber.rotation_count = 0;
        },
        onGestureCheck: function(gesture_data, data) {
            var uber = this;
            if (this.try(gesture_data, 'rotation') && (gesture_data.rotation.grabbing)) {
                if (myLeapApp.radio.isPlaying()) {
                    // count frames when song i playing
                    uber.rotation_count++;
                    // TODO: rather check for minimal volume change
                    if (uber.rotation_count >= 100) { // 100 frames, ~1.5s
                    // check if song is playing, then go to 14
                        myLeapApp.machine.callNextSeg('seg14');
                    }
                }
            }


        },
        onLeave: function() {
        }
    },
    seg15: {
        onEnter: function() {
            var uber = this;
            uber.rotation_count = 0;
            uber.say('Umfasse mit allen Fingern einen unsichtbaren Drehknopf der Grösse eines Fünf-Franken-Stückes.<br>Bei der richtigen Geste hörst du ein Klicken.<br>Drehe dann deine Hand nach rechts oder nach links.');
            setTimeout(function() {
                uber.played_fns.on_enter = true;
            }, 12000);
        },
        onGestureCheck: function(gesture_data, data) {
            var uber = this;

            if (this.try(gesture_data, 'rotation') && (gesture_data.rotation.grabbing)) {
                // count the frames for the rotation duration
                uber.rotation_count++;
                console.log("uber.rotation_count: ", uber.rotation_count);
                // TODO: rather check for minimal volume change
                if (uber.rotation_count >= 100) { // 100 frames, ~1.5s
                    // check if song is playing, then go to 14
                    if (myLeapApp.radio.isPlaying()) {
                        myLeapApp.machine.callNextSeg('seg14');
                    } else {
                        myLeapApp.machine.callNextSeg('seg14a');
                    }
                }
            }
        },
        onLeave: function() {
        }
    },

    seg16: {
        onEnter: function() {
            var uber = this;
            this.say('Ich verstehe leider deine Zeichen nicht.<br>Falls alles Ok ist, halt doch deinen Daumen hoch.<br>Falls nicht, schüttle Deine Hand, als würdest Du etwas ablehnen.<br>(Daumen etwas schräg halten)');
            setTimeout(function() {
                uber.played_fns.on_enter = true;
            }, 9400);
        },
        onGestureCheck: function(gesture_data, data) {
            if (this.try(gesture_data, 'thumb_up')) {
                myLeapApp.machine.callNextSeg('seg7');
            }
            else if (this.try(gesture_data, 'ok')) {
                myLeapApp.machine.callNextSeg('seg6');
            }
            else if (this.try(gesture_data, 'cancel')) {
                myLeapApp.machine.callNextSeg('seg8');
            }
        },
        onLeave: function() {
        }
    },

    seg17: {
        onEnter: function() {
            var uber = this;
            uber.on_off_count = 0;
            uber.timer_started = false;

            this.say('Dann beginnen wir doch mit dem Ein- und Ausschalten. \
                /nl Strecke deine Finger aus und forme dann schnell eine Faust. Damit schaltest du ein Lied aus. \
                /nl Um es wieder einzuschalten, öffne deine Hand, so dass alle Finger gestreckt sind.');
            setTimeout(function() {
                uber.played_fns.on_enter = true;
            }, 6000);
        },
        onGestureCheck: function(gesture_data, data) {
            var uber = this;
            if (this.try(gesture_data, 'on') || this.try(gesture_data, 'off')) {
                uber.on_off_count++;
                if (uber.on_off_count > 2) {
                    // clear timeout
                    clearTimeout(uber.timer);
                    myLeapApp.machine.callNextSeg('seg10');
                }
            }
            else if (!uber.timer_started) {
                uber.timer_started = true;
                uber.timer = setTimeout(function() {
                    myLeapApp.machine.callNextSeg('seg18');
                }, 18000);
            }
        },
        onLeave: function() {
        }
    },

    seg18: {
        onEnter: function() {
            var uber = this;
            uber.on_off_count = 0;
            this.say('Handfläche nach unten und dann entweder alle Finger ausstrecken (Einschalten) oder eine Faust formen (Ausschalten).\
                /nl Führe es doch ein paar Mal aus, damit ich sehe, dass es für dich klar ist.');
            setTimeout(function() {
                uber.played_fns.on_enter = true;
            }, 8000);
        },
        onGestureCheck: function(gesture_data, data) {
            var uber = this;
                if (this.try(gesture_data, 'on') || this.try(gesture_data, 'off')) {
                    uber.on_off_count++;
                    if (uber.on_off_count > 3) {
                        myLeapApp.machine.callNextSeg('seg10');
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


