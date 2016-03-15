import de.voidplus.leapmotion.*;
// import java.util.Map;

LeapMotion leap;

int             CANVAS_WIDTH = 800;
int             CANVAS_HEIGHT = 500;
int             ANIMATION_STEP = 5; // = speed (px per frame)

int             frame_count = 0;
int             rect_small_width = 30;
PVector         position_middle_finger;
PVector         position_ring_finger;
FloatList       distances = new FloatList(); // array with dist values for the last 30 frames
boolean         merge_gesture_active = false;
boolean         animation_on = false;




// Note the HashMap's "key" is a String and "value" is an Integer
// HashMap<Integer,Float> hm = new HashMap<Integer,Float>();

void setup(){
    surface.setSize(CANVAS_WIDTH, CANVAS_HEIGHT);
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

    // draw two rectangles moving together if merge gesture is active
    fill(236, 216, 27, 255);
    noStroke();
    rect(0, 0, rect_small_width, CANVAS_HEIGHT);
    rect(CANVAS_WIDTH - rect_small_width, 0, rect_small_width, CANVAS_HEIGHT);

    // animate rectangles if merge gesture was registered
    if (animation_on) {
        rect_small_width += ANIMATION_STEP;
        if (rect_small_width > CANVAS_WIDTH/2) {
            animation_on = false;
        }
    } else {
        if (rect_small_width > 30) {
            rect_small_width -= ANIMATION_STEP;
        }
    }



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


        // delete older distance values from list
        if (distances.size() > 35) {
            distances.remove(0); // remove first
        }


        // check if distance is lower than 40 (finger touching)
        if (finger_distance < 37) {
            // then check if the distance was above 100 in the past 0.5s
            for (int i = 0; i < distances.size(); ++i) {
                float past_value = distances.get(i);
                // check if the value was > 100
                if (past_value > 90 && merge_gesture_active != true) {
                    println("HOORAY we registered a gesture right now");
                    merge_gesture_active = true;
                    animation_on = true; // start animation
                }
            }
        } else {
            merge_gesture_active = false;
        }

        // ========= TEXT ==========
        // write text with current distance to canvas
        textSize(12);
        String distance_text = "distance: " + finger_distance;
        text(distance_text, 30, 30);
        String gesture_text;
        if (merge_gesture_active){
            gesture_text = "Merge Gesture: Active";
        } else {
            gesture_text = "Merge Gesture: Not Active";
        }
        text(gesture_text , 30, 50);




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

