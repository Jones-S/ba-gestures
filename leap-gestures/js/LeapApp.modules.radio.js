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
        var uber = this;

        // build up howler_bank:
        this.files.forEach(function(current, i) {
            uber.howler_bank.push(new Howl({
                urls: [uber.files[i]],
                // execute onEnd when finished and bind this(=uber) context
                // otherwise the this in the function onEnd will refer to the Howl context
                onend: uber.onEnd.bind(uber),
                buffer: true
            }));
        });

        // initiate the whole :




    };

    LEAPAPP.Radio.prototype.play = function() {
        console.log("%c play", "background: #FDD187; color: #DA5C1B");

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
        if(song._audioNode[0].paused){
            song.play(function(sound_id){
                uber.current_playback_id = sound_id; // save intance id
            });
        }



    };

    LEAPAPP.Radio.prototype.pause = function() {
        var uber = this;
        console.log("%c pause", "background: #FDD187; color: #DA5C1B");

        uber.howler_bank[uber.current_track].pause(uber.current_playback_id);

    };

    LEAPAPP.Radio.prototype.nextTrack = function() {
        console.log("%c nextTrack", "background: #FDD187; color: #DA5C1B");
        var uber = this;
        uber.howler_bank[uber.current_track].stop(uber.current_playback_id);
        uber.current_track = (uber.current_track + 1 !== uber.howler_bank.length) ? uber.current_track + 1 : 0;
        console.log("%c next: uber.howler_bank[uber.current_track]", "background: #9C1DB4; color: #FAFBFF", uber.howler_bank[uber.current_track]);
        uber.play();


    };

    LEAPAPP.Radio.prototype.previousTrack = function() {
        console.log("%c previousTrack", "background: #FDD187; color: #DA5C1B");
        var uber = this;
        uber.howler_bank[uber.current_track].stop(uber.current_playback_id);
        uber.current_track = (uber.current_track - 1 > 0) ? uber.current_track - 1 : uber.howler_bank.length - 1;
        console.log("%c prev: uber.howler_bank[uber.current_track]", "background: #9C1DB4; color: #FAFBFF", uber.howler_bank[uber.current_track]);
        uber.play();


    };

    // playing i+1 audio (= chaining audio files)
    LEAPAPP.Radio.prototype.onEnd = function() {
        console.log("%c onEnd", "background: #FDD187; color: #DA5C1B");

        var uber = this;
        // check if current track is more than number of all tracks, otherwise reset to 0
        uber.current_track = (uber.current_track + 1 > (uber.howler_bank.length - 1)) ? uber.current_track + 1 : 0;
        uber.play();
    };

}());
