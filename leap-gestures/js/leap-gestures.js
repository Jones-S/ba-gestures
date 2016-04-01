(function ($) { // iief = Immediately-Invoked Function Expression, mainly useful to limit scope
    $(function() { // Shorthand for $( document ).ready()

        var ctx; // canvas 2d drawing context
        var w = 1024, h = 768;
        var canvas;
        var thumb_up = false;
        var controller = new Leap.Controller({ frameEventName: 'animationFrame' });
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
            // checkCancelGesture(frame);

        });

        function checkCancelGesture(frame) {

            for (var i = frame.hands.length -1; i >= 0; i--) {
                var hand = frame.hands[i];
                var direction = hand.direction;
                console.log(direction[0]);
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