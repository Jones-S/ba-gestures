(function() {

    /**
     * Sound is necessary for playing confirmatory sounds
     * and other interface related sounds.
     */
    LEAPAPP.Sound = function() {
        // constructor
        this.sound_on           = new Howl({ src: ['audio/mp3/on.mp3'], preload: true, volume: 1.0 });
        this.sound_off          = new Howl({ src: ['audio/mp3/off.mp3'], preload: true, volume: 1.0 });
        this.sound_vol          = new Howl({ src: ['audio/wav/volume.wav'], preload: true, volume: 0.45 });
        this.sound_dock_on      = new Howl({ src: ['audio/wav/vol_docking.wav'], preload: true, volume: 0.9 });
        this.sound_dock_off     = new Howl({ src: ['audio/wav/vol_docking_off.wav'], preload: true, volume: 0.9 });
        this.sound_cancel       = new Howl({ src: ['audio/wav/cancel.wav'], preload: true, volume: 1.0 });
        this.sound_ok           = new Howl({ src: ['audio/wav/ok.wav'], preload: true, volume: 1.0 });
        this.sound_next         = new Howl({ src: ['audio/wav/swipe_right.wav'], preload: true, volume: 1.0 });
        this.sound_prev         = new Howl({ src: ['audio/wav/swipe_left.wav'], preload: true, volume: 1.0 });
        this.sound_start        = new Howl({ src: ['audio/wav/hover_in.wav'], preload: true, volume: 1.0 });
        this.sound_exit         = new Howl({ src: ['audio/wav/hover_out.wav'], preload: true, volume: 1.0 });

    };





    LEAPAPP.Sound.prototype.play = function(sound) {
        var uber = this;

        // check if sounds should be played on this computer or on another one via shiftr
        if (myLeapApp.ext_sounds) {
            switch(sound) {
                case 'on':
                    myLeapApp.shiftr.publish('/sound', 'on');
                    break;
                case 'off':
                    myLeapApp.shiftr.publish('/sound', 'off');
                    break;
                case 'vol':
                    myLeapApp.shiftr.publish('/sound', 'vol');
                    break;
                case 'dock_on':
                    myLeapApp.shiftr.publish('/sound', 'dock_on');
                    break;
                case 'dock_off':
                    myLeapApp.shiftr.publish('/sound', 'dock_off');
                    break;
                case 'cancel':
                    myLeapApp.shiftr.publish('/sound', 'cancel');
                    break;
                case 'ok':
                    myLeapApp.shiftr.publish('/sound', 'ok');
                    break;
                case 'next':
                    myLeapApp.shiftr.publish('/sound', 'next');
                    break;
                case 'prev':
                    myLeapApp.shiftr.publish('/sound', 'prev');
                    break;
                case 'start':
                    myLeapApp.shiftr.publish('/sound', 'start');
                    break;
                case 'exit':
                    myLeapApp.shiftr.publish('/sound', 'exit');
                    break;
                default:
                    // do nothing
                    break;
            }
        } else {
            switch(sound) {
            case 'on':
                uber.sound_on.play();
                break;
            case 'off':
                uber.sound_off.play();
                break;
            case 'vol':
                uber.sound_vol.play();
                break;
            case 'dock_on':
                uber.sound_dock_on.play();
                break;
            case 'dock_off':
                uber.sound_dock_off.play();
                break;
            case 'cancel':
                uber.sound_cancel.play();
                break;
            case 'ok':
                uber.sound_ok.play();
                break;
            case 'next':
                uber.sound_next.play();
                break;
            case 'prev':
                uber.sound_prev.play();
                break;
            case 'start':
                console.log("start");
                uber.sound_start.play();
                break;
            case 'exit':
                console.log("stop");
                uber.sound_exit.play();
                break;
            default:
                // do nothing
                break;
        }
        }


    };

}());
