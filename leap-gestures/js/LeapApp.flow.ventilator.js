var VENTILATORFLOW = {
    name: 'ventilator',
    ventilator_on: false,

    doAlways: {
        onEnter: function() {
            this.played_fns.on_enter =  true;
            this.brightness = 100;

        },
        onGestureCheck: function(gesture_data, data) {
            var uber = this;
            if (this.try(gesture_data, 'start')) {
                myLeapApp.sounder.play('start');
            }

            if (this.try(gesture_data, 'exit')) {
                myLeapApp.sounder.play('exit');
            }

            if(this.try(gesture_data, 'on') && myLeapApp.flow.ventilator_on === false) {
                myLeapApp.shiftr.publish('/ventilator', 'on');
                myLeapApp.sounder.play('on');
                myLeapApp.flow.ventilator_on = true;
            }
            if(this.try(gesture_data, 'off') && myLeapApp.flow.ventilator_on === true) {
                myLeapApp.shiftr.publish('/ventilator', 'off');
                myLeapApp.sounder.play('off');
                myLeapApp.flow.ventilator_on = false;

            }
        },
        onLeave: function() {
        }

    }
};


