# Web Base Project Setup

## Description
Base project for (all) web projects. The projects include the use of npm and bower. As a build system I use gulp.js. And for simpler CSS writing sass is used. CSS Reset is on. Basic SCSS fragments are provided. Further included are some basic base line grid systems. *Editorconfig* for sublime Text and *gitignore* are included as well. *Jquery library* is installed by default.

## Install Guide

1. Set up bower.json file via `$ bower init` and configure it to suit your project
2. Set up the package.json via `$ npm init`
3. Install the necessary bower dependencies (Adapations can be made)

    ```$ bower install jquery include-media --save```

    - jquery: Jquery library
    - browser-sync: Automatic browser update if css/html files edited
    - include-media: sass library for breakpoints (http://include-media.com/)

4. Install the necessary npm dependencies:

    ```$ npm install gulp gulp-concat gulp-notify gulp-cssnano gulp-sourcemaps gulp-uglify gulp-sass gulp-plumber gulp-if browser-sync gulper --save-dev```
5. Start gulp task via `$ gulper <task-name>` or `$ gulper` for the default gulp task.
    (If you change gulpfile.js, gulper will restart gulp.js task runner.)
6. Start writing code and adapt all the scss files (general.scss and main.scss for baseline grid and rem/em units, fonts etc.)
7. You may want to delete the font in the fonts folder. It was added to build the folder even without containing any files

### A few hints
- 3.0rem will be 30px if the browser font size is 16px. (see main.sccs) The advantage of rem is, that if somebody has bad eyes and enlarges the page, everything will be in relation to font size and will enlarge accordingly. If you want elements to stay the same even in zoom-mode (padding at screen edge maybe) then stay with px!
- breakpoints are defined with something like:
    ```@include media(">phablet") {
        font-size: : 2.5rem;
    }```
-





## Links
Helpful links to certain topics:
- http://www.teehanlax.com/blog/designing-faster-with-a-baseline-grid/
- https://www.smashingmagazine.com/2012/12/css-baseline-the-good-the-bad-and-the-ugly/