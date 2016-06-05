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

    }
};


