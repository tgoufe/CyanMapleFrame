'use strict';

import merge    from '../util/merge.js';

/**
 * @summary     注册 Service Worker
 * @function    registerServiceWorker
 * @param       {Object}        [options={}]
 * @param       {string}        options.file
 * @param       {string}        options.applicationServerKey
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
						// 监听 Service Worker 状态变化
						serviceWorker.addEventListener('statechange', (e)=>{
							console.log('state chagne:', e.target.state);
						});
					}

					return true;
				}).catch((e)=>{
					// 注册失败 todo 发送 log

					console.log( e );
				});

				navigator.serviceWorker.ready.then((regist)=>{
					/**
					 * 注册成功显示桌面提示
					 * */
					Notification.requestPermission().then((result)=>{
						if( result === 'granted' ){
							if( !welcome ){
								return;
							}

							if( typeof welcome === 'string' ){

								welcome && regist.showNotification(welcome);
							}
							else if( typeof welcome === 'object' ){
								welcome.title && regist.showNotification(welcome.title, welcome);
							}
						}
					});

					/**
					 * 订阅推送信息
					 * */
					regist.pushManager.getSubscription().then((subscription)=>{ // 获取当前已订阅
						if( !subscription ){    // 未订阅
							subscription = regist.pushManager.subscribe({
								userVisibleOnly: true
							}).then((sub)=>{
								console.log('订阅成功', sub.endpoint);

								return subscription;
							}).catch((e)=>{
								// 订阅失败 todo 发送请求
								console.log('订阅失败', e);

								return Promise.reject( new Error('订阅失败') );
							});
						}
						else{
							console.log('已经订阅', subscription.endpoint);
						}

						return subscription;
					}).then(({endpoint})=>{
						// 将 endpoint 订阅信息发送到服务器端保存
					}, ()=>{});

					/**
					 * 当 Service Worker 未注册成功时
					 * navigator.serviceWorker.controller 的值为 null
					 * */
					if( navigator.serviceWorker.controller ){
						resolve( navigator.serviceWorker.controller );
					}
					else{
						reject( new Error('Service Worker 注册失败') );
					}
					// resolve( registerServiceWorker._CACHE[config.file] );
				});
			}
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