'use strict';

/**
 * @file    Service Worker 后台执行文件
 * */

import CacheStorageModel    from '../model/cacheStorage.js';
// import notify               from '../notify.js';

const IMAGE_EXT = [
		'png'
		, 'jpg'
		, 'jpeg'
		, 'gif'
		, 'bmp'
		, 'webp'
	]
	;

/**
 * @summary     执行 Service Worker 监听事件
 * @function
 * @param       {string}                [cacheName='cacheStorage']
 * @param       {Request[]|string[]}    [cacheUrls=[]]
 * @param       {Object}                [errorHandler=[]]
 * @param       {string|Array}          [errorHandler[].ext]
 * @param       {Function}              [errorHandler[].handler]
 * */
function serviceWorkerRun(cacheName='cacheStorage', cacheUrls=[], errorHandler=[]){
	const cacheStorage = new CacheStorageModel({
			cacheName
		})
		;

	console.log('Service Worker 已加载');

	/**
	 * Service Worker 安装事件
	 * */
	self.addEventListener('install', (event)=>{
		console.log('Service Worker 安装完成，install event', event);

		let preCache = new Promise((resolve, reject)=>{
				if( Array.isArray(cacheUrls) && cacheUrls.length ){
					resolve( cacheUrls );
				}
				else{
					reject();
				}
			})
			;

		event.waitUntil( preCache.then((cacheUrls)=>{   // 预加载
			console.log('预加载', cacheUrls);

			return cacheStorage.addAll( cacheUrls );
		}, ()=>{
			console.log('没有预加载文件');
		}).then(()=>{
			/**
			 * self.skipWaiting 跳过等待激活新的 Service Worker
			 * 让 Service Worker 进入 activate 状态
			 * */
			return self.skipWaiting();
		}).catch((e)=>{
			// 安装失败
			// todo 发送记录

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
			cacheStorage.keys()
			, cacheName
		]).then(([keyList, cacheName])=>{
			return Promise.all( keyList.reduce((all, key)=>{
				// 更新，将不是正在使用的缓存删除
				if( cacheName !== key ){
					all.push( cacheStorage.cacheDelete(key) );
				}

				return all;
			}, []) );
		}).then(()=>{
			/**
			 * self.clients.claim 设置本身为 active 的 Service Worker
			 * */
			return self.clients.claim();

			// self.clients.claim().then(()=>{
			// 	return self.clients.matchAll({
			// 		type: 'window'
			// 	});
			// }).then((clients)=>{
			// 	return clients.filter((client)=>{
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
		let request = event.request
			;

		// 判断为跨域请求
		if( request.url.search(location.host) === -1 ){
			request = new Request(request.url, {
				mode: 'cors'
			});
		}

		// event.respondWith( fetch(request).then((response)=>{
		// 	return cacheStorage.setData(request.clone(), response.clone()).then(()=>{
		// 		return response;
		// 	});
		// }, ()=>{
		// 	return cacheStorage.getData( request.clone() );
		// }) );

		// 克隆该请求，Request 对象是 stream 类型的，只能读取一次
		event.respondWith( cacheStorage.getData( request.clone() ).then((response)=>{
			let result
				;

			if( response ){

				// // todo 判断是否需要更新资源
				// if( isNeedRefresh ){
				// 	result = Promise.reject({
				// 		message: '需要更新资源'
				// 	});
				// }
				// else{
				// 	result = response;
				// }

				result = response;
			}
			else{
				result = Promise.reject({
					message: '不存在 '+ request.url +' 的相关缓存'
				});
			}

			return result;
		}).catch((e)=>{
			console.log( e && e.message );

			return fetch( request ).then((response)=>{
				let isCache = false
					;

				// 判断是否为一个异常的响应
				if( !response || response.status !== 200 || response.type !== 'basic' ){

					if( response.status > 200 && response.status < 400 ){

					}

					console.log(`不缓存 ${request.url} status: ${response.status} type: ${response.type}`);
					// 异常响应，跨域资源，不缓存直接返回
					// 跨域资源 response.status 会返回 0
					// response.type:
					// basic    标准值
					// cors     跨域请求
					// error    网络错误
					// opaque   响应 no-cors 的跨域请求

					// todo 离线时处理
					if( errorHandler && Array.isArray(errorHandler) && errorHandler.length ){
						let index = errorHandler.findIndex((d)=>{
								if( typeof d.ext === 'string' ){
									return event.request.endsWith('.'+ d.ext);
								}
								else if( Array.isArray( d.ext ) ){
									return d.ext.some((ext)=>{
										return event.request.endsWith('.'+ ext);
									});
								}
								else if( d.ext instanceof RegExp ){
									return d.ext.test( event.request.url );
								}

								return false;
							})
							, result = null
							;

						if( index !== -1 ){
							result = errorHandler[index].handler(request, response);
						}

						if( result instanceof Response ){
							response = result;
						}
					}
					/**
					 * 当为图片时
					 * */
					// let isImg = IMAGE_EXT.some((ext)=>{
					// 		return request.endsWith('.'+ ext);
					// 	})
					// 	;
					//
					// if( isImg ){
					// 	/**
					// 	 * 返回占位图
					// 	 * */
					// 	response = new Response('', {
					// 		headers: {
					// 			'Content-Type': 'image/svg+xml'
					// 			, 'Cache-Control': 'no-store'
					// 		}
					// 	})
					// }
				}
				else{
					// todo 判断哪些请求需要缓存

					if( request.method === 'GET' ){   // GET 类请求
						/**
						 * CacheStorage 只能缓存 GET 请求
						 * */
						isCache = true;
					}
				}

				if( isCache ){
					cacheStorage.setData(request, response.clone()).then(()=>{
						console.log(`已缓存 ${request.url}`);
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
		let {data, source} = event
			, {id, url, focused, visibilityState} = source
			;

		// 向所有打开的窗口通信
		// todo 消息处理
		self.clients.matchAll().then((clients)=>{
			clients.forEach((client)=>{
			    let {id} = client
			        ;

				// event.source 为消息来源的页面
				client.postMessage( event.data );
			});
		});
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
					, body: event.data.text()
					, tag
					// , url
					// , icon
					// , actions: [{
					// 	action: 'ok', title: '确定'
					// }, {
					// 	action: 'cancel', title: '取消'
					// }]
					// , vibrate: [300, 100, 400]
				};
			}

			/**
			 * self.Notification 方法使用报错，只能使用 showNotification 方法显示桌面通知，但返回值的 Promise resolve 中并没有出入 Notification 实例
			 * */

			/**
			 * event.waitUntil 接收 Promise 类型参数，等到 Promise 完成时，事件才最终完成
			 * */
			event.waitUntil( self.registration.showNotification(data.title, data) );
		}
	});

	/**
	 * 订阅状态改变事件
	 * */
	self.addEventListener('pushsubscriptionchange', (event)=>{
		// todo 重新订阅
	});

	/**
	 * 同步数据事件
	 * */
	self.addEventListener('sync', (event)=>{
		// todo do something
		console.log(event.tag, event.lastChance);
	});

	/**
	 * 通知点击事件
	 * */
	self.addEventListener('notificationclick', (event)=>{
		// 关闭点击的通知
		event.notification.close();
		console.log('桌面通知被点击');

		let {action} = event
			;

		// 添加动作
		switch( action ){
			case 'ok':
				// event.waitUntil( self.clients.openWindow(event.notification.data) );
				break;
			case 'cancel':
				break;
			default:
				break;
		}

		if( event.notification.data ){
			// 打开新窗口
			event.waitUntil( self.clients.openWindow(event.notification.data) );
		}

		// todo 统计桌面通知被点击

		// event.waitUntil( self.clients.matchAll({
		// 	type: 'window'
		// }).then((clients)=>{
		// 	let client = clients.find((client)=>{
		// 			return client.url === '/' && 'focus' in client;
		// 		})
		// 		;
		//
		// 	if( client ){
		// 		return client.focus();
		// 	}
		//
		// 	if( clients.openWindow ){
		// 		return clients.openWindow('/');
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