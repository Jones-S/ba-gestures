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
        this.loop = true;
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
        // this.howler_bank[0].play();




    };

    LEAPAPP.Radio.prototype.play = function() {
        var uber = this;
        console.log("uber.howler_bank[uber.current_track]: ", uber.howler_bank[uber.current_track]);
        uber.howler_bank[uber.current_track].play( function(sound_id){
            uber.current_playback_id = sound_id;
        });

    };

    LEAPAPP.Radio.prototype.pause = function() {
        var uber = this;
        // stop all tracks except the current one
        console.log("uber.howler_bank: ", uber.howler_bank);
        var all_other_tracks = _.without(uber.howler_bank, uber.howler_bank[uber.current_track]);
        console.log("all_other_tracks: ", all_other_tracks);
        uber.howler_bank.forEach(function (current, index) {
            // body...
        });
        uber.howler_bank[uber.current_track].pause(uber.current_playback_id);

    };

    // playing i+1 audio (= chaining audio files)
    LEAPAPP.Radio.prototype.onEnd = function() {
        console.log("onend called");
        var uber = this;
        if (uber.loop === true) {
            // check if current track is more than number of all tracks, otherwise reset to 0
            uber.current_track = (uber.current_track + 1 !== uber.howler_bank.length) ? uber.current_track + 1 : 0;
        } else {
            uber.current_track = uber.current_track + 1;
        }
        uber.howler_bank[uber.current_track].play();
        console.log("%c ffomr autoplay]", "background: #0D0B07; color: #FAFBFF", uber.howler_bank[uber.current_track]);
    };

}());
