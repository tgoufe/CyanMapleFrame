'use strict';

import merge    from '../util/merge.js';

/**
 * @summary     注册 Service Worker
 * @function    registerServiceWorker
 * @param       {Object}        [options={}]
 * @param       {string}        options.file
 * @param       {string|Object} [welcome='']
 * @return      {Promise}   返回一个 Promise 对象，在 resolve 时传入注册后的结果
 * */
function registerServiceWorker(options={}, welcome=''){
	let config = merge(options, registerServiceWorker._CONFIG)
		;

	return new Promise((resolve, reject)=>{
		if( 'serviceWorker' in navigator ){
			// 不存在已缓存文件
			if( !(config.file in registerServiceWorker._CACHE) ){

				registerServiceWorker._CACHE[config.file] = navigator.serviceWorker.register(config.file, {
					scope: config.scope
				}).then((regist)=>{
					let serviceWorker
						;

					if( regist.installing ){
						serviceWorker = regist.installing;
					}
					else if( regist.waiting ){
						serviceWorker = regist.waiting;
					}
					else if( regist.active ){
						serviceWorker = regist.active;
					}

					if( serviceWorker ){
						// todo 用途
						serviceWorker.addEventListener('statechange', (e)=>{
							console.log( e );
						});
					}

					return true;
				}).catch((e)=>{
					// 注册失败 todo 发送 log

					console.log( e );
				});

				Notification.requestPermission().then((result)=>{
					if( result === 'granted' ){
						navigator.serviceWorker.ready.then((regist)=>{
							if( !welcome ){
								return;
							}

							if( typeof welcome === 'string' ){

								welcome && regist.showNotification(welcome);
							}
							else if( typeof welcome === 'object' ){
								welcome.title && regist.showNotification(welcome.title, welcome);
							}
						});
					}
				});

				navigator.serviceWorker.ready.then((regist)=>{
					regist.pushManager.getSubscription().then((res)=>{
						if( !res ){
							regist.pushManager.subscribe({
								userVisibleOnly: true
							}).then((sub)=>{
								console.log('Subscribed! Endpoint', sub.endpoint);
							});
						}
						else{
							console.log('remain endpoint', res.endpoint);
						}
					});
				});
			}

			resolve( registerServiceWorker._CACHE[config.file] );
		}
		else{
			reject( new Error('该浏览器不支持 Service Worker') );
		}
	});
}

registerServiceWorker._CACHE = {};

registerServiceWorker._CONFIG = {
	file: '/sw.js'
	, scope: '/'
};

export default registerServiceWorker;