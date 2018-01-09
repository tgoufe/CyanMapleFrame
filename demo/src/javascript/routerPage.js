'use strict';

import maple    from 'maple';

import mapleRouter  from 'mapleRouter';

import Vue from 'vue';

import log      from '../log.js';

Vue.use( mapleRouter );

let router = mapleRouter.router
	;

router.register([{
	path: maple.url.path
	, callback(){
		log('x');
	}
}, {
	path: '/a/1.html'
	, callback(){
		log(1);
	}
}, {
	path: '/a/2.html'
	, callback(){
		log(2);
	}
}, {
	path: '/a/3.html'
	, callback(){
		log(3);
	}
}]);

let vm = new Vue({
		el: '#app'
		, data: {
		}
		, methods: {}
	})
	;

mapleRouter.init( vm );

window.vm = vm;