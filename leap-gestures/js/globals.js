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

LMGBA.currentSeg = 'seg0'; // initial setup segment

// holds all segments with their specs
LMGBA.segments = {
    seg0: {
        fns: {
            checkAnyGesture: function () {
                if (LMGBA.gestures.thumb_up) {
                    say("Oh I registered the first gesture.");
                }
            },
            setNewSeg: function () {
                LMGBA.currentSeg = 'seg1';
            }
        }
    },
    seg1: {
        fns: {
            echoSomething: function() {
                console.log("Ok second segment reached");
            }
        }
    }
};

/**
 * executor is called on every frame and
 * triggers the segments code fragments
 * @type {Object}
 */
LMGBA.executor = {
    subscriber_segs: [], // subscribed segments
    execute: function (seg) {
        for (var i = seg.fns.length - 1; i >= 0; i--) {
            seg.fns[i]();
        }
    }
};


