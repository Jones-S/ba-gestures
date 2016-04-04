(function ($) { // iief = Immediately-Invoked Function Expression, mainly useful to limit scope
    $(function() { // Shorthand for $( document ).ready()

        var ctx; // canvas 2d drawing context
        var w = 1024, h = 768;
        var canvas;
        var thumb_up = false, cancel_gesture = false;
        var recent_fast_moves = false;
        var change_count = 0; // counting direction change of cancel gesture
        var controller = new Leap.Controller({ frameEventName: 'animationFrame' });
        var dir_change_timeout, fast_mov_timout; // timeouts

        var last_frame = {
            l_velocity : 0
        };
        controller.connect();

        // assigns the info of the current frame to the var 'frame'.
        // frame(1) would call the second last frame info and so on
        controller.on('frame', function(frame){
            // get 2d drawing context for our canvas if
            // it hasn't been set up yet
            if (!ctx) {
                canvas = document.getElementById("drawing");
                ctx = canvas.getContext('2d');
            }

            /*
            if fingers detected draw them on canvas
            */
            if (frame.pointables.length) {
                // blank out canvas
                ctx.clearRect(0, 0, w, h);
                drawFingerTips(frame.pointables);
            }

            // check if thumb gesture is made
            checkThumbUpGesture(frame);
            // check cancel gesture
            checkCancelGesture(frame);

        });

        function checkCancelGesture(frame) {

            // TODO: Maybe need to check for fingers.extended
            // so that a shaking fist is not registered as cancel

            /**
             * function to check if velocity is higher
             * than a certain threshold
             * @param  {object} veloc [with x,y,z vectors]
             * @return {boolean}
             */
            var detectFastMovement = function (veloc) {
                /**
                 * loop through all vectors in velocity (x,y,z)
                 * compare absolute value of number with a threshold-speed
                 * if value is bigger, return true (fast Movement detected)
                 */
                loop:
                for (var i = veloc.length - 1; i >= 0; i--) {
                    if (Math.abs(veloc[i]) > 600) {
                        return true;
                    }
                }
                return false;


            };

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
                var lv = last_frame['l_velocity'];

                /**
                 * check if very fast movement is in one of the 3 vectors
                 * @return {boolean}
                 */
                if (detectFastMovement(velocity)) {
                    // set timer to reset fastMovement boolean
                    recent_fast_moves = true;
                    clearTimeout(fast_mov_timout);
                    fast_mov_timout = setTimeout(function(){
                        recent_fast_moves = false;
                    }, 900);
                }

                // debug log
                console.log("lv[0]: " + lv[0] + "\t\t\t\tvelocity[0]: " + velocity[0] + "\t\t\t\tlv[2]: " + lv[2] + "\t\t\t\tvelocity[2]: " + velocity[2] );


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

                    console.log("Direction Changed");
                    change_count++;

                    /**
                     * if change count is big enough
                     * and if no fast moves registered recently
                     * (which would mean somebody could be swiping)
                     * then trigger cancel gesture
                     */
                    if (change_count > 4 && !recent_fast_moves) {
                        cancel_gesture = true;
                    }

                    // set timeOut. if 1s is over without a direction change
                    // count is reset.
                    clearTimeout(dir_change_timeout);
                    dir_change_timeout = setTimeout(function() {
                        change_count = 0;
                        // also reset gesture
                        cancel_gesture = false;
                    }, 1000);
                }
                // save velocity to last_frame for change detection in next frame
                last_frame['l_velocity'] = velocity;

                // change browser window
                if (cancel_gesture) {
                    $('body').addClass('cancel');
                } else {
                    $('body').removeClass('cancel');
                }

                // show hint in browser
                if (recent_fast_moves) {
                    $('body').addClass('fast-moves');
                } else {
                    $('body').removeClass('fast-moves');
                }

            }



        }

        function checkThumbUpGesture(frame) {
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
                    if(finger.extended && finger_name !== "thumb") {
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
                        thumb_up = true;
                    }
                } else {
                    thumb_up = false;
                }

                // show thumb up gesture in browser
                if (thumb_up) {
                    $('body').addClass('thumb-up');
                } else {
                    $('body').removeClass('thumb-up');
                }
            }
        }


        function drawFingerTips(pointables) {

            for (var i = pointables.length - 1; i >= 0; i--) {
                var pointable = pointables[i];


                // do we know where the tip of the finger or tool is
                // located?
                var tip = pointable.tipPosition;
                if (!tip) return;
                // get x/y/z coordinates of pointable tips
                // and convert to coordinates that roughly
                // live inside of the canvas dimensions.
                var x = tip[0]*2 + w/2;
                var y = -tip[1] + h/2;
                // use depth to control the radius of the circle
                // being drawn
                var radius = (-tip[2] + 100) / 6;  // random numbers lol
                if (radius < 10) radius = 10;      // not too small!
                // begin drawing circle
                ctx.beginPath();
                // centered at (x,y) with radius scaled by depth, in a full arc
                ctx.arc(x, y, radius, 0 , 2 * Math.PI, false);
                ctx.lineWidth = 5;
                // color based on which hand it is
                var g = i % 2 ? 200 : 0;
                ctx.strokeStyle = "rgb(120," + g + ",35)";
                // draw circle
                ctx.stroke();
            }
        }



    });
}(jQuery));
//# sourceMappingURL=maps/all.js.map
