module.exports = function(grunt) {
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        nodeunit:{
            all: ['test/*_test.js']
        },
        copy: {
            main: {
                files: [
                    {
                        src: [
                            'bin/**',
                            'config/**',
                            'icons/**',
                            'lib/**',
                            'node_modules/**',
                            'public/**',
                            'routes/**',
                            'views/**',
                            'LICENSE',
                            'README.md',
                            'app.js'
                        ],
                        dest: 'nodewebkit/',
                        flatten: true
                    }
                ]
            }
        },
        nodewebkit:{
            options: {
                build_dir: './webkitbuilds', // Where the build version of my node-webkit app is saved
                mac_icns: './icons/icon.icns',
                mac: true, // We want to build it for mac
                win: false, // We want to build it for win
                linux32: false, // We don't need linux32
                linux64: false, // We don't need linux64
                credits: './nodewebkit/credits.html'
            },
            src: [
                './nodewebkit/**/*'
            ]
        }
    });
    grunt.loadNpmTasks('grunt-contrib-nodeunit');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-node-webkit-builder');
    
    
    grunt.registerTask('test', ['nodeunit']);
    grunt.registerTask('prepare-webkit', ['copy:main']);
    grunt.registerTask('webkit', ['nodewebkit']);
}