'use strict';
var packager = require('electron-packager');

module.exports = function(grunt) {

  grunt.registerTask('packelectron', 'Pack electron app', function() {
    var done = this.async();

    // this.data here contains your configuration
    grunt.log.writeln('Packing electron...');
    packager({
      dir: '.',
      out: 'build',
      arch: ['x64'],
      platform: ['linux']
    },
    
    function(err, appPaths) {
      if (err) {
        grunt.log.error(err);
        done(false);
        return;
      }

      grunt.log.writeln(appPaths);
      done();
    });
  });

};
