/*
 * compressor
 * http://github.com/donghanji/compressor/
 *
 * Copyright (c) 2013 donghanji, contributors
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {
    var srcPath='src',
        destPath='dest';
        
    var _js=['**/*.js'],//to compress js file
        _css=['**/*.css'];//to compress css file
	
    grunt.initConfig({
        compressor:{
            css:{
                files:[{
					cwd:srcPath,//src
                    expand:true,
                    flaten:false,
                    src:_css,
                    dest:destPath
                },{
					cwd:srcPath+'/css',//src/css
                    expand:true,
                    flaten:false,
					ext:'.min.css',
                    src:_css,
                    dest:destPath
                }]
            },
            js:{
                files:grunt.file.expandMapping(_js, '', {
                    rename: function(base,file) {
                        
                        return destPath+'/'+file.replace('.js', '.min.js');
                    },
					cwd:srcPath//src
                }),
                options: {
                    mangle: true
                }
            }
        }
    });
    
    grunt.loadNpmTasks('mixed-compressor');
    
    grunt.registerTask('default',['compressor']);
};