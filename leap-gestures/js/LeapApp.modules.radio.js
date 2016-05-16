(function() {

    function completeFilePath(directory, files) {
        var tracks = [];

        // looping reversly. File order will be in reverse
        for (var i = files.length - 1; i >= 0; i--) {
            var file = directory + files[i];
            tracks.push(file);
        }
        return tracks;
    }


    /**
     * Radio is necessary for playing and controlling the music played in the radio
     */
    LEAPAPP.Radio = function() {
        // constructor

        if (myLeapApp.music_folder == 'marek') {
            this.files = [
                'mh_00001.mp3',
                'mh_00002.mp3',
                'mh_00003.mp3',
                'mh_00004.mp3',
                'mh_00005.mp3',
                'mh_00006.mp3',
                'mh_00007.mp3',
                'mh_00008.mp3'
            ];
        } else if (myLeapApp.music_folder == 'classics') {
            this.files = [
                'ec_layla.mp3',
                'jh_blues.mp3',
                'jjc_call_me.mp3',
                'ad_he_wont.mp3',
                'nj_goodbye.mp3',
                'paint_it.mp3',
                'tribe_award.mp3',
                'rhcp_cabron.mp3',
                'uh_lady.mp3',
                'racon_steady.mp3',
                'dire_sultan.mp3'
            ];
        }

        this.folder = "audio/tracks/" + myLeapApp.music_folder + '/';
        this.files = completeFilePath(this.folder, this.files);
        console.log("this.files: ", this.files);

        this.current_track          = 0;
        this.current_playback_id    = undefined;
        // playlistUrls = [
        //         "./audio/cmn-ni3.mp3",
        //         "./audio/cmn-hao3.mp3",
        //         "./audio/cmn-lao3.mp3",
        //         "./audio/cmn-mao3.mp3"
        //     ], // audio list
        this.howler_bank = [];
        this.current_volume = 0.5   ; // from 0.01 to 1.0
        var uber = this;

        // build up howler_bank:
        this.files.forEach(function(current, i) {
            uber.howler_bank.push(new Howl({
                src: [uber.files[i]],
                // execute onEnd when finished and bind this(=uber) context
                // otherwise the this in the function onEnd will refer to the Howl context
                onend: uber.onEnd.bind(uber),
                preload: true,
                // html5: true,
                volume: uber.current_volume
            }));
        });


    };







    LEAPAPP.Radio.prototype.play = function() {

        var uber = this;
        var song = uber.howler_bank[uber.current_track];
        if (!song.playing()){
            // set the volume before playing
            song.volume(uber.current_volume);
            song.play();
        }

    };


    LEAPAPP.Radio.prototype.pause = function() {
        var uber = this;
        uber.howler_bank[uber.current_track].pause();

    };

    LEAPAPP.Radio.prototype.isPlaying = function() {
        var uber = this;
        var song = uber.howler_bank[uber.current_track];
        if (song.playing()){
            return true;
        } else {
            return false;
        }

    };

    LEAPAPP.Radio.prototype.nextTrack = function() {
        var uber = this;
        uber.howler_bank[uber.current_track].stop();
        uber.current_track = (uber.current_track + 1 !== uber.howler_bank.length) ? uber.current_track + 1 : 0;
        uber.play();


    };

    LEAPAPP.Radio.prototype.previousTrack = function() {
        var uber = this;
        uber.howler_bank[uber.current_track].stop();
        uber.current_track = (uber.current_track - 1 >= 0  ) ? uber.current_track - 1 : uber.howler_bank.length - 1;
        uber.play();
    };

    LEAPAPP.Radio.prototype.volumeUp = function() {
        var uber = this;
        // change current volume
        if (uber.current_volume < 1.0) {
            uber.current_volume += 0.05;
        }
        uber.howler_bank[uber.current_track].volume(uber.current_volume);
    };

    LEAPAPP.Radio.prototype.volumeDown = function() {
        var uber = this;
        if (uber.current_volume > 0.1) {
            uber.current_volume -= 0.05;
        }
        uber.howler_bank[uber.current_track].volume(uber.current_volume);
    };

    LEAPAPP.Radio.prototype.setVolume = function(rotation_info) {
        var uber = this;
        // only adjust volume if track is playing
        var song = uber.howler_bank[uber.current_track];

        var angle = rotation_info.angle_diff;
        var vol = rotation_info.volume_at_grab;
        var mapped_volume = uber.current_volume; // set mapped volume to current volume initially

        // map range 1 (<0 = left turn)
        if (angle < 0) {
            mapped_volume = angle.map(-50, 0, 0.1, vol);
            mapped_volume = (mapped_volume < 0.1) ? 0.1 : mapped_volume; // if smaller than 0.1 reset to 0.1
            // console.log("< 0: left: mapped_volume: ", mapped_volume);
        }
        // right turn of hand
        else {
            mapped_volume = angle.map(0, 50, vol, 1.0);
            mapped_volume = (mapped_volume > 1.0) ? 1.0 : mapped_volume;
            // console.log("> 0: right: mapped_volume: ", mapped_volume);
        }

        // check difference between the current volume and the incoming volume
        // round first for easier comparison
        var round_current = Math.round(uber.current_volume * 10) / 10;
        var round_mapped  = Math.round(mapped_volume  * 10) / 10;

        // rounded values range from 0.1 – 1.0 and increment by 0.1
        // if current - mapped is != 0 (which means it's bigger or smaller)
        // the click sound will be played
        // if the difference is bigger than 0.2 then for every increment it will play a click
        if (Math.abs(round_current - round_mapped) > 0) {
            myLeapApp.sounder.play('vol');
        }

        console.log("round_current: ", round_current);
        console.log("round_mapped: ", round_mapped);

        if (uber.current_volume - mapped_volume) {}
        // assign volume back to radio
        uber.current_volume = mapped_volume;
        uber.howler_bank[uber.current_track].volume(uber.current_volume);

    };



    // playing i+1 audio (= chaining audio files)
    LEAPAPP.Radio.prototype.onEnd = function() {
        var uber = this;
        // check if current track is more than number of all tracks, otherwise reset to 0
        uber.current_track = (uber.current_track + 1 > (uber.howler_bank.length - 1)) ? 0 : uber.current_track + 1;
        uber.play();
    };

}());
