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

    Number.prototype.map = function (in_min, in_max, out_min, out_max) {
      return (this - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    };

    /**
     * Radio is necessary for playing and controlling the music played in the radio
     */
    LEAPAPP.Radio = function() {
        // constructor
        this.files = [
            // '01-Steady-As-She-Goes.mp3',
            // '1-02-Full-Clip.mp3',
            // '02-Cream-on-Chrome.mp3',
            '06-Illegalize-It.mp3',
            '06-Money.mp3',
            '07-Schickt-mir-die-Post.m4a',
            '12-Haschisch-Kakalake.mp3',
            'Mistral.mp3',
            'Keine-Ahnung.mp3',
            '05-Stay-Cool.mp3'
        ];

        this.folder = "audio/tracks/";
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
        this.current_volume = 0.7; // from 0.01 to 1.0
        var uber = this;

        // build up howler_bank:
        this.files.forEach(function(current, i) {
            uber.howler_bank.push(new Howl({
                urls: [uber.files[i]],
                // execute onEnd when finished and bind this(=uber) context
                // otherwise the this in the function onEnd will refer to the Howl context
                onend: uber.onEnd.bind(uber),
                buffer: true,
                volume: uber.current_volume
            }));
        });


    };







    LEAPAPP.Radio.prototype.play = function() {

        var uber = this;
        var song = uber.howler_bank[uber.current_track];
        // check first audio node (should never be more than one)
        // (probably unnecessary)
        if (song._audioNode.length > 1) {
            // use lodash do get only the first element of array
            song._audioNode = _.head(song._audioNode);
        }
        // check if song is paused, then play it
        // after creating a howl element paused is set to true
        if (song._audioNode[0].paused){
            // set the volume before playing
            song.volume(uber.current_volume);
            song.play(function(sound_id){
                uber.current_playback_id = sound_id; // save intance id
            });
        }



    };

    LEAPAPP.Radio.prototype.pause = function() {
        var uber = this;
        uber.howler_bank[uber.current_track].pause(uber.current_playback_id);

    };

    LEAPAPP.Radio.prototype.nextTrack = function() {
        var uber = this;
        uber.howler_bank[uber.current_track].stop(uber.current_playback_id);
        uber.current_track = (uber.current_track + 1 !== uber.howler_bank.length) ? uber.current_track + 1 : 0;
        uber.play();


    };

    LEAPAPP.Radio.prototype.previousTrack = function() {
        var uber = this;
        uber.howler_bank[uber.current_track].stop(uber.current_playback_id);
        uber.current_track = (uber.current_track - 1 >= 0  ) ? uber.current_track - 1 : uber.howler_bank.length - 1;
        uber.play();
    };

    LEAPAPP.Radio.prototype.volumeUp = function() {
        var uber = this;
        // change current volume
        if (uber.current_volume < 1.0) {
            uber.current_volume += 0.05;
        }
        uber.howler_bank[uber.current_track].volume(uber.current_volume, uber.current_playback_id);
    };

    LEAPAPP.Radio.prototype.volumeDown = function() {
        var uber = this;
        if (uber.current_volume > 0.1) {
            uber.current_volume -= 0.05;
        }
        uber.howler_bank[uber.current_track].volume(uber.current_volume, uber.current_playback_id);
    };

    LEAPAPP.Radio.prototype.setVolume = function(rotation_info) {
        var uber = this;
        // only adjust volume if track is playing
        var song = uber.howler_bank[uber.current_track];
        // check if song is paused
        if (!song._audioNode[0].paused){
            var angle = rotation_info.angle_diff;
            var vol = rotation_info.volume_at_grab;
            var mapped_volume = uber.current_volume; // set mapped volume to current volume initially

            // map range 1 (<0 = left turn)
            if (angle < 0) {
                mapped_volume = angle.map(-50, 0, 0.1, vol);
                mapped_volume = (mapped_volume < 0.1) ? 0.1 : mapped_volume; // if smaller than 0.1 reset to 0.1
                console.log("< 0: left: mapped_volume: ", mapped_volume);
            }
            // right turn of hand
            else {
                mapped_volume = angle.map(0, 50, vol, 1.0);
                mapped_volume = (mapped_volume > 1.0) ? 1.0 : mapped_volume;
                console.log("> 0: right: mapped_volume: ", mapped_volume);
            }

            // assign volume back to radio
            uber.current_volume = mapped_volume;
            uber.howler_bank[uber.current_track].volume(uber.current_volume, uber.current_playback_id);
        }

    };



    // playing i+1 audio (= chaining audio files)
    LEAPAPP.Radio.prototype.onEnd = function() {
        var uber = this;
        // check if current track is more than number of all tracks, otherwise reset to 0
        uber.current_track = (uber.current_track + 1 > (uber.howler_bank.length - 1)) ? 0 : uber.current_track + 1;
        uber.play();
    };

}());
