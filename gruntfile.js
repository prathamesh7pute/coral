module.exports = function(grunt) {

    grunt.initConfig({

            pkg: grunt.file.readJSON('package.json'),
            files: ['gruntfile.js', 'package.json', 'test/**/*.js', 'lib/**/*.js'],

            jsbeautifier: {
                files: '<%= files %>'
            },

            jshint: {
                files: '<%= files %>',
                options: {
                    jshintrc: ".jshintrc"
                }
            },

            simplemocha: {
                options: {
                    globals: ['should'],
                    timeout: 3000,
                    ignoreLeaks: false,
                    ui: 'bdd',
                    reporter: 'Spec'
                },

                all: {
                    src: ['test/**/*.js']
                }
            },

            watch: {
                files: '<%= files %>',
                tasks: ['default']
            }

        });

    grunt.loadNpmTasks('grunt-jsbeautifier');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-simple-mocha');
    grunt.loadNpmTasks('grunt-contrib-watch');


    grunt.registerTask('default', ['jsbeautifier', 'jshint', 'simplemocha']);
    grunt.registerTask('test', ['jshint', 'simplemocha']);

};
