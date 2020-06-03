'use strict';

import maple    from 'maple';

import Vue      from 'vue';

import log      from '../log.js'

let load = maple.listener.on(document, 'load', (e)=>{
		log(12, e);
		if( e.target.tagName === 'IMG' ){
			log(`加载了图片 ${e.target.src}`);
		}
	}, {
		capture: true
	})

	, focus = maple.listener.on('focus', (e)=>{
		log(e, e.target.tagName);
	}, {
		capture: true
	})
	, blur = maple.listener.on('blur', (e)=>{
		log(e.target.tagName);
	}, {
		capture: true
	})

	, vm = new Vue({
		el: '#app'
		, data: {
			imgList: [{
				src: '//zwb.test.66buy.com.cn:9001/image/demo/demoImage-1.jpg'
			}, {
				src: '//zwb.test.66buy.com.cn:9001/image/demo/demoImage-2.jpg'
			}, {
				src: '//zwb.test.66buy.com.cn:9001/image/demo/demoImage-3.jpg'
			}, {
				src: '//zwb.test.66buy.com.cn:9001/image/demo/demoImage-4.jpg'
			}, {
				src: '//zwb.test.66buy.com.cn:9001/image/demo/demoImage-5.jpg'
			}]
		}
	})
	;
