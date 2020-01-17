'use strict';

import maple    from 'maple';

import Vue      from 'vue';

import log      from '../log.js';

const ERROR_SRC = {
		default: '//image1.51tiangou.com/tgou2/img/bg-load.png!s'
	}
	;

maple.error.add(function(e){
	let target = e.target
		;

	log('捕获到异常', arguments);

	if( target.tagName === 'IMG' ){
		let errorSrc = target.dataset.errorSrc || 'default'
			;

		log('图片加载失败，替换为 ', ERROR_SRC[errorSrc]);

		target.src = ERROR_SRC[errorSrc];
	}

	return true;
});

maple.unHandledRejection.add(function(e){
	log('捕获到 Promise reject', arguments);

	return true;
});

window.onerror = function(){
	log('全局错误', arguments)
};

let vm = new Vue({
		el: '#app'
		, data: {
			imgUrl: ''
		}
	})
	;

vm.imgUrl = '/1.jpg';

let temp = new Promise((resolve, reject)=>{
		reject( new Error('promise reject 捕获实验') );
	})
	, tempErr = new Promise((resolve, reject)=>{
		reject('promise reject 捕获实验 2');
	})
	;

throw new Error('全局异常捕获实验');