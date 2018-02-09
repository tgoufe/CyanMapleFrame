'use strict';

/**
 * @file    Service Worker 后台执行文件
 * */

import CacheStorageModel    from '../model/cacheStorage.js';
import notify               from '../notify.js';

let PRE_CACHE_URLS = []
	, PRE_CACHE_NAME = 'precache'
	, RUNTIME_CACHE_NAME = 'runtime'
	, preCache = new CacheStorageModel({
		cacheName: PRE_CACHE_NAME
	})
	, runtimeCache = new CacheStorageModel({
		cacheName: RUNTIME_CACHE_NAME
	})
	;

console.log('Service Worker 已加载');

/**
 * Service Worker 安装事件
 * */
self.addEventListener('install', (event)=>{
	console.log('Service Worker 安装完成，install event', event);

	// 预加载
	event.waitUntil( preCache.addAll( PRE_CACHE_URLS ).then(self.skipWaiting(), (e)=>{
		// 安装失败  todo 发送记录
		console.log( e );
	}));
});

/**
 * Service Worker 激活事件
 * */
self.addEventListener('activate', (event)=>{
	console.log('新版本 Service Worker 激活 Active event,', event);

	// 更新，将不是正在使用的缓存删除
	event.waitUntil( Promise.all([
		preCache.keys()
		, [PRE_CACHE_NAME, RUNTIME_CACHE_NAME]
	]).then(([keyList, cacheNames])=>{

		return Promise.all( keyList.filter((key)=>{
			return cacheNames.indexOf(key) === -1;
		}).map((key)=>{
			return preCache.cacheDelete( key );
		}) );
	}).then(()=>{
		// todo ?
		return self.clients.claim();

		// self.clients.claim().then(()=>{
		// 	return self.clients.matchAll({
		// 		type: 'window'
		// 	});
		// }).then((clientList)=>{
		// 	return clientList.filter((client)=>{
		// 		return 'navigate' in client;
		// 	}).map((client)=>{
		// 		return client.navigate('activated.html');
		// 	});
		// });
	}) );
});

/**
 * 请求拦截
 * */
self.addEventListener('fetch', (event)=>{

	event.respondWith( runtimeCache.getData( event.request ).then((response)=>{
		let result
		;

		if( response ){
			result = response;
		}
		else{
			result = Promise.reject({
				message: '不存在 '+ event.request.url +' 的相关缓存'
			});
		}

		return result;
	}).catch((e)=>{
		console.log( e && e.message );

		// 克隆该请求，Request 对象是 stream 类型的，只能读取一次
		return fetch( event.request.clone() ).then((response)=>{
			let result
			;

			// 判断是否为一个异常的响应
			if( !response || response.status < 400 || response.type !== 'basic' ){
				// 异常响应

				result = Promise.resolve( response );
			}
			else{
				result = response;

				runtimeCache.setData(event.request, response.clone()).then(()=>{
					console.log('已缓存 '+ event.request.url);
				});
			}

			return result;
		});
	}) );
});

/**
 * 收到消息事件
 * */
self.addEventListener('message', (event)=>{

});

/**
 * 收到推送事件
 * */
self.addEventListener('push', (event)=>{
	let data
		;

	if( event.data ){
		data = event.data.json();
	}
	else{
		data = {};
	}

	let {title, message} = data
		;

	notify(title, message).then(()=>{
		if( self.clients.openWindow ){
			// todo 返回路径

			return self.clients.openWindow('');
		}
	});

	// event.waitUntil( self.registration.showNotification('123123', {
	// 	body: 'asdfsadfasdf'
	// }) );
});

// todo 用途
/**
 * 通知点击事件
 * */
self.addEventListener('notificationclick', (event)=>{
	
	event.notification.close();

	event.waitUntil( self.clients.matchAll({
		type: 'window'
	}).then((clientList)=>{
		let client = clientList.find((client)=>{
				return client.url === '/' && 'focus' in client;
			})
			;

		if( client ){
			return client.focus();
		}

		if( clientList.openWindow ){
			return clientList.openWindow('/');
		}
	}) );
});
/**
 * 通知关闭事件
 * */
self.addEventListener('notificationclose', (event)=>{
	console.log('桌面通知关闭');
});