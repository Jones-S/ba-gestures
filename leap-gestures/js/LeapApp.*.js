/**
 * Define globals which are available accross the different files
 * and allow to set gesture-flags in leap-gestures.js
 * and simultaneously register them in flow.js
 */

// create everything in 1 object to keep global namespace free
// LEAPAPP = Leap Micro Gestures Bachelor of Arts

var LEAPAPP     = LEAPAPP || {}; // ~same as: if(typeof LEAPAPP === 'undefined'){ var LEAPAPP = {}; }

LEAPAPP.debug           = true;

// Object container for modules
LEAPAPP.modules = {};
LEAPAPP.segments = [];

// container for all the gesture flags
LEAPAPP.flags = {
    thumb_up:           false,
    cancel_gesture:     false
};

LEAPAPP.flow            = {};
LEAPAPP.currentSeg      = ""; // initial setup segment
// LEAPAPP.draw            = true; // true: draw finger, false: don't
LEAPAPP.draw            = false; // true: draw finger, false: don't




