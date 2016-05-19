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


    APP.Radio = function() {

        this.files = [
            'dire_sultan.wav',
            'rhcp_cabron.wav',
            'uh_lady.wav',
            'racon_steady.wav'
        ];


        this.folder = "audio/tracks/classics/";
        this.files = completeFilePath(this.folder, this.files);
        console.log("this.files: ", this.files);

        this.current_track          = 0;
        this.current_playback_id    = undefined;
        this.howler_bank            = [];
        this.current_volume         = 0.5   ; // from 0.01 to 1.0
        var uber                    = this;

        // build up howler_bank:
        this.files.forEach(function(current, i) {
            uber.howler_bank.push(new Howl({
                src: [uber.files[i]],
                onend: uber.onEnd.bind(uber),
                preload: true,
                // html5: true,
                volume: uber.current_volume
            }));
        });


    };







    APP.Radio.prototype.play = function() {

        var uber = this;
        var song = uber.howler_bank[uber.current_track];
        if (!song.playing()){
            // set the volume before playing
            song.volume(uber.current_volume);
            song.play();
        }

    };

}());