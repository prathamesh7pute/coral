module.exports = function(grunt) {

  grunt.initConfig({

    pkg: grunt.file.readJSON('package.json'),
    lib: 'lib/**/*.js',
    test: 'test/**/*.js',
    examples: 'examples/**/*.js',

    jshint: {
      files: ['gruntfile.js', '<%= lib %>', '<%= test %>', '<%= examples %>'],
      options: {
        jshintrc: '.jshintrc'
      }
    },

    mocha: {
      options: {
        globals: ['should'],
        timeout: 10000,
        ignoreLeaks: false,
        ui: 'bdd',
        reporter: 'spec'
      },
      all: {
        src: '<%= test %>'
      }
    },

    watch: {
      files: ['<%= jshint.files %>', 'config.json'],
      tasks: ['default']
    }

  });

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.registerMultiTask('mocha', 'mocha test cases', function() {
    var Mocha = require('mocha'),
      options = this.options(),
      mocha = new Mocha(options),
      done = this.async();

    this.filesSrc.forEach(mocha.addFile.bind(mocha));
    mocha.run(function(errCount) {
      done(errCount === 0);
    });
  });

  grunt.registerTask('default', ['jshint', 'mocha']);
  grunt.registerTask('test', ['mocha']);

};