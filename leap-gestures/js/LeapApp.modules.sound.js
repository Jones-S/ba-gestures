(function() {

    /**
     * Sound is necessary for playing confirmatory sounds
     * and other interface related sounds.
     */
    LEAPAPP.Sound = function() {
        // constructor
        this.sound_on      = new Howl({ urls: ['audio/on.mp3'], volume: 0.65 });
        this.sound_off     = new Howl({ urls: ['audio/off.mp3'], volume: 0.65 });
        this.sound_vol     = new Howl({ urls: ['audio/volume.mp3'], volume: 0.65 });
        this.sound_cancel  = new Howl({ urls: ['audio/cancel.mp3'], volume: 0.65 });
        this.sound_ok      = new Howl({ urls: ['audio/ok.mp3'], volume: 0.65 });
        this.sound_next    = new Howl({ urls: ['audio/swipe_right.mp3'], volume: 0.65 });
        this.sound_prev    = new Howl({ urls: ['audio/swipe_left.mp3'], volume: 0.65 });
        this.sound_start   = new Howl({ urls: ['audio/hover_in.mp3'], volume: 0.65 });
        this.sound_exit    = new Howl({ urls: ['audio/hover_out.mp3'], volume: 0.65 });

    };

    LEAPAPP.Sound.prototype.play = function(sound) {
        var uber = this;

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
                uber.sound_start.play();
                break;
            case 'exit':
                uber.sound_exit.play();
                break;
            default:
                // do nothing
                break;
        }
    };

}());
