'use strict';

/**
 * @file    Service Worker 后台执行文件
 * */

import CacheStorageModel    from '../model/cacheStorage.js';
// import notify               from '../notify.js';

/**
 * @summary     执行 Service Worker 监听事件
 * @function
 * @param       {string[]}  [cacheUrls=[]]
 * @param       {string}    [preCacheName='precache']
 * @param       {string}    [runtimeCacheName='runtime']
 * */
function serviceWorkerRun(cacheUrls=[], preCacheName='precache', runtimeCacheName='runtime'){
	const preCache = new CacheStorageModel({
			cacheName: preCacheName
		})
		, runtimeCache = new CacheStorageModel({
			cacheName: runtimeCacheName
		})
		;

	console.log('Service Worker 已加载');

	/**
	 * Service Worker 安装事件
	 * */
	self.addEventListener('install', (event)=>{
		console.log('Service Worker 安装完成，install event', event);

		// 预加载
		event.waitUntil( preCache.addAll( cacheUrls ).then(self.skipWaiting(), (e)=>{
			// 安装失败  todo 发送记录
			console.log( e );
		}) );
	});

	/**
	 * Service Worker 激活事件
	 * */
	self.addEventListener('activate', (event)=>{
		console.log('新版本 Service Worker 激活 Active event,', event);

		// 更新，将不是正在使用的缓存删除
		event.waitUntil( Promise.all([
			preCache.keys()
			, [preCacheName, runtimeCacheName]
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

				// 判断是否为一个异常的响应
				if( !response || response.status !== 200 || response.type !== 'basic' ){
					// 异常响应，跨域资源，不缓存直接返回
					// 跨域资源 response.status 会返回 0
				}
				else{
					runtimeCache.setData(event.request, response.clone()).then(()=>{
						console.log('已缓存 '+ event.request.url);
					});
				}

				return response;
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
			, tag
			;

		if( event.data ){
			try{
				data = event.data.json();

				data.body = data.body || data.message || data.value;

				tag = data.tag = data.tag || Date.now();
			}
			catch(e){
				tag = Date.now();

				data = {
					title: 'Push'
					, message: event.data.text()
					, tag
				};
			}

			/**
			 * self.Notification 方法使用报错，只能使用 showNotification 方法显示桌面通知，但返回值的 Promise resolve 中并没有出入 Notification 实例
			 * */

			event.waitUntil( self.registration.showNotification(data.title, data).then(()=>{   // 未出入 Notification 实例，所以使用 getNotifications 方法获取对应实例

				self.registration.getNotifications({
					tag
				}).then((notifyList)=>{
					let notify
						;

					if( notifyList.length === 1 && data.url ){  // 如果推送信息中有 url，为桌面通知添加点击事件，浏览器打开 url 页面

						notify = notifyList[0];

						// todo 添加的事件并没有执行，原因未知
						notify.addEventListener('click', (e)=>{
						});
						notify.addEventListener('notificationclick', (e)=>{
						});

						notify.onclick = (e)=>{
							// self.clients.matchAll({
							// 	type: 'window'
							// }).then((clientList)=>{
							// 	let client = clientList.find((client)=>{
							// 			return client.url === data.url && 'focus' in client;
							// 		})
							// 		;
							//
							// 	if( client ){
							// 		return client.focus();
							// 	}
							//
							// 	if( clientList.openWindow ){
							// 		return clientList.openWindow( data.url );
							// 	}
							// });
						};
					}
				});
			}) );
		}
	});

	/**
	 * 通知点击事件
	 * */
	self.addEventListener('notificationclick', (event)=>{

		event.notification.close();

		console.log('桌面通知被点击')

		// todo 统计桌面通知被点击

		// event.waitUntil( self.clients.matchAll({
		// 	type: 'window'
		// }).then((clientList)=>{
		// 	let client = clientList.find((client)=>{
		// 			return client.url === '/' && 'focus' in client;
		// 		})
		// 		;
		//
		// 	if( client ){
		// 		return client.focus();
		// 	}
		//
		// 	if( clientList.openWindow ){
		// 		return clientList.openWindow('/');
		// 	}
		// }) );
	});
	/**
	 * 通知关闭事件
	 * */
	self.addEventListener('notificationclose', (event)=>{
		console.log('桌面通知被关闭');

		// todo 统计桌面通知被点击
	});
}

export default serviceWorkerRun;