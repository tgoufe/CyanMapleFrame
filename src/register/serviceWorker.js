'use strict';

import merge from '../util/merge.js';
import log   from '../util/log.js';

let serviceWorkerReady
	;

if( 'serviceWorker' in navigator ){
	serviceWorkerReady = navigator.serviceWorker.ready;
}
else{
	serviceWorkerReady = Promise.reject( new Error('该浏览器不支持 Service Worker') );
}

function urlBase64ToUnit8Array(base64String){
	let padding = '='.repeat((4 - base64String.length %4) %4)
		, base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
		, rawData = window.atob( base64 )
		, outputArray = new Uint8Array( rawData.length )
		;

	for( let i = 0; i < rawData.length; ++i ){
		outputArray[i] = rawData.charCodeAt( i );
	}

	return outputArray;
}

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
	let config = merge(options, registerServiceWorker.CONFIG)
		;

	// 存在已缓存文件
	if( config.file in registerServiceWorker._CACHE ){
		return Promise.resolve( registerServiceWorker._CACHE[config.file] );
	}

	if( 'serviceWorker' in navigator ){
		// todo 好像有问题
		registerServiceWorker._CACHE[config.file] = navigator.serviceWorker.register(config.file, {
			scope: config.scope
		}).then((regist)=>{
			let serviceWorker = regist.installing || regist.waiting || regist.active || null
				;

			if( serviceWorker ){
				// 监听 Service Worker 状态变化
				serviceWorker.addEventListener('statechange', (e)=>{
					log(`state change: ${e.target.state}`);
				});
			}

			return true;
		}).catch((e)=>{
			// 注册失败 todo 发送 log

			log( e );
			return Promise.reject( new Error('Service Worker 注册失败') );
		});

		navigator.serviceWorker.addEventListener('message', ()=>{
			// todo 处理事件
		});
	}

	return serviceWorkerReady.then((regist)=>{
		/**
		 * 注册成功显示桌面提示
		 * todo
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
		 * todo
		 * */
		regist.pushManager.getSubscription().then((subscription)=>{ // 获取当前已订阅
			if( subscription ){    // 已订阅
				log(`已经订阅 ${subscription.endpoint}`);

				return subscription;
			}

			return regist.pushManager.subscribe({
				userVisibleOnly: true   // 所有推送消息必须对用户可见
				, applicationServerKey: urlBase64ToUnit8Array( options.applicationServerKey )
			}).then((sub)=>{
				log(`订阅成功 ${sub.endpoint}`);

				return sub;
			}).catch((e)=>{
				// 订阅失败 todo 发送请求
				log('订阅失败', e);

				return Promise.reject( new Error('订阅失败') );
			});
		}).then(({endpoint})=>{
			// 将 endpoint 订阅信息发送到服务器端保存
		}, ()=>{});

		return new Promise((resolve)=>{
			function resolveWithRegistration(){
				navigator.serviceWorker.getRegistration().then((registration)=>{
					resolve( registration );
				});
			}

			/**
			 * 当 Service Worker 未注册成功时
			 * navigator.serviceWorker.controller 的值为 null
			 * */
			if( navigator.serviceWorker.controller ){
				resolveWithRegistration();
			}
			else{
				navigator.serviceWorker.addEventListener('controllerchange', resolveWithRegistration);
			}
		});
	});
}

/**
 * @static
 * @private
 * */
registerServiceWorker._CACHE = {};

/**
 * @static
 * */
registerServiceWorker.CONFIG = {
	file: '/sw.js'
	, scope: '/'
};

function registerSyncTag(tag){
	return serviceWorkerReady.then((regist)=>{
		regist.sync.register(tag);
	});
}

export default registerServiceWorker;

export {
	registerServiceWorker
	, registerSyncTag
};