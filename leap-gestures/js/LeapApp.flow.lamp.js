/**
 * Flow defines the interaction Flow in one object. For better code structure the whole flow
 * lies in it's own file.
 */

var LAMPFLOW = {
    name: 'lamp',
    lamp_on: false,

    doAlways: {
        onEnter: function() {
            this.played_fns.on_enter =  true; // flag to say that onEnter was executed, so that onGestureCheck will execute
            this.brightness = 100;
            this.brightness_publish_count = 0;

        },
        onGestureCheck: function(gesture_data, data) {
            var uber = this;

            if (this.try(gesture_data, 'start')) {
                myLeapApp.sounder.play('start');
                console.log("in");
            }

            if (this.try(gesture_data, 'exit')) {
                myLeapApp.sounder.play('exit');
            }

            if(this.try(gesture_data, 'on') && myLeapApp.flow.lamp_on === false) {
                myLeapApp.shiftr.publish('/lamp', 'on');
                myLeapApp.sounder.play('on');
                myLeapApp.flow.lamp_on = true;
            }
            else if(this.try(gesture_data, 'off') && myLeapApp.flow.lamp_on === true) {
                myLeapApp.shiftr.publish('/lamp', 'off');
                myLeapApp.sounder.play('off');
                myLeapApp.flow.lamp_on = false;
            }

            // if lamp is on check y axis for dimming
            if (myLeapApp.flow.lamp_on) {
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


