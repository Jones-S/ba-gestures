// Load Node Modules/Plugins
var gulp = require('gulp');
var concat = require('gulp-concat');
// var uglify = require('gulp-uglify');
var notify = require('gulp-notify');
var cssnano = require('gulp-cssnano');
var browsersync = require('browser-sync');
var sourcemaps = require('gulp-sourcemaps');
var sass = require('gulp-sass');
var plumber = require('gulp-plumber');


// Asset paths
var paths = {
  sass:                     'scss/*.scss',
  css:                      'dist/css',
  js:                       'js/*.js',
  js_dist:                  'dist/js/'
};


// Error Helper
function onError(err) {
    notify({ message: 'Oh Boy. Error.' });
    console.log(err);
}

// browsersync task
gulp.task('browsersync', function(cb) {
   return browsersync({
       server: {
           baseDir:'./dist/'
    } }, cb);
   console.log("css injected");
});


gulp.task('sass', function() {
    gulp.src(paths["sass"])
        .pipe(plumber({
                errorHandler: onError
            }))
        .pipe(sourcemaps.init())
        .pipe(sass())
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest(paths["css"]))
        .pipe(notify({ message: 'Sass complete' }))
        .pipe(browsersync.stream());
});



// concat gulp task
gulp.task('concatenate', function() {
    return gulp.src([
                // 'bower_components/jquery/dist/jquery.min.js',
                // 'bower_components/angular/angular.min.js'
                paths['js']
            ])
        .pipe(plumber({
                errorHandler: onError
            }))
        .pipe(sourcemaps.init())
        .pipe(concat('all.js'))
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest(paths['js_dist']))
        .pipe(notify({ message: 'Concatenate task complete' }))
        .pipe(browsersync.stream());
});

// concat gulp task
gulp.task('concatthirdparty', function() {
    return gulp.src([
                'bower_components/jquery/dist/jquery.min.js'
                // ,'further 3rd comapany js files.js'
            ])
        .pipe(plumber({
                errorHandler: onError
            }))
        .pipe(sourcemaps.init())
        .pipe(concat('third_party.js'))
        .pipe(sourcemaps.write('maps'))
        .pipe(gulp.dest(paths['js_dist']))
        .pipe(notify({ message: 'Concat 3rdParty task complete' }))
        .pipe(browsersync.stream());
});




// Watch Task
gulp.task('watch', function() {
    // watch scss files
    gulp.watch(paths['sass'], ['sass']);

    // Watch .js files
    // and also watch angular js files
    gulp.watch([
            paths['js']
            // ,paths['possible further paths']
        ], ['concatenate']);

    gulp.watch("**/*.html").on('change', browsersync.reload);
});


// Default Task
gulp.task('default', ['sass', 'watch', 'browsersync']);





// production tasks

// gulp.task('production-css', function(){
//     return gulp.src('campusinterview/sass/*.scss')
//         .pipe(plumber({
//             errorHandler: onError
//         }))
//         .pipe(compass({
//             style: 'compressed',
//             comments: false,    // no effect ?!
//             css: 'campusinterview/stylesheets',
//             sass: 'campusinterview/sass',
//         }))
//         .pipe(cssnano())      //minifying removes line comments as well
//         .pipe(gulp.dest('testcampusinterview/system/templates/frontend/default/css/production'))
//         .pipe(notify({ message: 'Compass production task complete' }));
// });

// gulp.task('production-js', function() {
//     return gulp.src('testcampusinterview/system/templates/frontend/default/js/all.js')
//         .pipe(uglify())
//         .pipe(gulp.dest('testcampusinterview/system/templates/frontend/default/js/production'))
//         .pipe(notify({ message: 'uglify js task complete' }));
// });

// gulp.task('production', ['production-js', 'production-css']);
