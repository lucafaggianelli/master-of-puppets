module.exports = function(grunt) {
  
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // Task configuration will be written here
    jshint: {
      all: [ 'Gruntfile.js', 'app/*.js', 'app/**/*.js' ]
    },

    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: [ 'src/*.js', 'tmp/*.js' ],
        dest: 'dist/app.js'
      }
    },

    watch: {
      dev: {
        files: [ 'Gruntfile.js', 'src/*.js', '*.html' ],
        tasks: [ 'jshint', 'concat:dist' ],
        options: {
          atBegin: true
        }
      },
      min: {
        files: [ 'Gruntfile.js', 'app/*.js', '*.html' ],
        tasks: [ 'jshint', 'karma:unit', 'html2js:dist', 'concat:dist', 'clean:temp', 'uglify:dist' ],
        options: {
          atBegin: true
        }
      }
    }
  });

  // Loading of tasks and registering tasks will be written here
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('dev', [ 'watch:dev' ]);
};
