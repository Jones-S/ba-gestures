(function ($, app) { // iief = Immediately-Invoked Function Expression, mainly useful to limit scope
    $(function() { // Shorthand for $( document ).ready()

    var flow = {
        seg0: {
            fns: {
                checkAnyGesture: function () {
                    if (LEAPAPP.gestures.thumb_up) {
                        say("Oh I registered the first gesture.");
                    }
                },
                setNewSeg: function () {
                    LEAPAPP.currentSeg = 'seg1';
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


    // var myLeapApp = new LEAPAPP.Controller();
    var myLeapApp = Object.create(LEAPAPP.Controller.prototype);
    myLeapApp.init();
    myLeapApp.startTracking();

    });
}(jQuery, LEAPAPP));