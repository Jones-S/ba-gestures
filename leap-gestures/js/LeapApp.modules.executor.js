/**
 * Submodule of LEAPAPP describing the executor method
 * @return {functions} ?
 */



LEAPAPP.modules.executor = (function ($, app, global ) { // iief = Immediately-Invoked Function Expression, mainly useful to limit scope

    /**
     * executor is called on every frame and
     * triggers the segments code fragments
     * @type {Object}
     */
    LEAPAPP.executor = {
        subscriber_segs: [], // subscribed segments
        execute: function (seg) {
            for (var i = seg.fns.length - 1; i >= 0; i--) {
                seg.fns[i]();
            }
        }
    };


}(jQuery, LEAPAPP, this)); // pass jQuery as parameter and pass LEAPAPP to import globals

