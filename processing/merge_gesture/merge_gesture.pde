import de.voidplus.leapmotion.*;
// import java.util.Map;

LeapMotion leap;

int            frame_count = 0;
int            frame_count_hand = 0;
PVector        position_middle_finger;
PVector        position_ring_finger;
FloatList      distances = new FloatList(); // array with dist values for the last 30 frames


// Note the HashMap's "key" is a String and "value" is an Integer
// HashMap<Integer,Float> hm = new HashMap<Integer,Float>();

void setup(){
    size(800, 500);
    background(255);
    // ...

    leap = new LeapMotion(this).allowGestures(); // All gestures
    // leap = new LeapMotion(this).allowGestures("circle, swipe, screen_tap, key_tap");
    // leap = new LeapMotion(this).allowGestures("swipe"); // Leap detects only swipe gestures


}

void draw(){
    background(255);
    // ...
    if (frame_count > 25) {
        frame_count = 0; // reset frame count
    }
    frame_count ++;


    // add to make hands visible and update screen
    int fps = leap.getFrameRate();



    // ========= HANDS =========

    for (Hand hand : leap.getHands ()) {


        // ----- BASICS -----

        int     hand_id          = hand.getId();
        PVector hand_position    = hand.getPosition();
        PVector hand_stabilized  = hand.getStabilizedPosition();
        PVector hand_direction   = hand.getDirection();
        PVector hand_dynamics    = hand.getDynamics();
        float   hand_roll        = hand.getRoll();
        float   hand_pitch       = hand.getPitch();
        float   hand_yaw         = hand.getYaw();
        boolean hand_is_left     = hand.isLeft();
        boolean hand_is_right    = hand.isRight();
        float   hand_grab        = hand.getGrabStrength();
        float   hand_pinch       = hand.getPinchStrength();
        float   hand_time        = hand.getTimeVisible();
        PVector sphere_position  = hand.getSpherePosition();
        float   sphere_radius    = hand.getSphereRadius();


        frame_count_hand ++;




        // ----- SPECIFIC FINGER -----

        Finger  finger_thumb     = hand.getThumb();
        // or                      hand.getFinger("thumb");
        // or                      hand.getFinger(0);

        Finger  finger_index     = hand.getIndexFinger();
        // or                      hand.getFinger("index");
        // or                      hand.getFinger(1);

        Finger  finger_middle    = hand.getMiddleFinger();
        // or                      hand.getFinger("middle");
        // or                      hand.getFinger(2);

        Finger  finger_ring      = hand.getRingFinger();
        // or                      hand.getFinger("ring");
        // or                      hand.getFinger(3);

        Finger  finger_pink      = hand.getPinkyFinger();
        // or                      hand.getFinger("pinky");
        // or                      hand.getFinger(4);


        // ----- DRAWING -----

        hand.draw();
        // hand.drawSphere();


        // ========= ARM =========

        if (hand.hasArm()) {
            Arm     arm               = hand.getArm();
            float   arm_width         = arm.getWidth();
            PVector arm_wrist_pos     = arm.getWristPosition();
            PVector arm_elbow_pos     = arm.getElbowPosition();
        }


        // ========= FINGERS =========

        for (Finger finger : hand.getFingers()) {
            // Alternatives:
            // hand.getOutstretchedFingers();
            // hand.getOutstretchedFingersByAngle();

            // ----- BASICS -----

            int     finger_id         = finger.getId();
            PVector finger_position   = finger.getPosition();
            PVector finger_stabilized = finger.getStabilizedPosition();
            PVector finger_velocity   = finger.getVelocity();
            PVector finger_direction  = finger.getDirection();
            float   finger_time       = finger.getTimeVisible();


            // ----- SPECIFIC FINGER -----

            switch(finger.getType()) {
            case 0:
                // System.out.println("thumb");
                break;
            case 1:
                // System.out.println("index");
                break;
            case 2:
                // System.out.println("middle");
                if (frame_count == 1){
                    // System.out.println("Middle Finger Pos: " + finger_position);
                }
                position_middle_finger = finger_position; // save the pos in the float var to determine distance later on
                break;
            case 3:
                if (frame_count == 1){
                    // System.out.println("Ring Finger Pos: " + finger_position);
                }
                position_ring_finger = finger_position; // save the pos in the float var
                // System.out.println("ring");
                break;
            case 4:
                // System.out.println("pinky");
                break;
            }

        }


        // ========= CALCULATIONS =========
        // get the distance between ring and middle finger
        float finger_distance = PVector.dist(position_middle_finger, position_ring_finger);
        if (frame_count == 1){
            // System.out.println("Distance:          " + finger_distance);
        }
        // use distance to determine if merge gesture is executed
        distances.append(finger_distance);

        // save distances into array
        if ((frame_count_hand % 30) == 0){
            System.out.println(distances.size());
            println(distances);
        }

        // delete older distance values from list
        if (distances.size() > 35) {
            distances.remove(0); // remove first
        }

        // System.out.println("FRAMECOUNT HAND: " +frame_count_hand);





        // ========= TOOLS =========

        for (Tool tool : hand.getTools()) {


            // ----- BASICS -----

            int     tool_id           = tool.getId();
            PVector tool_position     = tool.getPosition();
            PVector tool_stabilized   = tool.getStabilizedPosition();
            PVector tool_velocity     = tool.getVelocity();
            PVector tool_direction    = tool.getDirection();
            float   tool_time         = tool.getTimeVisible();


            // ----- DRAWING -----

            // tool.draw();


            // ----- TOUCH EMULATION -----

            int     touch_zone        = tool.getTouchZone();
            float   touch_distance    = tool.getTouchDistance();

            switch(touch_zone) {
            case -1: // None
                break;
            case 0: // Hovering
                // println("Hovering (#"+tool_id+"): "+touch_distance);
                break;
            case 1: // Touching
                // println("Touching (#"+tool_id+")");
                break;
            }
        }
    }


    // ========= DEVICES =========

    for (Device device : leap.getDevices()) {
        float device_horizontal_view_angle = device.getHorizontalViewAngle();
        float device_verical_view_angle = device.getVerticalViewAngle();
        float device_range = device.getRange();
    }



}


