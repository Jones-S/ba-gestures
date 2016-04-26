(function(){

    function getFingerInfo(frame) {
        var name_map = ["thumb", "index", "middle", "ring", "pinky"];
        var object = {};

        for (var i = frame.hands.length - 1; i >= 0; i--) {

            var hand = frame.hands[i];
            var total_extended = 5;

            object[hand.id] = {
                total_extended: 5,
                thumb:  { extended: true, tip_pos: [0, 0, 0] },
                index:  { extended: true, tip_pos: [0, 0, 0] },
                middle: { extended: true, tip_pos: [0, 0, 0] },
                ring:   { extended: true, tip_pos: [0, 0, 0] },
                pinky:  { extended: true, tip_pos: [0, 0, 0] }
            };

            for (var f = 0; f < hand.fingers.length; f++){
                var finger = hand.fingers[f];
                // access finger info via type (number) mapped to name (identifier)
                object[hand.id][name_map[finger.type]].tip_pos = finger.tipPosition;
                if (!finger.extended) {
                    object[hand.id][name_map[finger.type]].extended = false;
                    total_extended--;
                }
            }
            object[hand.id].total_extended = total_extended;
        }
        return object;
    }

    // Converts from degrees to radians.
    Math.radians = function(degrees) {
      return degrees * Math.PI / 180;
    };

    // Converts from radians to degrees.
    Math.degrees = function(radians) {
      return radians * 180 / Math.PI;
    };

    // Converts from radians to degrees.
    Math.twoDecimals = function(number) {
      return Math.round(number * 100)/100;
    };


    // TODO: disabled gestures when hand enters interaction box for a certain time


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

        this.fingerInfo = {
            /* structure */
            // hand_id: {
            //     total_extended: 5,
            //     thumb:  { extended: true, tip_pos: [0, 0, 0] },
            //     index:  { extended: true, tip_pos: [0, 0, 0] },
            //     middle: { extended: true, tip_pos: [0, 0, 0] },
            //     ring:   { extended: true, tip_pos: [0, 0, 0] },
            //     pinky:  { extended: true, tip_pos: [0, 0, 0] }
            // }
        };


        // provide an array (object – because retrieving hand info via string id '22') for saving hands
        this.last_hands= {};

        // Timeouts (Ids for resetting timers)
        this.timeouts = {
            timeout_id_dir_change:      1,
            timeout_id_fast_move:       2,
            timeout_id_recent_swipes:   3,
            timeout_id_thumb_up:        4,
            timeout_id_recent_distinct: 5,
            timeout_id_last_gesture:    6,
            timeout_id_rotation_frames: 7,
            timeout_id_rot_grab_timer:  8


        };

        // save hands in array to save last frame infos for each hand
        this.last_hands_info    = {};
        this.last_pinch         = [];
        this.last_open_hand     = [];

        // saving hand rotation at beginning of rotation grab gesture
        this.rot_frame = 0;

        this.last_explosion = this.last_collapse = 0;

        this.last_frame = {
            l_velocity: 0,
            stab_palm_pos: 0
        };
        this.flags = {
            recent_fast_moves:  false,
            recent_swipes:      false,
            recent_distinct:    false,
            thumb_up_gesture:   false,
            rotation_grab:      false,
            rot_grab_timer:     false
        };
        this.counts = {
            dir_change_count:   0,   // counting direction change of cancel gesture
            thumb_up_frames:    0,   // counting frames of thumb up gesture
            rotation_frames:    0    // counting frames of rotation gesture
        };

        // create object which will be sent to setVolume
        this.rotation_info = { angle_diff: 0, volume_at_grab: 0.7 };

        this.last_gesture   = ''; // saving the last gesture to prevent explosion gesture after thumb for example

        // gesture flags
        $('body').on( "click", function() {
            console.log("%c -------------------- START ANALYSIS FROM HERE ----------------- ", "background: #FDD187; color: #DA5C1B");
        });
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

            // do some calculations a lot of gestures will need
            uber.fingerInfo = getFingerInfo(frame);
            // print infos to screen
            uber.printInfo(frame);

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

    LEAPAPP.GestureChecker.prototype.checkForNewHand = function(frame) {
        for (var i = frame.hands.length -1; i >= 0; i--) {
            var hand = frame.hands[i];
            // check if hand exists in last frame
            if (true) {}
            uber.last_hands_info[hand.id] = hand;
        }
    };

    LEAPAPP.GestureChecker.prototype.checkForHandLeave = function(frame) {

    };

    /**
     * printInfo brings frame information to the browser screen
     */
    LEAPAPP.GestureChecker.prototype.printInfo = function(frame) {
        var uber = this;
        for (var i = frame.hands.length - 1; i >= 0; i--) {
            var hand = frame.hands[i];
            var roll = hand.roll();
            roll = Math.degrees(roll);
            $('#leap-info-1').html('grabStrength: ' + hand.grabStrength);
            $('#leap-info-2').html('pinchStrength: ' + hand.pinchStrength);
            $('#leap-info-3').html('roll: ' + Math.round(roll * 100)/100);
            $('#leap-info-4').html('Extended: ' + uber.fingerInfo[hand.id].total_extended); // if two hands just overwrite first
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
                        (last_hand.palmPosition[2] > hand.palmPosition[2])
                        && (Math.abs(last_hand.palmPosition[2] - hand.palmPosition[2]) > min_move_distinct)
                        && (!uber.flags.recent_distinct)
                    ) {
                        // console.log("last_hand.palmPosition[2]: ", last_hand.palmPosition[2], "        hand.palmPosition[2]: ", hand.palmPosition[2]);
                        distinct_interaction = true;
                        // set a flag for recent distinct interaction
                        uber.flags.recent_distinct = true;
                        if (myLeapApp.debug) {
                            console.log("%c - - - - - - - GESTURE:                                    Distinct Palm", 'background: #A8A696; color: #F7FFF8');
                        }
                        // set timer to enable next swipe
                        uber.setTimer({ timeout_id: uber.timeouts.timeout_id_recent_distinct, flag: "recent_distinct", duration: 500 });
                        return true;
                    } else {
                        return false;
                    }
                }
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

            if (hand.grabStrength > 0.9) {
                uber.last_pinch[index].time = hand.timeVisible;
            }

            // check for time passed since the last strong pinch
            var time_passed = hand.timeVisible - uber.last_pinch[index].time;

            // check for last collapse time
            var time_between_gestures = hand.timeVisible - uber.last_collapse;
            // TODO: take time between gestures into account again

            // compare pinch strength between last and current frame
            // and check if passed time since last strong pinch is lower than a 1/4s (0.25s)
            if ((last_hand.grabStrength > 0.05)
                && (hand.grabStrength < 0.05)
                && (uber.last_gesture !== 'thumb_up') // if last gesture was thumb up dont trigger explosion
                && (uber.last_gesture !== 'rotation_grab')
                && (hand.palmVelocity[0] > -500)
                && (hand.palmVelocity[0] < 500) // palmvelocity cannot be too fast (otherwise it's a swipe)
                && (hand.palmVelocity[2] > -250)
                && (hand.palmVelocity[2] < 250) // palmvelocity cannot be too fast (otherwise it's a swipe)
                && (!uber.flags.recent_swipes) // also check for recent swipes (enough time between gestures)
                // && (time_passed < 0.25)
                // && (time_between_gestures > 0.9)
             ) {
                if (myLeapApp.debug) {
                    console.log("%c - - - - - - - GESTURE:                                    Explosion", 'background: #ECDF00; color: #171817');
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
            var thumb_extended = true;

            // save last hand in a temp variable
            var last_hand = uber.last_hands_info[hand.id];

            // call function to get and save last pinch info
            var index = uber.saveAndGetLast("last_open_hand", hand);
            if (hand.grabStrength < 0.003) {
                uber.last_open_hand[index].time = hand.timeVisible;
            }

            // check for time passed since the last open hand
            var time_passed = hand.timeVisible - uber.last_open_hand[index].time;

            // check time since last explosion gesture
            // normally after making an explosion gesture
            // a collapse gesture follows automatically
            // check for last collapse time
            var time_between_gestures = hand.timeVisible - uber.last_explosion;

            // get finger info object to check thumb extension
            if (!uber.fingerInfo[hand.id].thumb.extended) {
                thumb_extended = false;
            }

            if ((last_hand.grabStrength < 0.75)
                && (hand.grabStrength >= 0.75)
                && (!thumb_extended)
                && (uber.last_gesture !== 'rotation_grab')
                && (hand.palmVelocity[0] > -500)
                && (hand.palmVelocity[0] < 500) // palmvelocity cannot be too fast (otherwise it's a swipe)
                && (hand.palmVelocity[2] > -250)
                && (hand.palmVelocity[2] < 250) // palmvelocity cannot be too fast (otherwise it's a swipe)
                && (!uber.flags.recent_swipes) // also check for recent swipes (enough time between gestures)

                // && (time_passed < 0.25) &&
                // && (time_between_gestures > 0.9)
             ) {
                if (myLeapApp.debug) {
                    console.log("%c - - - - - - - GESTURE:                                    Collapse", 'background: #928000; color: #FFFEFF');
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
                        if (myLeapApp.debug) {
                            console.log("%c - - - - - - - GESTURE:                                    Swipe: " + swipeDirection, 'background: #635FC9; color: #F7FFF8');
                        }
                        // set flag for recent swipes to true (will be reset by timer)
                        uber.flags.recent_swipes = true;
                        // set timer to enable next swipe
                        uber.setTimer({ timeout_id: uber.timeouts.timeout_id_recent_swipes, flag: "recent_swipes", duration: 500 });
                        // a swipe also resets the count necessary for the cancel gesture
                        uber.counts.dir_change_count = 0;


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


        /**
         * function to check if velocity is higher
         * than a certain threshold
         * @param  {object} veloc [with x,y,z vectors]
         * @return {boolean}
         */
        for (var i = frame.hands.length -1; i >= 0; i--) {
            var hand = frame.hands[i];

            var min_movement = 75;
            var direction = false; // var for saving moving direction of the hand ('right', 'left')

            // add hand (id) to hands object if not existing yet
            if (!uber.last_hands.hasOwnProperty(hand.id)) {
                uber.last_hands[hand.id] = {
                    pos_1:          0,
                    direction:      '',
                    x_at_change:    0
                };
            }
            // TODO: check if last hands object is emptied if hand is gone...

            // save last frames palm position in var for quicker access (faster writing)
            var lh = uber.last_hands[hand.id];

            // check direction for x position
            if (hand.palmPosition[0] > lh.pos_1[0]) {
                direction = 'right';
            } else {
                direction = 'left';
            }

            // track direction change
            // during cancel gesture (fast) ~every 5 frames a direction is changed
            if (direction !== lh.direction) {
                if (lh.x_at_change === 0) {
                    lh.x_at_change = hand.palmPosition[0];
                }
                // check if last direction change is sufficiently far away
                if (Math.abs(lh.x_at_change - hand.palmPosition[0]) > 30) {

                    uber.counts.dir_change_count++; // increase direction change count

                    // set/reset direction change count after a sufficient timespan
                    uber.setTimer({ timeout_id: uber.timeouts.timeout_id_dir_change, flag: undefined, duration: 1600, counter: "dir_change_count"});

                    // check if a certain amount of changes occured
                    if ((uber.counts.dir_change_count > 6) && (!uber.flags.recent_fast_moves)) {
                        // and reset counter
                        uber.counts.dir_change_count = 0;
                        cancel_gesture = true;
                    }
                }

                // save x position right after direction change
                uber.last_hands[hand.id].x_at_change = hand.palmPosition[0];
            }

            // save position to last hands last positions for next frame
            uber.last_hands[hand.id].pos_1      = hand.palmPosition;
            uber.last_hands[hand.id].direction  = direction;
        }

        if (cancel_gesture) {
            if (myLeapApp.debug) {
                console.log("%c - - - - - - - GESTURE:                                    Cancel:", "background: #FF4A00; color: #D5DAD3");
            }
            return true;
        } else {
            return false;
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

            var extendedFingers = uber.fingerInfo[hand.id].total_extended;

            var confidence = hand.confidence;
            if (confidence > 0.5) {

                // only one finger should be extended (thumb) and check for thumb
                if (extendedFingers <= 1 && uber.fingerInfo[hand.id].thumb.extended) {
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
                        // and set timer to reset frame count
                        uber.setTimer({ timeout_id: uber.timeouts.timeout_id_thumb_up, counter: "thumb_up_frames", duration: 900 });

                    }
                } else {
                    uber.flags.thumb_up_gesture = false;
                }

                if (uber.flags.thumb_up_gesture && uber.counts.thumb_up_frames > 20) {
                    if (myLeapApp.debug) {
                        console.log("%c - - - - - - - GESTURE:                                    Thumb Up:", 'background: #75C94B; color: #F7FFF8');
                    }
                    // save to last gesture
                    uber.last_gesture = 'thumb_up';
                    // set/reset timer to erase last gesture var
                    uber.setTimer({ timeout_id: uber.timeouts.timeout_id_last_gesture, var: "last_gesture", duration: 1000 });
                    return true;
                } else {
                    return false;
                }
            } else { // if confidence level was to low
                return false;
            }
        }
    };



    LEAPAPP.GestureChecker.prototype.checkOKGesture = function(frame) {
        var uber = this;
        var all_finger_ok = true; // save info if all fingers are in the correct position

        for (var i = frame.hands.length -1; i >= 0; i--) {
            var hand = frame.hands[i];

            // save last hand in a temp variable
            var last_hand = uber.last_hands_info[hand.id];
            var thumb_pos = Leap.vec3.create();
            var index_pos = Leap.vec3.create();

            var confidence = hand.confidence;
            if (confidence > 0.45) {

                thumb_pos = uber.fingerInfo[hand.id].thumb.tip_pos;
                index_pos = uber.fingerInfo[hand.id].index.tip_pos;

                // check finger extension stati
                if (
                    (uber.fingerInfo[hand.id].thumb.extended) // if thumb is extended
                    || (!uber.fingerInfo[hand.id].middle.extended) // if middle is bent
                    || (!uber.fingerInfo[hand.id].ring.extended) // if ring is bent
                    || (!uber.fingerInfo[hand.id].pinky.extended) // if pinky is bent
                ) { // then set all finger ok to false
                    all_finger_ok = false;
                }


                /**
                 * distance between thumb and index
                 * normally during Ok gesture between 5 – 30
                 * extended index & thumb > distance about 120
                 */
                var distance = Leap.vec3.distance(thumb_pos, index_pos);

                // check if all fingers are ok and if distance is short enough for OK gesture
                if ((all_finger_ok) && (distance < 34)) {
                    console.log("%c - - - - - - - GESTURE:                                    OK Gesture", 'background: #6BC9BD; color: #F7FFF8');
                    return true;
                } else {
                    return false;
                }
            } else {
                return false;
            }
        }
    };



    LEAPAPP.GestureChecker.prototype.checkRotationGesture = function(frame) {
        var uber = this;
        var rotation_gesture = false;

        for (var i = frame.hands.length -1; i >= 0; i--) {
            var hand = frame.hands[i];

            var confidence = hand.confidence;
            var min_duration = 20; // frames how long the rotation gesture must exist to trigger

            if (confidence > 0.5) {

                // test distance between fingers
                var thumb_pos   = Leap.vec3.create();
                var index_pos   = Leap.vec3.create();
                var middle_pos  = Leap.vec3.create();
                var ring_pos    = Leap.vec3.create();
                var pinky_pos   = Leap.vec3.create();

                thumb_pos   = uber.fingerInfo[hand.id].thumb.tip_pos;
                index_pos   = uber.fingerInfo[hand.id].index.tip_pos;
                middle_pos  = uber.fingerInfo[hand.id].middle.tip_pos;
                ring_pos    = uber.fingerInfo[hand.id].ring.tip_pos;
                pinky_pos   = uber.fingerInfo[hand.id].pinky.tip_pos;

                var distance_t_i = Leap.vec3.distance(thumb_pos, index_pos); // distance between thumb and index
                var distance_i_m = Leap.vec3.distance(index_pos, middle_pos);
                var distance_m_r = Leap.vec3.distance(middle_pos, ring_pos);
                var distance_r_p = Leap.vec3.distance(ring_pos, pinky_pos);
                var distance_p_t = Leap.vec3.distance(pinky_pos, thumb_pos);

                $('#leap-info-5').html('dists: <br>' + ' <br>a: ' + Math.twoDecimals(distance_t_i)  + ', ' + ' <br>b: '+ Math.twoDecimals(distance_i_m)  + ', ' + ' <br>c: '+ Math.twoDecimals(distance_m_r)  + ', ' + ' <br>d: '+ Math.twoDecimals(distance_r_p) + ', ' + ' <br>e: '+ Math.twoDecimals(distance_p_t)  ); // if two hands just overwrite first

                if (
                      (distance_t_i > 30 && distance_t_i < 80)
                    &&(distance_i_m > 15 && distance_i_m < 40)
                    &&(distance_m_r > 15 && distance_m_r < 40)
                    &&(distance_r_p > 15 && distance_r_p < 50)
                    &&(distance_p_t > 40 && distance_p_t < 75)

                ) {

                    if (uber.flags.rotation_grab === false) {
                        // save current hand rotation
                        uber.rot_frame = uber.controller.frame();
                        // save current volume from radio
                        uber.rotation_info.volume_at_grab = myLeapApp.radio.current_volume;
                    }
                    // set rotation flag to true
                    uber.flags.rotation_grab = true;
                    // increase the count how long the gesture is present
                    uber.counts.rotation_frames++;
                    // console.log("uber.counts.rotation_frames: ", uber.counts.rotation_frames);



                    // only start calculation if rotation gesture is present since a certain amount of time (frames)
                    if (uber.counts.rotation_frames > min_duration) {
                        // set last gesture
                        uber.last_gesture = 'rotation_grab';
                        // set/reset timer to erase last gesture var
                        uber.setTimer({ timeout_id: uber.timeouts.timeout_id_last_gesture, var: "last_gesture", duration: 1000 });


                        // compare rotation with rotation at beginning of grab gesture
                        // var tot_diff = hand.rotationAngle(uber.rot_frame);
                        uber.rotation_info.angle_diff = hand.rotationAngle(uber.rot_frame, [0,0,1]);
                        // tot_diff = Math.degrees(tot_diff);
                        uber.rotation_info.angle_diff = Math.degrees(uber.rotation_info.angle_diff);
                        uber.rotation_info.angle_diff = Math.twoDecimals(uber.rotation_info.angle_diff);
                        $('#leap-info-6').html('diff' + uber.rotation_info.angle_diff);

                        if (myLeapApp.debug) {
                            console.log("%c - - - - - - - GESTURE:                                    Rotation Grab", 'background: #EC84B6; color: #555856', uber.rotation_info.angle_diff);
                        }
                        rotation_gesture = true;
                    }

                    // reset frames and timer
                    // to bridge unwanted pauses of the gesture
                    uber.setTimer({ timeout_id: uber.timeouts.timeout_id_rotation_frames, flag: 'rotation_grab', duration: 1200, counter: "rotation_frames" });

                } else {
                    // console.log("%c NO ROTATION", "background: #070604; color: #DA5C1B");
                }

                if (rotation_gesture) {
                    return uber.rotation_info;
                } else {
                    return false;
                }
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
                    uber.flags.recent_fast_moves = true;

                    // set timeout to reset the flag: uber.setTimer(timeout, flag to reset, time in ms)
                    uber.setTimer({ timeout_id: uber.timeouts.timeout_id_fast_move, flag: "recent_fast_moves", duration: 450 });
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
    LEAPAPP.GestureChecker.prototype.setTimer = function(options) {
        var uber = this;
        // populate necessary arguments
        var timer_id    = options.timeout_id;
        var flag        = options.flag;
        var duration    = options.duration;
        var counter     = options.counter;
        var var_reset   = options.var;

        // set timeout to reset the flag
        if (uber.timeouts[timer_id]) {
            clearTimeout(uber.timeouts[timer_id]);
        }
        uber.timeouts[timer_id] = setTimeout(function() {
            if (flag) {
                uber.flags[flag]        = false; // reset flag
            }
            if (counter) {
                if(counter == 'rotation_frames') {
                    console.log("%c timer for frames is reset", "background: #FDD187; color: #DA5C1B");
                }
                uber.counts[counter]    = 0; // reset counter
            }
            if (var_reset) { // reset a provided var (e.g last_gesture variable)
                uber[var_reset] = '';
            }
            // console.log("%c uber.flags", "background: #D0E94E; color: #282829", uber.flags);
            // console.log("%c uber.counts", "background: #D0E94E; color: #282829", uber.counts);
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
        gestures.start                  = uber.checkForNewHand(frame);
        gestures.exit                   = uber.checkForHandLeave(frame);
        gestures.interaction            = uber.checkForAnyInteraction(frame);
        gestures.distinct_interaction   = uber.checkForDistinctInteraction(frame);
        gestures.on                     = uber.checkForExplosion(frame);
        gestures.off                    = uber.checkforCollapse(frame);
        gestures.swipe                  = uber.checkSwipe(frame);
        gestures.thumb_up               = uber.checkThumbUpGesture(frame);
        gestures.ok                     = uber.checkOKGesture(frame);
        gestures.cancel                 = uber.checkCancelGesture(frame);
        gestures.rotation               = uber.checkRotationGesture(frame);
        // gestures.fast_moves             = uber.detectFastMovement(frame);

        // save hand to last hand object
        uber.saveLastHand(frame);

        return gestures;
    };






}());




