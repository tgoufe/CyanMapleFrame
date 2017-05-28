'use strict';

module.exports = function(app){
	app.get('/slider/', function(req, res){
		res.send( JSON.stringify([{
			src: ''
			, title: '1'
			, desc: '11'
		}, {
			src: ''
			, title: '2'
			, dest: '22'
		}]) );
		res.end();
	});
};