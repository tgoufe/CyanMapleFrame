'use strict';

let gulp = require('gulp')
	, jsdoc = require('gulp-jsdoc3')
	;

function doc(cb){
	gulp.src(['./src/**/*.js'], {
		read: false
	}).pipe( jsdoc(cb) );
}

module.exports.doc = doc;