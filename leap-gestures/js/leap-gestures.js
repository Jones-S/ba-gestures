(function ($) { // iief = Immediately-Invoked Function Expression, mainly useful to limit scope
    $(function() { // Shorthand for $( document ).ready()

        var ctx; // canvas 2d drawing context
        var w = 1024, h = 768;
        var canvas;
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


            /*
            check if thumb is extended and all other fingers are folded
             */
            var hands = frame.hand;
            for (var i = frame.hands.length -1; i >= 0; i--) {
                var thumb = frame.hands[i].thumb;
                var hand = frame.hands[i];
                // fif thumb is extended check other fingers
                if (thumb.extended) {
                    console.log("thumb extended");
                    // for each finger check if extended, otherwise break
                    var j = hand.fingers.length - 1;
                    while (j >= 0) {
                        if(hand.fingers[j].extended) {
                            break; // break while loop if one finger is extended
                        }
                        j--;
                    }
                    // check if 0 fingers except thumb is extended
                    if(j == 1) {
                        console.log("THUMB UP");
                    }
                }
            }
        });



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