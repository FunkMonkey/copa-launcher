var gulp = require( "gulp" );
var babel = require( "gulp-babel" );
var gutil = require( "gulp-util" );
var sourcemaps = require( "gulp-sourcemaps" );

function onError ( err ) {
  var displayErr = gutil.colors.red( err );
  gutil.log( displayErr );
  gutil.beep();
  this.emit( "end" );
}

function logWatchEvent( event ) {
  console.log( "File " + event.path + " was " + event.type + ", running tasks..." );
}

var GLOB_BACKEND_SCRIPTS =  "./src/backend/**/*.js";
var GLOB_FRONTEND_SCRIPTS = "./src/frontend/scripts/**/*.js";
var GLOB_FRONTEND_VIEWS =   "./src/frontend/views/**/*.html";
var GLOB_FRONTEND_STYLES =  "./src/frontend/styles/**/*.css";
var GLOB_FRONTEND_ASSETS =  "./src/frontend/assets/**/*.*";

gulp.task( "build:frontend-views", function () {
  return gulp.src( GLOB_FRONTEND_VIEWS )
             .pipe( gulp.dest( "build/frontend/views" ) );
});

gulp.task( "build:frontend-assets", function () {
  return gulp.src( GLOB_FRONTEND_ASSETS )
             .pipe( gulp.dest( "build/frontend/assets" ) );
});

gulp.task( "build:frontend-styles", function () {
  return gulp.src( GLOB_FRONTEND_STYLES )
             .pipe( gulp.dest( "build/frontend/styles" ) );
});

gulp.task( "build:frontend-scripts", function() {
  return gulp.src( GLOB_FRONTEND_SCRIPTS )
             .pipe( sourcemaps.init() )
             .pipe( babel() )
             .on( "error", onError )
             .pipe( sourcemaps.write( "." ) )
             .pipe( gulp.dest( "build/frontend/scripts" ) );
});

gulp.task( "build:backend-scripts", function() {
  return gulp.src( GLOB_BACKEND_SCRIPTS )
             .pipe( sourcemaps.init() )
             .pipe( babel() )
             .on( "error", onError )
             .pipe( sourcemaps.write( "." ) )
             .pipe( gulp.dest( "build/backend" ) );
});

gulp.task( "build", ["build:backend-scripts", "build:frontend-scripts", "build:frontend-views", "build:frontend-styles", "build:frontend-assets"] );

gulp.task( "watch:build", function ( ) {

  gulp.watch( GLOB_BACKEND_SCRIPTS, ["build:backend-scripts"] )
      .on( "change", logWatchEvent );
  gulp.watch( GLOB_FRONTEND_ASSETS,   ["build:frontend-assets"])
      .on( "change", logWatchEvent );
  gulp.watch( GLOB_FRONTEND_SCRIPTS, ["build:frontend-scripts"] )
      .on( "change", logWatchEvent );
  gulp.watch( GLOB_FRONTEND_STYLES, ["build:frontend-styles"] )
      .on( "change", logWatchEvent );
  gulp.watch( GLOB_FRONTEND_VIEWS, ["build:frontend-views"] )
      .on( "change", logWatchEvent );
});

