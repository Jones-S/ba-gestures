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
    name: 'radio',
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
            var uber = this;
            // play hover sound for new hands
            if (this.try(gesture_data, 'start')) {
                myLeapApp.sounder.play('start');
            }
            if (this.try(gesture_data, 'exit')) {
                // check if shortly before there was a collapse gesture
                // don't play the exit sound if that is the case
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
                }
                else if(gesture_data.swipe == "left") {
                    myLeapApp.radio.pause();
                    myLeapApp.sounder.play('prev');
                    setTimeout(function(){
                        myLeapApp.radio.previousTrack();
                    }, 400);
                    this.radio_on = true;

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
            // only adjust volume if radio is on
            else if (this.radio_on && this.try(gesture_data, 'vol_adjust')) {

                // if adjusting volume then map y-axis to volume
                // TODO: set volume to current handposition when entering the interaction box

                // check for hands first, because when hand left
                if (!(this.try(gesture_data, 'exit'))) {
                    // y-Axis range 120mm – 420mm
                    // mapping this to volume (0.1 - 1.0)
                    var y_axis = data.hands[0].palmPosition[1];
                    this.volume = y_axis.map(120, 420, 0.1, 1.0);
                    this.volume = (this.volume < 0.1) ? 0.1 : this.volume; // 0.1 is minimum
                    this.volume = (this.volume > 1) ? 1 : this.volume; // 1 maximum
                    console.log("%c this.volume: ", "background: #FDD187; color: #DA5C1B", this.volume);
                    // send volume to radio module to adjust volume
                    myLeapApp.radio.setVolumeYAxis(this.volume);
                }

            }


        },
        onLeave: function() {
        }

    }
};


