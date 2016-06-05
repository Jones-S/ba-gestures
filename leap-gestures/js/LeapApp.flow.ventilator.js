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

    }
};


