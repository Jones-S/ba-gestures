(function ($, app) { // iief = Immediately-Invoked Function Expression, mainly useful to limit scope
    /**
     * Dependencies: jQuery, LEAPAPP
     * LEAPAPP = app for shorter compiling result
     */
    $(function() { // Shorthand for $( document ).ready()
        var flow = RADIOFLOW;
        // Set options for the leap app
        var controller_options = {
            debug:      true,
            flow:       flow,
            start_seg:  'seg3',
            mqtt_uri:   'mqtt://e0b7ded5:04f776d89819bfdb@broker.shiftr.io',
            client_id:  'jonas laptop'
        };






        var myLeapApp = new LEAPAPP.Controller(controller_options);
        window.myLeapApp = myLeapApp;
        myLeapApp.init();
        console.log(myLeapApp.name + " initialized.");


        $("body").on( "click", function() {
            if (!myLeapApp.lamp_on) {
                myLeapApp.shiftr.publish('/lamp', 'on');
                myLeapApp.lamp_on = true;
                console.log("on");
            } else {
                myLeapApp.shiftr.publish('/lamp', 'off');
                myLeapApp.lamp_on = false;
                console.log("off");
            }
        });
    });
}(jQuery, LEAPAPP));