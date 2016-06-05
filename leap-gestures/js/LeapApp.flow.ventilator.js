var VENTILATORFLOW = {
    name: 'ventilator',

    doAlways: {
        onEnter: function() {
            this.played_fns.on_enter =  true;
            this.brightness = 100;
            this.running = false;

        },
        onGestureCheck: function(gesture_data, data) {
            var uber = this;
            if (this.try(gesture_data, 'start')) {
                myLeapApp.sounder.play('start');
            }

            if (this.try(gesture_data, 'exit')) {
                myLeapApp.sounder.play('exit');
            }

            if(this.try(gesture_data, 'on') && uber.running === false) {
                myLeapApp.shiftr.publish('/ventilator', 'on');
                myLeapApp.sounder.play('on');
                uber.running = true;
            }
            if(this.try(gesture_data, 'off') && uber.running === true) {
                myLeapApp.shiftr.publish('/ventilator', 'off');
                myLeapApp.sounder.play('off');
                uber.running = false;

            }
        },
        onLeave: function() {
        }

    }
};


