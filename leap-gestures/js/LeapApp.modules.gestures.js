(function(){

    var detectFastMovement = function (veloc) {
        /**
         * loop through all vectors in velocity (x,y,z)
         * compare absolute value of number with a threshold-speed
         * if value is bigger, return true (fast Movement detected)
         */
        for (var i = veloc.length - 1; i >= 0; i--) {
            if (Math.abs(veloc[i]) > 600) {
                return true;
            }
        }
        return false;
    };

    LEAPAPP.GestureChecker = function (instance_name) {
        // dependecies:
        //  jQuery
        //  leap.js
        this.name = instance_name;

            /**
         * init intializes the gesture tracker
         * and creates a new Leap controller object
         * to receive the info provided by leap.js
         * @param  {[boolean]} draw [if true the fingers are drawn on the canvas]
         * @return {[type]}      [description]
         */
        this.ctx = undefined; // canvas 2d drawing context
        this.canvas = undefined;
        this.w = undefined;
        this.h = undefined;
        this.dir_change_timeout = undefined;
        this.fast_mov_timout = undefined; // timeouts
        this.last_frame = {
                l_velocity: 0
            };
        this.recent_fast_moves = false;
        this.dir_change_count = 0; // counting direction change of cancel gesture
        // gesture flags
        this.cancel_gesture = false;
        this.thumb_up_gesture = false;
    };

    LEAPAPP.GestureChecker.prototype.startTracking = function(draw, callback) {

        // save reference to GestureChecker (this)
        // for nested functions which don't have acces to this
        var uber = this;

        // if canvas draw is necessary
        if (draw) {
            uber.w = 1024;
            uber.h = 768;
        }

        // if callback (param) is a function set uber.callback to it, otherwise make an empty function
        uber.callback = typeof callback === 'function' ? callback : function(){};

        // create a new Leap Controller
        uber.controller = new Leap.Controller({ frameEventName: 'animationFrame' });

        uber.controller.connect();
        // assigns the info of the current frame to the var 'frame'.
        // frame(1) would call the second last frame info and so on
        uber.controller.on('frame', function(frame){

            if (draw){
                // add a canvas to the DOM-tree
                var canvas_string = '<canvas id="drawing" width="' + uber.w + '" height="' + uber.h + '"></canvas>';
                $('body').append(canvas_string);

                // get 2d drawing context for our canvas if
                // it hasn't been set up yet
                if (!uber.ctx) {
                    uber.canvas = document.getElementById("drawing");
                    uber.ctx = uber.canvas.getContext('2d');
                }

                // if fingers detected draw them on canvas
                if (frame.pointables.length) {
                    // blank out canvas
                    uber.ctx.clearRect(0, 0, uber.w, uber.h);
                    uber.drawFingerTips(frame.pointables);
                }
            }


            /**
             * callback function:
             * uber.intermediary.publish("gesture", gesture_data, data);
             * publishes the frame and gesture info to the mediator
             */
            var gesture_data = uber.extractGestures(frame);
            uber.callback(gesture_data, frame);

            myLeapApp.painter.paint(gesture_data);

        });
    };

    LEAPAPP.GestureChecker.prototype.checkForAnyInteraction = function(frame) {
        // to check for any interaction see if a hand is
        // visible in leaps interaction box.
        if (frame.hands.length > 0) {
            return true;
        }
    };

    LEAPAPP.GestureChecker.prototype.checkCancelGesture = function(frame) {

        var uber = this;
        // TODO: Maybe need to check for fingers.extended
        // so that a shaking fist is not registered as cancel

        /**
         * function to check if velocity is higher
         * than a certain threshold
         * @param  {object} veloc [with x,y,z vectors]
         * @return {boolean}
         */

        for (var i = frame.hands.length -1; i >= 0; i--) {
            var hand = frame.hands[i];
            /**
             * velocity of palm in three directions
             * in millimeters/second [vx,vy,vz]
             * x is parallel to leap motion device, y is up and down,
             * z is closer and further away from user.
             * check a lot of direction changes are registered
             * for winking = cancel gesture
             * @type {vector, vector, vector}
             */
            var velocity = hand.palmVelocity;
            var min_movement = 75;
            // save last frames velocity in var for quicker access (faster writing)
            var lv = this.last_frame['l_velocity'];

            /**
             * check if very fast movement is in one of the 3 vectors
             * @return {boolean}
             */
            if (detectFastMovement(velocity)) {
                // set timer to reset fastMovement boolean
                this.recent_fast_moves = true;
                clearTimeout(this.fast_mov_timout);
                this.fast_mov_timout = setTimeout(function(){
                    uber.recent_fast_moves = false;
                }, 900);
            }

            // debug log
            // console.log("lv[0]: " + lv[0] + "\t\t\t\tvelocity[0]: " + velocity[0] + "\t\t\t\tlv[2]: " + lv[2] + "\t\t\t\tvelocity[2]: " + velocity[2] );


            /**
             * check if change from - to + which indicates a direction change
             * in x direction (velocity[0])
             * and in z direction (velocity[2])
             * also check if direction change is big enough (bigger than min_movement)
             * to exclude random direction changes when holding still
             */
            if (
                    (velocity[0] > 0 && lv[0] < 0 && ((velocity[0] - lv[0]) >   min_movement))    ||
                    (velocity[0] < 0 && lv[0] > 0 && ((velocity[0] - lv[0]) < - min_movement))    ||
                    (velocity[2] > 0 && lv[2] < 0 && ((velocity[2] - lv[2]) >   min_movement))    ||
                    (velocity[2] < 0 && lv[2] > 0 && ((velocity[2] - lv[2]) < - min_movement))
                ) {

                // console.log("Direction Changed");
                this.dir_change_count++;

                /**
                 * if change count is big enough
                 * and if no fast moves registered recently
                 * (which would mean somebody could be swiping)
                 * then trigger cancel gesture
                 */
                if (this.dir_change_count > 4 && !this.recent_fast_moves) {
                    this.cancel_gesture = true;
                }

                // set timeOut. if 1s is over without a direction change
                // count is reset.
                clearTimeout(this.dir_change_timeout);
                this.dir_change_timeout = setTimeout(function() {
                    uber.dir_change_count = 0;
                    // also reset gesture
                    uber.cancel_gesture = false;
                }, 1000);
            }
            // save velocity to last_frame for change detection in next frame
            this.last_frame['l_velocity'] = velocity;

            if (this.cancel_gesture) {
                return true;
            } else {
                return false;
            }
        }
    };

    LEAPAPP.GestureChecker.prototype.checkThumbUpGesture = function(frame) {

        /**
         * check for both hands
         if fingers are not extended and thumb is extended
         then trigger thumb up gesture
         */
        for (var i = frame.hands.length -1; i >= 0; i--) {
            var hand = frame.hands[i];
            var speed = hand.palmVelocity;

            // generate names for fingers 0 = thumb, 1 = index etc.
            var name_map = ["thumb", "index", "middle", "ring", "pinky"];
            var folded_fingers = 0;
            /**
             * make loop to check if fingers are extended.
             * if yes, break loop. no further checking required
             * because thumb up gesture needs all fingers except thumb to be folded
             */
            outer_loop:
            for (var j = hand.fingers.length - 1; j >= 0; j--) {
                // save each fingers name
                var finger = hand.fingers[j];
                var finger_name = name_map[finger.type];
                // check if extended, otherwise break loop
                if (finger.extended && finger_name !== "thumb") {
                    break outer_loop;
                } else {
                    folded_fingers++;
                }
            }
            // if 4 fingers are folded and thumb extended -> trigger gesture
            if (folded_fingers > 3 && hand.thumb.extended) {
                var moving_fast = false;
                /**
                 * speed indicates velocity of palm in three directions
                 * in millimeters/second [vx,vy,vz]
                 * check if speed is faster than 100mm/s
                 * @type {vector, vector, vector}
                 */

                for (var y = speed.length - 1; y >= 0; y--) {
                    if ((speed[y] > 100) || (speed[y] < -100)) {
                        moving_fast = true;
                        break; // break from loop, because if one direction is too fast thats enough
                    }
                }
                /*
                 if not moving fast (and fingers are in the right position, check above)
                 and if grabStrength == 1 (more ore less closed hand)
                 assign thumb up gesture
                 */
                if (!moving_fast && hand.grabStrength == 1) {
                    this.thumb_up_gesture = true;
                }
            } else {
                this.thumb_up_gesture = false;
            }

            if (this.thumb_up_gesture) {
                return true;
            } else {
                return false;
            }
        }
    };

    LEAPAPP.GestureChecker.prototype.drawFingerTips = function(pointables) {
        var uber = this;

        for (var i = pointables.length - 1; i >= 0; i--) {
            var pointable = pointables[i];


            // do we know where the tip of the finger or tool is
            // located?
            var tip = pointable.tipPosition;
            if (!tip) return;
            // get x/y/z coordinates of pointable tips
            // and convert to coordinates that roughly
            // live inside of the canvas dimensions.
            var x = tip[0]*2 + uber.w/2;
            var y = -tip[1] + uber.h/2;
            // use depth to control the radius of the circle
            // being drawn
            var radius = (-tip[2] + 100) / 6;  // random numbers lol
            if (radius < 10) radius = 10;      // not too small!
            // begin drawing circle
            uber.ctx.beginPath();
            // centered at (x,y) with radius scaled by depth, in a full arc
            uber.ctx.arc(x, y, radius, 0 , 2 * Math.PI, false);
            uber.ctx.lineWidth = 5;
            // color based on which hand it is
            var g = i % 2 ? 200 : 0;
            uber.ctx.strokeStyle = "rgb(120," + g + ",35)";
            // draw circle
            uber.ctx.stroke();
        }

    };

    LEAPAPP.GestureChecker.prototype.extractGestures = function(frame) {
        var gestures = {};
        var uber = this;
        // check for gestures and save it in the gesture objects
        gestures.interaction    = uber.checkForAnyInteraction(frame);
        gestures.thumb_up       = uber.checkThumbUpGesture(frame);
        gestures.cancel         = uber.checkCancelGesture(frame);
        gestures.fast_moves     = uber.detectFastMovement(frame);

        return gestures;

    };





}());




