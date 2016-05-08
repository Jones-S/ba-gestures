(function ($, app) { // iief = Immediately-Invoked Function Expression, mainly useful to limit scope
    /**
     * Dependencies: jQuery, LEAPAPP
     * LEAPAPP = app for shorter compiling result
     */
    $(function() { // Shorthand for $( document ).ready()
        var flow = RADIOFLOW;
        // var flow = VENTILATORFLOW;
        // var flow = LAMPFLOW;
        // Set options for the leap app
        var controller_options = {
            debug:              true,
            flow:               flow,
            start_seg:          'seg2',
            mqtt_uri:           'mqtt://e0b7ded5:04f776d89819bfdb@broker.shiftr.io',
            client_id:          'jonas laptop',
            typewriter:         false,
            gesture_option:     true,
            ext_sounds:         true
        };






        var myLeapApp = new LEAPAPP.Controller(controller_options);
        window.myLeapApp = myLeapApp;
        myLeapApp.init();
        console.log(myLeapApp.name + " initialized.");


    });
}(jQuery, LEAPAPP));