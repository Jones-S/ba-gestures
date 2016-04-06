/**
 * Submodule of LEAPAPP describing the segment class
 * and within the declared flow
 * @param  {Object} $ jQuery
 * @return {}
 */



LEAPAPP.modules.segment = (function ($, app, global ) { // iief = Immediately-Invoked Function Expression, mainly useful to limit scope

    // Dependencies
    var flags = app.flags;

    function Segment() {
        this.type = 'segment';
    }

    Segment.prototype.say = function(text) {
        console.log("Object says (text): " + text);
    };


}(jQuery, LEAPAPP, this)); // pass jQuery as parameter and pass LEAPAPP to import globals