/**
 * Define globals which are available accross the different files
 * and allow to set gesture-flags in leap-gestures.js
 * and simultaneously register them in flow.js
 */

// create everything in 1 object to keep global namespace free
// LMG = Leap Micro Gestures Bachelor of Arts

var LMGBA = LMGBA || {}; // ~same as: if(typeof LMGBA === 'undefined'){ var LMGBA = {}; }

// container for all the gesture flags
LMGBA.gestures = {
    thumb_up:           false,
    cancel_gesture:     false
};

// holds all segments with their specs
LMGBA.segments = {
    seg0: {
        conditions: ['any_gesture'], // conditions to ask for
        triggers:    ['seg1'] // will trigger that
    },
    seg1: {
        say: "Oh I registered the first gesture.",

    }
};

LMGBA.currentSeg = 'seg0'; // initial setup segment

