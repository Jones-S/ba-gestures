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
    timer_started:      false,
    initial_count:      {
                            on_off:     0,
                            next_prev:  0,
                            volume:     0
                        },
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
                if (gesture_data.rotation.grabbing) {
                    // send angle difference to radio to adjust volume
                    myLeapApp.radio.setVolume(gesture_data.rotation);
                } else {
                    myLeapApp.sounder.sound_vol.stop();
                }
                // play sound only at first
                // or when sound is done
                if (gesture_data.rotation.new_rotation) {
                    myLeapApp.sounder.play('vol');
                }
            }

        },
        onLeave: function() {
        }

    },
    seg0: {
        onEnter: function() {
            this.played_fns.on_enter = true;
            this.timer_started = false;
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

            if (this.try(gesture_data, 'rotation')) {
                if (gesture_data.rotation.new_rotation) {
                    myLeapApp.flow.initial_count.volume++;
                }
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
            this.say('Hey Grünschnabel.<br>Alles klar?');
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
            uber.say('Du scheinst sehr versiert zu sein, mit dem Umgang des Musikplayers.');
            setTimeout(function() {
                uber.say('Zusätzlich zum Ein- und Ausschalten und dem Wechseln der Lieder gibt es auch eine Geste, um die Lautstärke zu verändern.');
                setTimeout(function() {
                    uber.played_fns.on_enter = true;
                }, 5500);
            }, 3300);
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
            uber.say('Ich habe bemerkt, dass Du den Musikplayer ein- und ausgeschaltet hast.');
            setTimeout(function() {
                uber.say('Wusstest Du, dass es noch mehr Gesten gibt, um dieses Gerät zu steuern?');
                setTimeout(function() {
                    uber.say('Du kannst die Lieder wechseln und die Lautstärke einstellen.');
                    setTimeout(function() {
                        uber.played_fns.on_enter = true;
                    }, 2400);
                }, 4200);
            }, 4700);
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
            uber.say('Lieder wechseln kannst du ja bereits.');
            setTimeout(function() {
                uber.say('Zusätzlich kannst du auch ein- und ausschalten <br>sowie die Lautstärke verstellen.');
                setTimeout(function() {
                    uber.played_fns.on_enter = true;
                }, 3100);
            }, 2300);
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
            }, 2300);        },
        onGestureCheck: function(gesture_data, data) {

        },
        onLeave: function() {
        }
    },
    seg5: {
        onEnter: function() {
            var uber = this;
            uber.say('Ich würde Dir nun ein paar Tipps geben.');
            setTimeout(function() {
                uber.say('Ist das OK, oder willst du abbrechen und noch selber etwas weiterprobieren? Gib mir doch ein Zeichen');
                setTimeout(function() {
                    uber.played_fns.on_enter = true;
                }, 2100);
            }, 5300);
        },
        onGestureCheck: function(gesture_data, data) {
            if (this.try(gesture_data, 'ok')) {
                myLeapApp.machine.callNextSeg('seg6');
            }
            else if (this.try(gesture_data, 'thumb_up')) {
                myLeapApp.machine.callNextSeg('seg7');
            }
            else if (this.try(gesture_data, 'cancel')) {
                myLeapApp.machine.callNextSeg('seg8');
            }
            else if (this.try(gesture_data, 'distinct_interaction')) {
                myLeapApp.flow.distinct_count++;
                if (myLeapApp.flow.distinct_count > 10) {
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
            }, 1900);
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
                }, 1500);
            }, 2000);
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
                uber.say('Falls du doch Hilfe brauchen solltest, swipe 3 mal nach oben, um mich zu rufen.');
                    uber.played_fns.on_enter = true;
            }, 2000);
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
            if (myLeapApp.flow.without_help.next_prev === false) {
                myLeapApp.machine.callNextSeg('seg9');
            }
            else if (myLeapApp.flow.without_help.next_prev && myLeapApp.flow.without_help.volume === false) {
                myLeapApp.machine.callNextSeg('seg12');
            }
        },
        onLeave: function() {
        }
    },
    seg9: {
        onEnter: function() {
            this.say('Um ein Lied zu wechseln, swipe doch von links nach rechts oder umgekehrt.');
            uber.played_fns.on_enter = true;
            uber.timer_started = false;
        },
        onGestureCheck: function(gesture_data, data) {
            var uber = this;
            if (this.try(gesture_data, 'swipe' && (gesture_data.swipe == 'right' || gesture_data.swipe == "left"))) {
                myLeapApp.machine.callNextSeg('seg10');
            }
            else if (!uber.timer_started) {
                uber.timer_started = true;
                setTimeout(function() {
                    myLeapApp.machine.callNextSeg('seg11');
                }, 10000);
            }
        },
        onLeave: function() {
        }
    },
    seg10: {
        onEnter: function() {
            this.say('Perfekt.<br>Die Lautstärke wechselst du mit einem imaginären Drehknopf.');
            setTimeout(function() {
                uber.played_fns.on_enter = true;
            }, 2500);
        },
        onGestureCheck: function(gesture_data, data) {
            myLeapApp.machine.callNextSeg('seg13');
        },
        onLeave: function() {
        }
    },
    seg11: {
        onEnter: function() {
            this.say('Öffne deine Hand und imitiere eine Ohrfeige.');
            setTimeout(function() {
                uber.played_fns.on_enter = true;
            }, 2500);
        },
        onGestureCheck: function(gesture_data, data) {
            if (this.try(gesture_data, 'swipe' && (gesture_data.swipe == 'right' || gesture_data.swipe == "left"))) {
                myLeapApp.machine.callNextSeg('seg10');
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
            }, 2900);
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
        },
        onGestureCheck: function(gesture_data, data) {
            var uber = this;
            if (this.try(gesture_data, 'rotation') && (gesture_data.rotation.grabbing)) {
                console.log("%c go to 14", "background: #0D0B07; color: #FAFBFF");
                myLeapApp.machine.callNextSeg('seg14');
                // clear timer
                console.log("timer vor clear: ", uber.timer);
                clearTimeout(uber.timer);
            }
            else if (!uber.timer_started) {
                console.log("%c Timer set", "background: #0D0B07; color: #FAFBFF");

                uber.timer_started = true;
                // set a new variable for the timer uber.timer holds the timeout Id
                uber.timer = setTimeout(function() {
                    console.log("%c timerli ended", "background: #0D0B07; color: #FAFBFF");

                    myLeapApp.machine.callNextSeg('seg15');
                }, 13000);
                console.log("timer just set: ", uber.timer);
            }

        },
        onLeave: function() {
        }
    },
    seg14: {
        onEnter: function() {
            this.say('Ausgezeichnet. <br>Du beherrscht nun den Musikplayer.');
        },
        onGestureCheck: function(gesture_data, data) {
        },
        onLeave: function() {
        }
    },
    seg15: {
        onEnter: function() {
            var uber = this;
            uber.say('Umfasse mit allen Fingern einen unsichtbaren Drehknopf der Grösse eines Fünf-Franken-Stückes.');
            setTimeout(function() {
                uber.say('Bei der richtigen Geste hörst du ein Klicken.');
                setTimeout(function() {
                    uber.say('Drehe dann deine Hand nach rechts oder nach links.');
                    setTimeout(function() {
                        uber.played_fns.on_enter = true;
                    }, 2400);
                }, 2600);
            }, 3200);
        },
        onGestureCheck: function(gesture_data, data) {
            if (this.try(gesture_data, 'rotation')) {
                myLeapApp.machine.callNextSeg('seg14');
            }
        },
        onLeave: function() {
        }
    },























    seg16: {
        onEnter: function() {
            var uber = this;
            this.say('Ich verstehe leider deine Zeichen nicht.');
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


