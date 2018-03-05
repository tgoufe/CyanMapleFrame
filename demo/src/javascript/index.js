'use strict';

import maple    from 'maple';

import Vue  from 'vue';

let vm = new Vue({
		el: '#app'
		, data: {
			list: [{
				url: './model.html'
				, title: 'model 数据 Model 功能测试'
			}, {
				url: './router.html'
				, title: 'router 功能测试'
			}, {
				url: './routerPage.html'
				, title: 'router + vue 测试'
			}, {
				url: './listener.html'
				, title: 'listener 事件监听器功能测试'
			}, {
				url: './debounce.html'
				, title: 'debounce 工具方法测试'
			}, {
				url: './throttle.html'
				, title: 'throttle 工具方法测试'
			}, {
				url: './error.html'
				, title: '异常捕获测试'
			}, {
				url: './eventSource.html'
				, title: 'sse 实验'
			}, {
				url: './socket.html'
				, title: 'socket 功能测试'
			}]
		}
	})
	;

window.vm = vm;