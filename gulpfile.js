var gulp = require('gulp');
var jade = require('gulp-jade');
var sass = require('gulp-sass');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var connect = require('gulp-connect');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var buffer = require('vinyl-buffer');
var imagemin = require('gulp-imagemin');
var concat = require('gulp-concat');
var babel = require('gulp-babel');
var addsrc = require('gulp-add-src');

var paths = {
  templates: './source/templates/**/*.jade',
  sass: './source/stylesheets/**/*.scss',
  js: './source/javascripts/**/*.js',
  images: './source/images/**/*',
  public: './source/public/**/*',
  dist: './dist/'
};

var env = process.env.ASSET_ENV || '';
var isProduction = env.toLowerCase() === 'production';

// Templates
gulp.task('templates', function() {
  var YOUR_LOCALS = {};
  return gulp.src([paths.templates, '!./source/templates/**/_*.jade'])
    .pipe(jade({
      pretty: !isProduction
    }))
    .pipe(connect.reload())
    .pipe(gulp.dest(paths.dist))
});

// CSS
gulp.task('sass', function() {
  var includePaths = [
    './bower_components/bourbon/app/assets/stylesheets',
    './bower_components/normalize-scss'
  ];

  var sassOptions = {
    outputStyle: 'expanded',
    includePaths: includePaths
  };

  if (isProduction) {
    sassOptions.outputStyle = 'compressed';
  }

  return gulp.src(paths.sass)
    .pipe(isProduction ? gutil.noop() : sourcemaps.init())
    .pipe(sass(sassOptions))
    .pipe(isProduction ? gutil.noop() : sourcemaps.write())
    .pipe(connect.reload())
    .pipe(gulp.dest(paths.dist));
});

// JS
gulp.task('js', function () {
  var modules = [
    './source/javascripts/modules/**/*.js',
    './source/javascripts/main.js'
  ];

  var lib = [
    './bower_components/jquery/dist/jquery.js'
  ];

  return gulp.src(modules)
    .pipe(isProduction ? gutil.noop() : sourcemaps.init())
    .pipe(concat("application.js"))
    .pipe(babel())
    .pipe(addsrc.prepend(lib))
    .pipe(concat("application.js"))
    .pipe(isProduction ? gutil.noop() : sourcemaps.write("."))
    .pipe(isProduction ? uglify() : gutil.noop())
    .pipe(connect.reload())
    .pipe(gulp.dest(paths.dist));
});

// Images
gulp.task('images', function() {
  var images = [
    './bower_components/fancybox/source/**/*.png',
    './bower_components/fancybox/source/**/*.gif',
    paths.images
  ];

  return gulp.src(images)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: []
    }))
    .pipe(gulp.dest(paths.dist));
});

// Public
// Files under the public folder are brought over into dist
// without any processing.
gulp.task('public', function() {
  return gulp.src(paths.public)
    .pipe(gulp.dest(paths.dist));
});

// Server
gulp.task('server', function() {
  connect.server({
    root: paths.dist,
    livereload: true
  });
});

// Watch
gulp.task('watch', function() {
  gulp.watch(paths.templates, ['templates']);
  gulp.watch(paths.sass, ['sass']);
  gulp.watch(paths.js, ['js']);
  gulp.watch(paths.images, ['images']);
  gulp.watch(paths.public, ['public']);
});

// Build
gulp.task('build', ['templates', 'sass', 'js', 'images', 'public']);

// Default
gulp.task('default', ['watch', 'build', 'server']);
