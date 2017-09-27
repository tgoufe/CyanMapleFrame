'use strict';

import url          from 'url';
import merge        from '../util/merge.js';
import {listener}   from '../listener.js';
import view     from '../view/index.js';

/**
 * @summary     路由回调函数
 * @callback    RouterEvent
 * @param       {Object}
 * @param       {Object}    params
 * */

/**
 * @class
 * @classdesc
 * @desc        路由配置类
 * */
class Router{
	/**
	 * @constructor
	 * @param   {Object}    [config={}]
	 * */
	constructor(config={}){
		this.listener = listener(this, 'routerChange', (e, newUrl, oldUrl)=>{

		});

		this.routers = [];

		if( 'routers' in config && Array.isArray(config.routers) ){
			config.routers.forEach((route)=>{
				this.register( route );
			});
		}
	}

	// ---------- 公有方法 ----------
	/**
	 * @summary 进入页面初始化 router
	 * */
	init(){
		let tempUrl
			;

		if( url.hash ){
			tempUrl = url.parseUrl( url.hash );

			if( this.has( tempUrl.path ) ){
				this.get( tempUrl );
			}
		}
	}
	hash(){}
	/**
	 * @summary 注册路径
	 * @param   {Object|String|RegExp}  route           当 route 为 Object 类型时且不为 RegExp 视为路由配置对象
	 * @param   {String|RegExp}         route.path
	 * @param   {Function}              route.callback
	 * @param   {Array}                 [route.children]
	 * @param   {RouterEvent}           [callback]      当 route 为 String 或 RegExp 类型时有效
	 * @return  {Router}                this
	 * @desc    path 以 / 开始视为根目录开始，否则以当前路径目录下，不能带参数和 hash(? #)
	 *          可以配置动态路由，参数名以 :name 的形式
	 *          解析出来的路由参数将以组合到出入 RouterEvent 函数的参数 params 中
	 *          若存在同名属性则覆盖
	 * */
	register(route, callback){
		let paramNames = []
			, pattern = null
			, path = ''
			;

		// 处理 path
		if( typeof route === 'object' && !(route instanceof RegExp) ){
			path = route.path;
			callback = route.callback;
		}
		else{
			path = route;
		}

		// 处理 pattern
		if( typeof path === 'object' && (path instanceof RegExp) ){
			pattern = path;
		}
		else if( typeof path === 'string' ){

			if( !/^\//.test(path) ){    // 当前目录下
				path = url.dir + path;  // 添加根目录
			}

			pattern = path.replace(/:([^\/]*)/g, (str, paramName)=>{
				paramNames.push( paramName );

				return '([^\\\/]+)';
			});

			pattern = new RegExp('^'+ pattern +'$');
		}

		// 添加到 routers
		if( pattern ){
			this.routers.push({
				pattern
				, paramNames
				, callback
			});
		}

		// todo 子路由
		if( typeof router === 'object' && ('children' in router) ){
			// this.children = new Router({
			// 	routers: router.children
			// });
		}

		return this;
	}
	/**
	 * @summary 跳转到路径
	 * @param   {String|Url}        path
	 * @param   {Object|Boolean}    [params={}]
	 * @desc
	 * */
	get(path, params={}){
		let tempUrl = url.parseUrl( path )
			;

		path = tempUrl.path;

		// return
		// this.routers.reduce((promise, route)=>{
		// 	let result = route.pattern.exec( path )
		// 		, tempParams
		// 		;
		//
		// 	if( result ){    // 存在匹配 path
		//
		// 		// 解析 url 中的参数
		// 		tempParams = route.paramNames.reduce((all, d, i)=>{
		// 			all[d] = result[i +1];
		//
		// 			return all;
		// 		}, {});
		// 		tempParams = merge(tempParams, params);
		//
		// 		if( 'before' in route && typeof route.before === 'function' ){
		// 			promise = promise.then(()=>{
		// 				return new Promise((resolve)=>{
		// 					route.before(url.pack(), path, tempParams, resolve);
		// 				});
		// 			});
		// 		}
		//
		// 		promise = promise.then((exec)=>{
		// 			if( exec ){
		// 				return route.callback( tempParams );
		// 			}
		// 		});
		//
		// 		if( 'after' in route && typeof route.after === 'function' ){
		// 			promise = promise.then(()=>{
		// 				return new Promise((resolve, reject)=>{
		// 					route.after(url.pack(), path, tempParams, (execRemain)=>{
		// 						if( execRemain ){
		// 							resolve();
		// 						}
		// 						else{
		// 							reject();
		// 						}
		// 					});
		// 				});
		// 			});
		// 		}
		// 	}
		//
		// 	return promise;
		// }, Promise.resolve());

		return this.routers.map((route)=>{
			let result = route.pattern.exec( path )
				, temp
				;

			if( result ){    // 存在匹配 path
				// 解析 url 中的参数
				temp = result.slice(1).reduce((all, d, i)=>{
					all[route.paramNames[i]] = d;

					return all;
				}, {});

				temp = merge(temp, params);

				try{
					// 执行路由程序

					route.callback( temp );

					this.listener.trigger(url.pack(), tempUrl.pack());
				}
				catch(e){
					console.log(path, '路由执行错误', e);
				}
			}

			return !!result;
		}).some(d=>d);
	}
	/**
	 * @summary 判断已注册的路由中是否有匹配该路径
	 * @param   {String}    path
	 * @return  {Boolean}
	 * */
	has(path){
		return this.routers.some((route)=>{
			return route.pattern.test( path );
		});
	}
}

let temp = {
	pushState(){}
	, replaceState(){}
	, go(){}
	, forward(){}
	, back(){}

	, assign(){}
	, replace(){}
	, reload(){}
};

let router = new Router();

url.popState.add(()=>{
	let rs = router.get( location.href )
		;
	
	if( !rs ){
		console.log('router 中不存在', location.href);
	}
});

export default router;