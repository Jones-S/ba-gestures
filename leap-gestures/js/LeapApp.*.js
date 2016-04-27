/**
 * Define globals which are available accross the different files
 * and allow to set gesture-flags in leap-gestures.js
 * and simultaneously register them in flow.js
 */

// create everything in 1 object to keep global namespace free
// LEAPAPP = Leap Micro Gestures Bachelor of Arts

var LEAPAPP     = LEAPAPP || {}; // ~same as: if(typeof LEAPAPP === 'undefined'){ var LEAPAPP = {}; }

// Object container for modules
LEAPAPP.modules = {};
LEAPAPP.segments = [];

// one line function to add F12 pause script functionality
$(window).keydown(function(e) { if (e.keyCode == 123) debugger; });
