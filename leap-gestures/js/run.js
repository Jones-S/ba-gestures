(function ($, app) { // iief = Immediately-Invoked Function Expression, mainly useful to limit scope
    $(function() { // Shorthand for $( document ).ready()

        var flow = {
            seg0: {
                fns: {
                    checkAnyGesture: function () {
                        if (LEAPAPP.gestures.thumb_up) {
                            this.say("Oh I registered the first gesture.");
                        }
                    },
                    setNewSeg: function () {
                        LEAPAPP.currentSeg = 'seg1';
                    }
                }
            },
            seg1: {
                fns: {
                    // this.say("Oh thats cool and its the text of seg1");
                }
            }
        };

        // Object.create > creates an object without going through its constructor
        // Only the prototype is used
        var myLeapApp = Object.create(LEAPAPP.Controller.prototype, {
            //value properties
            name: {writable: true, configurable:true, value: 'myLeapAppController'}
        });
        myLeapApp.init(flow);
        myLeapApp.startTracking();

        return myLeapApp;

    });
}(jQuery, LEAPAPP));