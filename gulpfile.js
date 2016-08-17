const autoPrefixer = require('gulp-autoprefixer');
const browserify = require('browserify');
const concat = require('gulp-concat');
const gulp = require('gulp');
const gulpUtil = require('gulp-util');
const less = require('gulp-less');
const source = require('vinyl-source-stream');
const sourcemaps = require('gulp-sourcemaps');
const tsify = require('tsify');
const tslint = require('gulp-tslint');
const watchify = require('watchify');
const watchLess = require('gulp-watch-less');

const config = {
    bowerPath: __dirname + '/bower_components',
    cssPath: __dirname + '/www/assets/styles',
    jsPath: __dirname + '/www/assets/scripts',
    lessPath: __dirname + '/src/styles',
    tsPath: __dirname + '/src/scripts',
};

const tsArgs = {
    noImplicitAny: true,
    target: 'ES5'
};

gulp.task('default', ['build']);

gulp.task('build', ['libs', 'lint', 'scripts', 'styles']);

gulp.task('libs', () => gulp.src([
    config.bowerPath + '/jquery/dist/jquery.js',
    config.bowerPath + '/angular/angular.js',
    config.bowerPath + '/tether/dist/js/tether.js',
], { base: config.bowerPath })
    .pipe(sourcemaps.init())
    .pipe(concat('lib.js'))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest(config.jsPath)));

gulp.task('lint', () => gulp.src(config.tsPath + '/**/*.ts')
    .pipe(tslint({
        formatter: "verbose"
    }))
    .pipe(tslint.report()));

gulp.task('scripts',
    () => bundleScripts(createBundler().plugin(tsify, tsArgs)));

gulp.task('styles',
    () => compileStyles(gulp.src(config.lessPath + '/app.less')));

gulp.task('watch', ['watchScripts', 'watchStyles']);

gulp.task('watchScripts', () => {
    const bundler = watchify(createBundler())
        .plugin('tsify', tsArgs)
        .on('update', bundle)
        .on('log', gulpUtil.log);

    function bundle() {
        return bundleScripts(bundler);
    }

    return bundle();
});

gulp.task('watchStyles', ['styles'],
    () => compileStyles(watchLess(config.lessPath + '/app.less')));

function createBundler() {
    return browserify({
        basedir: config.tsPath,
        entries: [config.tsPath + '/app.ts'],
        debug: true,
    });
}

function bundleScripts(bundler) {
    return bundler
        .on('error', gulpUtil.log.bind(gulpUtil, 'Browserify Error'))
        .bundle()
        .pipe(source('app.js'))
        .pipe(gulp.dest(config.jsPath));
}

function compileStyles(stream) {
    return stream
        .pipe(less())
        .pipe(autoPrefixer())
        .pipe(gulp.dest(config.cssPath));
}
