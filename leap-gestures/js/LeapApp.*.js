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

// use with caution! reloads page on error
window.onerror = function(message, source, lineno, colno, error) {
    console.log("%c ERROR: - - - - - - - - - - - ", "background: #FDD187; color: #DA5C1B");

    // parameters: service_id, template_id, template_parameters
    emailjs.send("gmail", "template_XCJQnjhk",{
        message: JSON.stringify(message, null, 4),
        source: source,
        lineno: lineno,
        colno: colno,
        error: error
    })
    .then(
      function(response) {
        console.log("SUCCESS", response);
        location.reload(); // reload page in any case after error

      },
      function(error) {
        console.log("FAILED", error);
        location.reload(); // reload page in any case after error
      }
    );

};


// extend native prototypes
Number.prototype.map = function (in_min, in_max, out_min, out_max) {
  return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
};