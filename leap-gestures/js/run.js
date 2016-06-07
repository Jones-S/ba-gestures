(function ($, app) { // iief = Immediately-Invoked Function Expression, mainly useful to limit scope
    /**
     * Dependencies: jQuery, LEAPAPP
     * LEAPAPP = app for shorter compiling result
     */
    $(function() { // Shorthand for $( document ).ready()
        // var flow = RADIOFLOW;
        var flow = VENTILATORFLOW;
        // var flow = LAMPFLOW;
        // TODO: only check for explode and collapse and not for volume in lampflow .e.g
        // Set options for the leap app
        var controller_options = {
            debug:              true,
            flow:               flow,
            start_seg:          'seg0',
            mqtt_uri:           'mqtt://e0b7ded5:04f776d89819bfdb@broker.shiftr.io',
            client_id:          'jonas laptop xxx',
            typewriter:         false,
            gesture_option:     true,
            music_folder:       'classics',
            ext_sounds:         false // is set differently afterwards
        };

        // only ventilator has internal sounds. other two send via shiftr.
        if (flow == RADIOFLOW || flow == VENTILATORFLOW) {
            controller_options.ext_sounds = true;
        }

        // change shiftr name depending on flow
        if (flow == RADIOFLOW){
            controller_options.client_id = 'laptop radio';
        }
        else if (flow == LAMPFLOW) {
            controller_options.client_id = 'laptop lamp';
        }
        else if (flow == VENTILATORFLOW) {
            controller_options.client_id = 'laptop ventilator';
        }






        var myLeapApp = new LEAPAPP.Controller(controller_options);
        window.myLeapApp = myLeapApp;
        myLeapApp.init();
        console.log(myLeapApp.name + " initialized.");


    });
}(jQuery, LEAPAPP));