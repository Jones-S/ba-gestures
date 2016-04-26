(function() {

    /**
     * Sound is necessary for playing confirmatory sounds
     * and other interface related sounds.
     */
    LEAPAPP.Sound = function() {
        // constructor
        this.sound_on      = new Audio('audio/on.mp3');
        this.sound_off     = new Audio('audio/off.mp3');
        this.sound_vol     = new Audio('audio/volume.mp3');
        this.sound_cancel  = new Audio('audio/cancel.mp3');
        this.sound_ok      = new Audio('audio/ok.mp3');
        this.sound_next    = new Audio('audio/swipe_right.mp3');
        this.sound_prev    = new Audio('audio/swipe_left.mp3');
        this.sound_start   = new Audio('audio/hover_in.mp3');
        this.sound_exit    = new Audio('audio/hover_out.mp3');

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
