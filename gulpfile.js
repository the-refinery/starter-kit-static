var gulp = require('gulp');
var pug = require('gulp-pug');
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
var autoprefixer = require('gulp-autoprefixer');

var paths = {
  templates: './source/templates/**/*.pug',
  sass: './source/stylesheets/**/*.scss',
  js: './source/javascripts/**/*.js',
  images: './source/images/**/*',
  public: './source/public/**/*',
  dist: './dist/'
};

var env = process.env.ASSET_ENV || '';
var isProduction = env.toLowerCase() === 'production';

// Templates
gulp.task('templates', function buildHTML() {
  return gulp.src([paths.templates, '!./source/templates/**/_*.pug'])
    .pipe(pug({
      pretty: !isProduction
    }))
    .pipe(gulp.dest(paths.dist))
    .pipe(connect.reload());
});

// CSS
gulp.task('sass', function() {
  var includePaths = [
    './node_modules/normalize.css'
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
    .pipe(autoprefixer({
      browsers: ['last 2 versions'],
      cascade: false
    }))
    .pipe(isProduction ? gutil.noop() : sourcemaps.write("."))
    .pipe(gulp.dest(paths.dist + '/stylesheets'))
    .pipe(connect.reload());
});

// JS
gulp.task('js', function () {
  var modules = [
    './source/javascripts/modules/**/*.js',
    './source/javascripts/main.js'
  ];

  var lib = [
    './node_modules/jquery/dist/jquery.js'
  ];

  return gulp.src(modules)
    .pipe(isProduction ? gutil.noop() : sourcemaps.init())
    .pipe(concat("application.js"))
    .pipe(babel())
    .pipe(addsrc.prepend(lib))
    .pipe(concat("application.js"))
    .pipe(isProduction ? gutil.noop() : sourcemaps.write("."))
    .pipe(isProduction ? uglify() : gutil.noop())
    .pipe(gulp.dest(paths.dist + '/javascripts'))
    .pipe(connect.reload());
});

// Images
gulp.task('images', function() {
  var images = [
    paths.images
  ];

  return gulp.src(images)
    .pipe(imagemin({
      progressive: true,
      svgoPlugins: [{removeViewBox: false}],
      use: []
    }))
    .pipe(gulp.dest(paths.dist + '/images'))
    .pipe(connect.reload());
});

// Public
// Files under the public folder are brought over into dist
// without any processing.
gulp.task('public', function() {
  return gulp.src(paths.public)
    .pipe(gulp.dest(paths.dist))
    .pipe(connect.reload());
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