// // ----- SWIPE GESTURE -----

// void leapOnSwipeGesture(SwipeGesture g, int state){
//   int     id               = g.getId();
//   Finger  finger           = g.getFinger();
//   PVector position         = g.getPosition();
//   PVector position_start   = g.getStartPosition();
//   PVector direction        = g.getDirection();
//   float   speed            = g.getSpeed();
//   long    duration         = g.getDuration();
//   float   duration_seconds = g.getDurationInSeconds();

//   switch(state){
//     case 1:  // Start
//       break;
//     case 2: // Update
//       break;
//     case 3: // Stop
//       println("SwipeGesture: "+id);
//       break;
//   }
// }


// // ----- CIRCLE GESTURE -----

// void leapOnCircleGesture(CircleGesture g, int state){
//   int     id               = g.getId();
//   Finger  finger           = g.getFinger();
//   PVector position_center  = g.getCenter();
//   float   radius           = g.getRadius();
//   float   progress         = g.getProgress();
//   long    duration         = g.getDuration();
//   float   duration_seconds = g.getDurationInSeconds();
//   int     direction        = g.getDirection();

//   switch(state){
//     case 1:  // Start
//       break;
//     case 2: // Update
//       break;
//     case 3: // Stop
//       println("CircleGesture: "+id);
//       break;
//   }

//   switch(direction){
//     case 0: // Anticlockwise/Left gesture
//       break;
//     case 1: // Clockwise/Right gesture
//       break;
//   }
// }


// // ----- SCREEN TAP GESTURE -----

// void leapOnScreenTapGesture(ScreenTapGesture g){
//   int     id               = g.getId();
//   Finger  finger           = g.getFinger();
//   PVector position         = g.getPosition();
//   PVector direction        = g.getDirection();
//   long    duration         = g.getDuration();
//   float   duration_seconds = g.getDurationInSeconds();

//   println("ScreenTapGesture: "+id);
// }


// // ----- KEY TAP GESTURE -----

// void leapOnKeyTapGesture(KeyTapGesture g){
//   int     id               = g.getId();
//   Finger  finger           = g.getFinger();
//   PVector position         = g.getPosition();
//   PVector direction        = g.getDirection();
//   long    duration         = g.getDuration();
//   float   duration_seconds = g.getDurationInSeconds();

//   println("KeyTapGesture: "+id);
// }









