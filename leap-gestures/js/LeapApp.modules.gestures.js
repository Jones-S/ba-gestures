(function(){

    function makeTHREEVector(vector) {
        var three_vector = new THREE.Vector3(vector[0], vector[1], vector[2]);
        return three_vector;
    }

    function countExtendedFingers(hand) {
        // count extended finger
        var extendedFingers = 0;
            for (var f = 0; f < hand.fingers.length; f++){
                var finger = hand.fingers[f];
                if (finger.extended) extendedFingers++;
        }
        return extendedFingers;
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
            dir_change_timeout_id:      1,
            fast_mov_timout_id:         2,
            recent_swipes_timout_id:    3
        };

        // save hands in array to save last frame infos for each hand
        this.last_hands_info    = {};
        this.last_pinch         = [];
        this.last_open_hand     = [];

        this.last_explosion = this.last_collapse = 0;

        this.last_frame = {
            l_velocity: 0,
            stab_palm_pos: 0
        };
        this.flags = {
            recent_fast_moves:  false,
            recent_swipes:      false,
            dir_change_count:   false,   // counting direction change of cancel gesture
            thumb_up_gesture:   false
        };
        this.counts = {
            thumb_up_frames:    0
        }

        // gesture flags
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

            // check if last frames hand exist to paint one last time
            if (uber.controller.frame(1).hands.length) {
                myLeapApp.painter.paint(gesture_data);
            }


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
                        (last_hand.palmPosition[2] > hand.palmPosition[2]) &&
                        (Math.abs(last_hand.palmPosition[2] - hand.palmPosition[2]) > min_move_distinct)
                    ) {
                        // console.log("last_hand.palmPosition[2]: ", last_hand.palmPosition[2], "        hand.palmPosition[2]: ", hand.palmPosition[2]);
                        distinct_interaction = true;
                        // console.log("DISTINCT:     PALM POSITION");
                    } else {
                        // console.log("ONLY WITHDRAWAL .....................");
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
                        // console.log("DISTINCT:     FINGER POSTURE CHANGED ");
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










            // console.log("hand.stabilizedPalmPosition: ", hand.stabilizedPalmPosition);
            // console.log("hand.palmPosition: ", hand.palmPosition);


            if (distinct_interaction) {
                return true;
            } else {
                return false;
            }
        }
    };

    /**
     * [checkForExplosion]
     * A gesture which could be used to switch something on. Especially light.
     * The hand shape goes from a 5-finger pinch into a fully extended hand.
     * @param  {object} frame with leap motion info
     * @return {boolean} saying if gesture was made or not
     */
    LEAPAPP.GestureChecker.prototype.checkForExplosion = function(frame) {
        var uber = this;

        for (var i = frame.hands.length -1; i >= 0; i--) {
            var hand = frame.hands[i];

            // save last hand in a temp variable
            var last_hand = uber.last_hands_info[hand.id];

            // call function to get and save last pinch info
            var index = uber.saveAndGetLast("last_pinch", hand);

            // save the time when the hand showed a pinchStrenght of more than 0.9 the last time
            if (hand.pinchStrength > 0.9) {
                uber.last_pinch[index].time = hand.timeVisible;
            }

            // check for time passed since the last strong pinch
            var time_passed = hand.timeVisible - uber.last_pinch[index].time;

            // check for last collapse time
            var time_between_gestures = hand.timeVisible - uber.last_collapse;

            // compare pinch strength between last and current frame
            // and check if passed time since last strong pinch is lower than a 1/4s (0.25s)


            if ((last_hand.pinchStrength > 0.05)
                && (hand.pinchStrength < 0.05)
                // && (time_passed < 0.25)
                // && (time_between_gestures > 0.9)
             ) {
                if (LEAPAPP.debug) {
                    console.log("- - - - - - - GESTURE:                                    Explosion");
                }
                // save time of the last explosion
                uber.last_explosion = hand.timeVisible;
                return true;
            } else {
                return false;
            }


        }
    };

    /**
     * [checkforCollapse]
     * checking for a collapse-like gesture,
     * describing a bending of all 5 fingers into a pinch
     * @param  {object} frame
     * @return {boolean] describing if gesture was detected
     */
    LEAPAPP.GestureChecker.prototype.checkforCollapse = function(frame) {
        var uber = this;

        for (var i = frame.hands.length -1; i >= 0; i--) {
            var hand = frame.hands[i];

            // save last hand in a temp variable
            var last_hand = uber.last_hands_info[hand.id];

            // call function to get and save last pinch info
            var index = uber.saveAndGetLast("last_open_hand", hand);
            // console.log("hand.pinchStrength: ", hand.pinchStrength);
            if (hand.pinchStrength < 0.003) {
                uber.last_open_hand[index].time = hand.timeVisible;
            }

            // check for time passed since the last open hand
            var time_passed = hand.timeVisible - uber.last_open_hand[index].time;

            // check time since last explosion gesture
            // normally after making an explosion gesture
            // a collapse gesture follows automatically
            // check for last collapse time
            var time_between_gestures = hand.timeVisible - uber.last_explosion;



            if ((last_hand.pinchStrength < 0.95)
                && (hand.pinchStrength > 0.95)
                // && (time_passed < 0.25) &&
                // && (time_between_gestures > 0.9)
             ) {
                if (LEAPAPP.debug) {
                    console.log("- - - - - - - GESTURE:                                    Collapse");
                }
                uber.last_collapse = hand.timeVisible;
                return true;
            } else {
                return false;
            }


        }
    };

    LEAPAPP.GestureChecker.prototype.checkSwipe = function(frame) {
        var uber = this;
        var swipeDirection = "";

        // Display Gesture object data
        if (frame.gestures.length > 0) {
            for (var i = 0; i < frame.gestures.length; i++) {
                var gesture = frame.gestures[i];
                if (gesture.type == "swipe") {
                    //Classify swipe as either horizontal or vertical
                    var isHorizontal = Math.abs(gesture.direction[0]) > Math.abs(gesture.direction[1]);
                    //Classify as right-left or up-down
                    if (isHorizontal) {
                        if (gesture.direction[0] > 0) {
                            swipeDirection = "right";
                        } else {
                            swipeDirection = "left";
                        }
                    } else { //vertical
                        if (gesture.direction[1] > 0) {
                            swipeDirection = "up";
                        } else {
                            swipeDirection = "down";
                        }
                    }

                    // if no recent swipes and dirction is defined
                    if (!uber.flags.recent_swipes && swipeDirection !== "") {
                        if (LEAPAPP.debug) {
                            console.log("- - - - - - - GESTURE:                                    Swipe: " + swipeDirection);
                        }
                        // set flag for recent swipes to true (will be reset by timer)
                        uber.flags.recent_swipes = true;
                        // set timer to enable next swipe
                        uber.setTimer(uber.timeouts.recent_swipes_timout_id, "recent_swipes", 500);
                        return swipeDirection;
                    } else {
                        return false;
                    }
                }
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
                if (uber.dir_change_count > 4 && !uber.flags.recent_fast_moves) {
                    cancel_gesture = true;
                }

                // set timeOut. if 1s is over without a direction change
                // count is reset.
                uber.setTimer(uber.timeouts.dir_change_timeout_id, "dir_change_count", 1000);
                // TODO: flag is a integer instead of boolean
            }

            // save velocity to last_frame for change detection in next frame
            uber.last_hands[hand.id].l_velocity = velocity;

            if (cancel_gesture) {
                if (LEAPAPP.debug) {
                    console.log("- - - - - - - GESTURE:                                    Cancel:");
                }
                return true;
            } else {
                return false;
            }
        }
    };

    LEAPAPP.GestureChecker.prototype.checkThumbUpGesture = function(frame) {
        var uber = this;
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
            var extendedFingers = countExtendedFingers(hand);

            var confidence = hand.confidence;
            if (confidence > 0.5) {

                // if 4 fingers are folded and thumb extended -> trigger gesture
                if (extendedFingers < 2 && hand.thumb.extended) {
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
                        uber.flags.thumb_up_gesture = true;
                        // increase frame counts at which thumb was up
                        uber.counts.thumb_up_frames++;
                    }
                } else {
                    uber.flags.thumb_up_gesture = false;
                }

                if (uber.flags.thumb_up_gesture && uber.counts.thumb_up_frames > 20) {
                    if (LEAPAPP.debug) {
                        console.log("- - - - - - - GESTURE:                                    Thumb Up:");
                    }
                    return true;
                } else {
                    return false;
                }
            } else { // if confidence level was to low
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
                    uber.flags.recent_fast_moves = true;

                    // set timeout to reset the flag: uber.setTimer(timeout, flag to reset, time in ms)
                    uber.setTimer(uber.timeouts.fast_mov_timout_id, "recent_fast_moves", 900);
                    return true;
                }
            }
        }
        // return false if no hands detected or if no fast movements detected
        return false;
    };

    LEAPAPP.GestureChecker.prototype.saveAndGetLast = function(array, hand) {
        var uber = this;
        // check if last pinch array contains an object with id = hand.id
        // findIndex returns -1 if no index is found
        var index = _.findIndex(uber[array], ['id', hand.id]);
        if ( index === -1) {
            var new_last_moment = { id: hand.id, time: 0 };
            uber[array].push(new_last_moment);

            // and delete older hands in last pinch array
            if (uber[array].length > 2) {
                uber[array].splice(0, 1); //splice(indexToRemove, amountToRemove)
            }
            // save new index for later reference
            index = uber[array].length - 1;
        }
        return index;
    };


    LEAPAPP.GestureChecker.prototype.doesLastHandExist = function(frame) {
        var uber = this;
        for (var i = frame.hands.length - 1; i >= 0; i--) {
            var hand = frame.hands[i];
            if (!uber.last_hands_info.hasOwnProperty(hand.id)) {
                uber.last_hands_info[hand.id] = hand;
            }
        }
    };


    LEAPAPP.GestureChecker.prototype.saveLastHand = function(frame) {
        var uber = this;
        for (var i = frame.hands.length - 1; i >= 0; i--) {
            var hand = frame.hands[i];
            // save hand into last hands array
            uber.last_hands_info[hand.id] = hand;
        }
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
            uber.flags[flag] = false;
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
        // save last handinfo if no value exists
        uber.doesLastHandExist(frame);

        // check for gestures and save it in the gesture objects
        gestures.interaction            = uber.checkForAnyInteraction(frame);
        gestures.distinct_interaction   = uber.checkForDistinctInteraction(frame);
        gestures.on                     = uber.checkForExplosion(frame);
        gestures.off                    = uber.checkforCollapse(frame);
        gestures.swipe                  = uber.checkSwipe(frame);
        gestures.thumb_up               = uber.checkThumbUpGesture(frame);
        gestures.cancel                 = uber.checkCancelGesture(frame);
        gestures.fast_moves             = uber.detectFastMovement(frame);
        // console.log("uber.flags: ", uber.flags);
        // save hand to last hand object
        uber.saveLastHand(frame);

        return gestures;
    };






}());




