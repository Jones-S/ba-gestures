(function(){

    function makeTHREEVector(vector) {
        var three_vector = new THREE.Vector3(vector[0], vector[1], vector[2]);
        return three_vector;
    }



    LEAPAPP.GestureChecker = function (instance_name) {
        // dependecies:
        //  jQuery
        //  leap.js
        //  three.js
        this.name = instance_name;

        /**
         * init intializes the gesture tracker
         * and creates a new Leap controller object
         * to receive the info provided by leap.js
         * @param  {[boolean]} draw [if true the fingers are drawn on the canvas]
         * @return {[type]}      [description]
         */

        // for drawing fingers in drawing mode
        this.ctx = undefined; // canvas 2d drawing context
        this.canvas = undefined;
        this.w = undefined;
        this.h = undefined;
        this.q = 1;


        // provide an array (object – because retrieving hand info via string id '22') for saving hands
        this.last_hands= {};

        // Timeouts
        this.timeouts = {
            dir_change_timeout_id:  null,
            fast_mov_timout_id:     null
        };

        // save hands in array to save last frame infos for each hand
        this.last_hands_info = {};

        this.last_frame = {
                l_velocity: 0,
                stab_palm_pos: 0
            };
        this.recent_fast_moves = false;
        this.dir_change_count = 0; // counting direction change of cancel gesture
        // gesture flags
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

    LEAPAPP.GestureChecker.prototype.checkForDistinctInteraction = function(frame) {
        var uber = this;
        var distinct_interaction;

        for (var i = frame.hands.length -1; i >= 0; i--) {
            var hand = frame.hands[i];
            // check if hand id is saved in hands_info array
            if (!uber.last_hands_info.hasOwnProperty(hand.id)) {
                uber.last_hands_info[hand.id] = hand;
            }

            // save last hand in a temp variable
            var last_hand = uber.last_hands_info[hand.id];

            // only check for the following if the confidence value is high enough
            // confidence = "How well the internal hand model fits the observed data."
            var confidence = hand.confidence;

            if (confidence > 0.7) {

                ////////////////////////////
                // DISTINCT PALM MOVEMENT //
                ////////////////////////////

                var min_move_distinct = 6;
                // check palm position to previous value (absolute value of difference bigger than x)
                if (
                    (Math.abs(last_hand.palmPosition[0] - hand.palmPosition[0]) > min_move_distinct) ||
                    (Math.abs(last_hand.palmPosition[1] - hand.palmPosition[1]) > min_move_distinct) ||
                    (Math.abs(last_hand.palmPosition[2] - hand.palmPosition[2]) > min_move_distinct)

                ) {
                    /**
                     * make sure that the movement is not a withdrawal
                     * z-value (palmPosition[2]) is getting bigger when withdrawing
                     * so if last hands z pos is smaller it should be ok.
                     * also check for a distinct movement again (only in z direction)
                     */
                    if (
                        (last_hand.palmPosition[2] < hand.palmPosition[2]) &&
                        (Math.abs(last_hand.palmPosition[2] - hand.palmPosition[2]) > min_move_distinct)
                    ) {
                        // console.log("last_hand.palmPosition[2]: ", last_hand.palmPosition[2], "        hand.palmPosition[2]: ", hand.palmPosition[2]);
                        console.log("ONLY WITHDRAWAL .....................");
                    } else {
                        distinct_interaction = true;
                    }
                }


                ////////////////////
                // FINGER POSTURE //
                ////////////////////

                // iterate through fingers and check their posture to previous posture
                for (var j = hand.fingers.length - 1; j >= 0; j--) {
                    // if one finger was extended and bent the frame after a distinct gesture is detected
                    if (last_hand.fingers[j].extended != hand.fingers[j].extended ) {
                        distinct_interaction = true;
                        // console.log("FINGER POSTURE CHANGED ");
                    }
                    // use three.js to make vector calculations
                    /**
                     * Check angle between proximal medial
                     * Because of inaccuracy I check for 2 fingers and more to change
                     * @param  {[type]} hand.fingers[j].type [description]
                     * @return {[type]}                      [description]
                     */
                    // if (hand.fingers[j].type == 2) {
                    //     // direction vectors are normalized already
                    //     var dir_proximal = hand.fingers[j].proximal.direction();
                    //     var dir_medial = hand.fingers[j].medial.direction();

                    //     // transform them to a THREE.js vector
                    //     dir_proximal = makeTHREEVector(dir_proximal);
                    //     dir_medial = makeTHREEVector(dir_medial);

                    //     // and call angleTo method to determine angle
                    //     var angle_between   = dir_proximal.angleTo(dir_medial);
                    //     console.log("angle_between: ", angle_between * 180 / Math.PI);
                    // }

                }
            }







            // and set current hand to last_hand object
            uber.last_hands_info[hand.id] = hand;



            // console.log("hand.stabilizedPalmPosition: ", hand.stabilizedPalmPosition);
            // console.log("hand.palmPosition: ", hand.palmPosition);


            if (distinct_interaction) {
                return true;
            } else {
                return false;
            }
        }
    };

    LEAPAPP.GestureChecker.prototype.checkCancelGesture = function(frame) {

        var uber = this;
        var cancel_gesture = false;
        // TODO: Maybe need to check for fingers.extended
        // so that a shaking fist is not registered as cancel


        // check for fast movements first
        // further calculations depend on it
        // and set timer
        uber.detectFastMovement(frame);

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

            // add hand (id) to hands object if not existing yet
            if (!uber.last_hands.hasOwnProperty(hand.id)) {
                uber.last_hands[hand.id] = {
                    l_velocity: 0
                };
            }
            // save last frames velocity in var for quicker access (faster writing)
            var lv = uber.last_hands[hand.id].l_velocity;

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
                uber.dir_change_count++;

                /**
                 * if change count is big enough
                 * and if no fast moves registered recently
                 * (which would mean somebody could be swiping)
                 * then trigger cancel gesture
                 */
                if (uber.dir_change_count > 4 && !uber.recent_fast_moves) {
                    cancel_gesture = true;
                }

                // set timeOut. if 1s is over without a direction change
                // count is reset.
                uber.setTimer(uber.timeouts.dir_change_timeout_id, uber.dir_change_count, 1000);
            }

            // save velocity to last_frame for change detection in next frame
            uber.last_hands[hand.id].l_velocity = velocity;

            if (cancel_gesture) {
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

    LEAPAPP.GestureChecker.prototype.detectFastMovement = function(frame) {
        var uber = this;
        /**
         * loop through all vectors in velocity (x,y,z)
         * compare absolute value of number with a threshold-speed
         * if value is bigger, return true (fast Movement detected)
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
            var velocity = hand.palmVelocity; // three vectors
            var min_movement = 75;

            for (var j = velocity.length - 1; j >= 0; j--) {
                if (Math.abs(velocity[j]) > 600) {
                    // set flag to true
                    uber.recent_fast_moves = true;

                    // set timeout to reset the flag: uber.setTimer(timeout, flag to reset, time in ms)
                    uber.setTimer(uber.timeouts.fast_mov_timout_id, uber.recent_fast_moves, 900, uber);
                    return true;
                }
            }
        }
        // return false if no hands detected or if no fast movements detected
        return false;
    };

    /**
     * set a Timer to reset a flag after some time
     * @param {object}  timer
     * @param {boolean} flag
     * @param {number}  duration
     * @return {number} timer_id is return and passed to the variable of the classes scope
     */
    LEAPAPP.GestureChecker.prototype.setTimer = function(timer_id, flag, duration) {
        var uber = this;
        // set timeout to reset the flag
        if (uber.timeouts[timer_id]) {
            clearTimeout(uber.timeouts[timer_id]);
        }
        uber.timeouts[timer_id] = setTimeout(function() {
            // reset flag
            flag = false;
            console.log("Timer timed out");
        }, duration);
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
        gestures.interaction            = uber.checkForAnyInteraction(frame);
        gestures.distinct_interaction   = uber.checkForDistinctInteraction(frame);
        gestures.thumb_up               = uber.checkThumbUpGesture(frame);
        gestures.cancel                 = uber.checkCancelGesture(frame);
        gestures.fast_moves             = uber.detectFastMovement(frame);

        return gestures;
    };






}());




