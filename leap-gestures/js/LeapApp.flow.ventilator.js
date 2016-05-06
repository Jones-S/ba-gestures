var VENTILATORFLOW = {

    on_off_count: 0,    // save count and increase if on off
    distinct_count: 0,

    doAlways: {
        onEnter: function() {
            this.played_fns.on_enter =  true;
            this.flags = {
                venti_on:               false,
            };
            this.brightness = 100;
            this.brtn_plsh_count = 0;
            this.on_off_gesture = false; // container for saving the first on off gesture ['swipe' / 'explode']

        },
        onGestureCheck: function(gesture_data, data) {
            var uber = this;

            // check if swipe gesture was registered and if the inititial gesture was not explode
            if (this.try(gesture_data, 'swipe') && this.on_off_gesture != 'explode') {
                if (gesture_data.swipe == 'up') {
                    if (!this.flags.venti_on) {
                        // check if gesture option is set and on_off_gesture is not defined yet
                        if (myLeapApp.gesture_option && !this.on_off_gesture) {
                            // save first gesture if gesture option is set
                            this.on_off_gesture = 'swipe';
                            console.log("this.on_off_gesture: ", this.on_off_gesture);
                        }
                        myLeapApp.shiftr.publish('/venti', 'on');
                        myLeapApp.sounder.play('on');
                        // TODO replace flow.on_off_count with uber.on_off_count > save it into segment
                        // TODO: on off count only on the gesture, which was saved first
                        myLeapApp.flow.on_off_count++;
                        this.flags.venti_on = true;
                    }
                }
                else if(gesture_data.swipe == "down") {
                    if (this.flags.venti_on) {
                        if (myLeapApp.gesture_option && !this.on_off_gesture) {
                            // save first gesture
                            this.on_off_gesture = 'swipe';
                        }
                        myLeapApp.shiftr.publish('/venti', 'off');
                        myLeapApp.sounder.play('off');
                        myLeapApp.flow.on_off_count++;
                        this.flags.venti_on = false;
                    }
                }
            }
            else if(this.try(gesture_data, 'on') && this.on_off_gesture != 'swipe') {
                if (!this.flags.venti_on) {
                    if (myLeapApp.gesture_option && !this.on_off_gesture) {
                        // save first gesture
                        this.on_off_gesture = 'explode';
                        console.log("this.on_off_gesture: ", this.on_off_gesture);
                    }
                    myLeapApp.shiftr.publish('/venti', 'on');
                    myLeapApp.sounder.play('on');
                    myLeapApp.flow.on_off_count++;
                    this.flags.venti_on = true;
                }

            }
            else if(this.try(gesture_data, 'off') && this.on_off_gesture != 'swipe') {
                if (this.flags.venti_on) {
                    if (myLeapApp.gesture_option && !this.on_off_gesture) {
                        // save first gesture
                        this.on_off_gesture = 'explode';
                    }
                    myLeapApp.shiftr.publish('/venti', 'off');
                    myLeapApp.sounder.play('off');
                    myLeapApp.flow.on_off_count++;
                    this.flags.venti_on = false;
                }
            }
        },
        onLeave: function() {
        }

    },
    seg0: {
        onEnter: function() {
            var uber = this;
            uber.played_fns.on_enter = true;
            uber.interaction_count = 0;
        },

        onGestureCheck: function(gesture_data, data) {
            var uber = this;
            // count on and off events
            if (myLeapApp.flow.on_off_count > 13) {
                myLeapApp.machine.callNextSeg('seg1');
            }
            // start 'timer', which is just a frame count whenever a hand is in the interaction box
            if (uber.try(gesture_data, 'interaction')) {
                uber.interaction_count++; // add 1, -> counting frames of interaction
                if (uber.interaction_count > 4800) { // 4800frames = 1:20min with 60fps
                    myLeapApp.machine.callNextSeg('seg1a');
                }
            }
        },
        onLeave: function() {
        }
    },
    seg1: {
        onEnter: function() {
            var uber = this;
            // allow 'bad' line breakes. to disallow -> open .jshintrc file in the root of the folder and disable; multistr: false
            this.say('Du schaltest sehr oft ein und aus. \
                /nl Wenn Du etwas Hilfe bei der Bedienung brauchst, dann lass es mich durch eine bestätigende Geste wissen.');
            setTimeout(function() {
                // set flag that onEnter is finished playing
                uber.played_fns.on_enter = true;
            }, 6000);
        },
        onGestureCheck: function(gesture_data, data) {
            myLeapApp.machine.callNextSeg('seg1b');
        },
        onLeave: function() {
        }
    },
    seg1a: {
        onEnter: function() {
            var uber = this;
            this.say('Hallo, ist da Jemand? \
                /nl Brauchst du Hilfe bei der Bedienung? \
                /ln Dann lasse es mich durch eine bestätigende Geste wissen.');
            setTimeout(function() {
                // set flag that onEnter is finished playing
                uber.played_fns.on_enter = true;
            }, 6000);
        },
        onGestureCheck: function(gesture_data, data) {
            myLeapApp.machine.callNextSeg('seg1b');
        },
        onLeave: function() {
        }
    },
    seg1b: {
        onEnter: function() {
            var uber = this;
            // do nothing in the on enter, to let the last text remain on the screen
            uber.played_fns.on_enter = true;
            // set a counter to 0
            uber.distinct_count = 0;
        },
        onGestureCheck: function(gesture_data, data) {
            var uber = this;
            // check for different gestures
            if (this.try(gesture_data, 'thumb_up')) {
                myLeapApp.machine.callNextSeg('seg3');
            }
            else if (this.try(gesture_data, 'ok')) {
                myLeapApp.machine.callNextSeg('seg2');
            }
            else if (this.try(gesture_data, 'cancel')) {
                myLeapApp.machine.callNextSeg('seg3a');
            }
            else if (
                   (this.try(gesture_data, 'distinct_interaction'))
                || (this.try(gesture_data, 'swipe'))
                || (this.try(gesture_data, 'on'))
                || (this.try(gesture_data, 'off'))
            ) {
                uber.distinct_count++;
                // console.log("%c myLeapApp.flow.distinct_count", "background: #0D0B07; color: #FAFBFF", myLeapApp.flow.distinct_count);
                if (uber.distinct_count > 15) {
                    myLeapApp.machine.callNextSeg('seg8');
                }
            }
        },
        onLeave: function() {
        }
    },

    seg2: {
        onEnter: function() {
            var uber = this;
            this.say('Das OK-Zeichen. Gut dann werde ich Dir mal ein paar Tipps geben.');
            setTimeout(function() {
                uber.played_fns.on_enter = true;
            }, 4100);
        },
        onGestureCheck: function(gesture_data, data) {
            myLeapApp.machine.callNextSeg('seg4');
        },
        onLeave: function() {
        }
    },
    seg3: {
        onEnter: function() {
            var uber = this;
            this.say('Der gute alte Daumen… \
                /nl Dann gebe ich dir ein paar Tipps.');
            setTimeout(function() {
                uber.played_fns.on_enter = true;
            }, 4000);
        },
        onGestureCheck: function(gesture_data, data) {
            myLeapApp.machine.callNextSeg('seg4');
        },
        onLeave: function() {
        }
    },
    seg3a: {
        onEnter: function() {
            var uber = this;
            this.say('Ok, ich verstehe. Du lehnst ab und brauchst meine Hilfe nicht. \
                /nl Dann lasse ich Dich in Ruhe ;).');
        },
        onGestureCheck: function(gesture_data, data) {
        },
        onLeave: function() {
        }
    },
    seg4: {
        onEnter: function() {
            var uber = this;
            this.say('Um den Ventilator einzuschalten, halte deine Hand in den Interaktionsbereich. \
                /nl Du hörst einen Klang, sobald deine Hand in diesen Bereich eintritt oder ihn wieder verlässt.');
            setTimeout(function() {
                    uber.played_fns.on_enter = true;
            }, 11000);
        },
        onGestureCheck: function(gesture_data, data) {
            // check saved gesture from the beginning
            // if explode gesture was used
            if (this.on_off_gesture && this.on_off_gesture == 'explode') {
                myLeapApp.machine.callNextSeg('seg6');
            } else {
                myLeapApp.machine.callNextSeg('seg5');
            }

        },
        onLeave: function() {
        }
    },
    seg5: {
        onEnter: function() {
            var uber = this;
            uber.on_off_count = 0; // create a count

            this.say('Dann bewegst du deine mit einer raschen Bewegung von unten nach oben.\
                /nl Und ausschalten kannst du mit der umgekehrten Bewegung.');
            setTimeout(function() {
                uber.played_fns.on_enter = true;
            }, 1000);
        },
        onGestureCheck: function(gesture_data, data) {
            // count on off commands
            var uber = this;

            if (   (this.try(gesture_data, 'swipe'))
                && (this.on_off_gesture != 'explode')
                && ((gesture_data.swipe == 'up') || (gesture_data.swipe == 'down'))
            ){
                uber.on_off_count++;
            }
            else if (
                   (this.try(gesture_data, 'on') || this.try(gesture_data, 'on'))
                && (this.on_off_gesture != 'swipe')
            ){
                uber.on_off_count++;
            }

            if (uber.on_off_count >= 2) {
                myLeapApp.machine.callNextSeg('seg7');
            }

        },
        onLeave: function() {
        }
    },
    seg6: {
        onEnter: function() {
            var uber = this;
            uber.on_off_count = 0; // create a count

            this.say('Wenn der Ventilator aus ist, forme eine Faust mit Deiner Hand und strecke dann alle Finger aufs Mal aus. \
                /nl Um ihn wieder auszuschalten machst du die umgekehrte Bewegung. ');
            setTimeout(function() {
                uber.played_fns.on_enter = true;
            }, 1000);
        },
        onGestureCheck: function(gesture_data, data) {
            // count on off commands
            var uber = this;

            if (   (this.try(gesture_data, 'swipe'))
                && (this.on_off_gesture != 'explode')
                && ((gesture_data.swipe == 'up') || (gesture_data.swipe == 'down'))
            ){
                uber.on_off_count++;
            }
            else if (
                   (this.try(gesture_data, 'on') || this.try(gesture_data, 'on'))
                && (this.on_off_gesture != 'swipe')
            ){
                uber.on_off_count++;
            }

            if (uber.on_off_count >= 2) {
                myLeapApp.machine.callNextSeg('seg7');
            }

        },
        onLeave: function() {
        }
    },
    seg7: {
        onEnter: function() {
            this.say('Gar nicht so schwer, oder? \
                /nl Du beherrschst jetzt alle Gesten.');
        },
        onGestureCheck: function(gesture_data, data) {

        },
        onLeave: function() {
        }
    },
    seg8: {
        onEnter: function() {
            this.say('Ich sehe Dein Bemühen, weiss aber nicht, ob das «Ja» bedeutet. \
                /nl Wenn Du Hilfe brauchst, halte doch den Daumen hoch. \
                /nl (Halte Deine Hand dabei aber leicht schräg. Leider sieht mein Sensor Deine Hand nur von unten).');
            setTimeout(function() {
                uber.played_fns.on_enter = true;
            }, 9000);
        },
        onGestureCheck: function(gesture_data, data) {
            var uber = this;
            // check for different gestures
            if (this.try(gesture_data, 'thumb_up')) {
                myLeapApp.machine.callNextSeg('seg3');
            }
            else if (this.try(gesture_data, 'cancel')) {
                myLeapApp.machine.callNextSeg('seg3a');
            }
            else if (
                   (this.try(gesture_data, 'distinct_interaction'))
                || (this.try(gesture_data, 'swipe'))
                || (this.try(gesture_data, 'on'))
                || (this.try(gesture_data, 'off'))
            ) {
                uber.distinct_count++;
                // console.log("%c myLeapApp.flow.distinct_count", "background: #0D0B07; color: #FAFBFF", myLeapApp.flow.distinct_count);
                if (uber.distinct_count > 10) {
                    myLeapApp.machine.callNextSeg('seg9');
                }
            }
        },
        onLeave: function() {
        }
    },
    seg9: {
        onEnter: function() {
            this.say('Daumen hoch: «OK»,\
                /nl Hand zu Faust formen: «Ventilator aus» \
                /nl Von Faust alle Finger ausstrecken: «Ventilator an»');
            setTimeout(function() {
                uber.played_fns.on_enter = true;
            }, 3000);
        },
        onGestureCheck: function(gesture_data, data) {
            var uber = this;

            if (   (this.try(gesture_data, 'swipe'))
                && (this.on_off_gesture != 'explode')
                && ((gesture_data.swipe == 'up') || (gesture_data.swipe == 'down'))
            ){
                uber.on_off_count++;
            }
            else if (
                   (this.try(gesture_data, 'on') || this.try(gesture_data, 'on'))
                && (this.on_off_gesture != 'swipe')
            ){
                uber.on_off_count++;
            }

            if (uber.on_off_count >= 3) {
                myLeapApp.machine.callNextSeg('seg10');
            }
        },
        onLeave: function() {
        }
    },
    seg10: {
        onEnter: function() {
            this.say('Ok, ich glaube es ist nun alles klar. Mehr als ein- und ausschalten geht nicht.');
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


