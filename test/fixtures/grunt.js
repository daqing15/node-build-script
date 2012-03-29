
var path = require('path');

var h5bp = require('../'),
  extend = require('grunt-flavored');


// This is the main html5-boilerplate build configuration file.
//
// Builds depends on two specific directory created during the process
// `intermediate/` and `publish/`, the first is used as a staging area, the
// second is the final result of the build that was run.
//
// These two values may be changed to something else with the `staging` and
// `output` config property below, and by changing any task config to match the new value.
//
module.exports = function(grunt) {
  grunt = extend(grunt);

    // the staging directory used during the process
  var staging ='intermediate/';

  // final build output
  var output = 'publish/';

  grunt.config.init({
    // the staging directory used during the process
    staging: staging,

    // final build output
    output: output,

    // filter any files matching one of the below pattern during mkdirs task
    exclude: 'build/** node_modules/** grunt.js package.json *.md'.split(' '),

    mkdirs: {
      staging: '<config:exclude>',
      output: '<config:exclude>'
    },

    // rev task - File pattern in suprops values are resolved with `output` value
    // (eg. publish/*.html)
    usemin: {
      files: ['**/*.html']
    },

    manifest: '<config:usemin>',

    watch: {
      files: ['js/**/*.js', 'css/**', '*.html'],
      tasks: 'default',

      reload: {
        files: '<config:watch.files>',
        tasks: 'default emit'
      }
    },

    serve: {
      staging: { port: 3000 },
      output: { port: 3001 }
    },

    connect: {
      staging: {
        hostname: 'localhost',
        port: 3000,
        logs: 'dev',
        dirs: true
      },
      output: {
        hostname: 'localhost',
        port: 3001,
        logs: 'default',
        dirs: true
      }
    },

    dom: {

      files                   : ['*.html'],

      options: {
        //
        // cwd - base directory to work from.
        // out - optimized assets get resolved to this path.
        //
      },

      'script[data-build]'    : h5bp.plugins.script,
      'link'                  : h5bp.plugins.link,
      'img'                   : h5bp.plugins.img,
      'script, link, img'     : h5bp.plugins.rev,
    },

    lint: {
      files: ['js/*.js'],
      build: ['grunt.js', 'tasks/*.js']
    }

  });


  //
  // Concat configuration - prepending output / staging values to task's target
  //
  // files are concat'd into `staging/subprop.js`
  // (eg. intermediate/js/scripts.js)
  //
  var concat = grunt.config('concat') || {};
  concat[staging + 'js/scripts.js'] = ['js/plugins.js', 'js/script.js'];
  concat[staging + 'css/style.css'] = ['css/*.css'];
  grunt.config('concat', concat);

  //
  // Min configuration - same goes the minify task
  // (eg. publish/js/scripts.js)
  //
  var min = grunt.config('min') || {};
  min[output + 'js/scripts.js'] = [staging + 'js/plugins.js', staging + 'js/script.js'];
  grunt.config('min', min);

  //
  // Css - same here
  //
  var css = grunt.config('css') || {};
  css[output + 'css/style.css'] = [staging + 'css/style.css'];
  grunt.config('css', css);

  //
  // Rev - targets needs to be be in output
  //
  grunt.config('rev', {
    js: [output + 'js/**/*.js'],
    css: [output + 'css/**/*.css'],
    img: [output + 'img/**'],
  });

  // Run the following tasks...
  grunt.registerTask('default', 'intro clean mkdirs concat css min rev usemin manifest');
  grunt.registerTask('reload', 'default connect watch:reload');

  // dom based tasks
  grunt.loadTasks('../tasks/dom');

  // regular tasks
  grunt.load('../tasks/support');

};


//
// Advanced configuration, doing the necessary logic to map any task needed
// values to top level staging / output dir
//
// ---
//
// This is temporary workaround for #3 support untill each task is rewritten to
// take into account the staging / output values from grunt config.

// exclude - add both staging / output dir as excluded folder during file copy (mkdirs)
/* * /
config('exclude', config('exclude')
  .concat(path.join(config('staging'), '**'))
  .concat(path.join(config('output'), '**'))
);

// concat - same here prepend the necessary `staging` value into subprop name
var concat = config('concat');
Object.keys(concat).forEach(function(key) {
  var dir = path.join(config('staging'), key);
  concat[dir] = concat[key];
  delete concat[key];
});

// min - same here prepend the necessary `output` and `staging` value into
// subprop name and values
var min = config('min');
Object.keys(min).forEach(function(key) {
  var dir = path.join(config('output'), key);
  min[dir] = min[key].map(function(files) {
    return path.join(config('staging'), files);
  });
  delete min[key];
});

// css - prepend the necessary `output` value into subprop name
var css = config('css');
Object.keys(css).forEach(function(key) {
  var dir = path.join(config('output'), key);
  css[dir] = css[key];
  delete css[key];
});

// css - prepend the necessary `output` dir value into files pattern to handle
var rev = config('rev');
Object.keys(rev).forEach(function(key) {
  rev[key] = rev[key].map(function(files) {
    return path.join(config('output'), files);
  });
});

// usemin - same here, prepend the necessary `output` dir value into files
// pattern to handle
var usemin = config('usemin');
usemin.files = usemin.files.map(function(files) {
  return path.join(config('output'), files);
});

// serve / connect - simply replace staging / output suprop name by their relevant value
var serve = config('serve');
Object.keys(serve).forEach(function(key) {
  serve[config(key)] = serve[key];
  delete serve[key];
});

var connect = config('connect');
Object.keys(connect).forEach(function(key) {
  connect[config(key)] = connect[key];
  delete connect[key];
});
/* */