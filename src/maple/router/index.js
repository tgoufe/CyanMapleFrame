'use strict';

import device       from '../runtime/device.js';
import url          from '../runtime/url.js';
import merge        from '../util/merge.js';
import {listener}   from '../listener.js';

/**
 * @summary     路由回调函数
 * @callback    RouterEvent
 * @param       {Object}
 * @param       {Object}    params
 * */

/**
 * @class
 * @classdesc   路由配置类
 * */
class Router{
	/**
	 * @constructor
	 * @param   {Object}    [config={}]
	 * @param   {String}    [config.mode='history'] 路由模式，默认为 history 模式，也可以设置为 hash 模式
	 * @param   {Array}     [config.routers]
	 * */
	constructor(config={}){
		// this.listener = listener(this, 'routerChange', (e, newUrl, oldUrl)=>{
		//
		// });

		this.routers = [];

		this.config = merge(config, Router._CONFIG);

		if( this.config.mode === 'history' ){
			url.popState.add((e)=>{
				let tempUrl = url.parseUrl( location.href )
					, rs = this._get( tempUrl )
					;

				if( !rs ){
					console.log('router 中不存在', location.href, e);
				}
			});
		}
		else if( this.config.mode === 'hash' ){
			url.hashChange.add((e)=>{
				let newUrl = e.newUrl
					, tempUrl = url.parseUrl( newUrl )
					, newHash = tempUrl.hash
					;

				console.log( newHash );

				tempUrl = url.parseUrl( newHash );

				if( this.has( tempUrl.path ) ){
					this._get( tempUrl );
				}

				console.log(e, 'hash change');
			});
		}

		if( 'routers' in this.config && Array.isArray(this.config.routers) ){
			this.config.routers.forEach((route)=>{
				this.register( route );
			});
		}
	}

	// ---------- 私有方法 ----------
	/**
	 * @summary 跳转到路径
	 * @private
	 * @param   {String|Url}        path
	 * @param   {Object|Boolean}    [params={}]
	 * @return  {Boolean}           是否有匹配的路由执行成功
	 * */
	_get(path, params={}){
		let tempUrl = url.parseUrl( path )
			;

		path = tempUrl.path;

		return this.routers.some((route)=>{
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

				// 替换当前参数
				tempUrl.changeParams( temp );

				try{
					// 执行路由回调
					route.callback( temp );

					// this.listener.trigger(url.pack(), tempUrl.pack());
				}
				catch(e){
					console.log(path, '路由执行错误', e);
				}
			}

			return !!result;
		});
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
				this._get( tempUrl );
			}
		}
	}
	/**
	 * @summary 注册路径
	 * @param   {Object|String|RegExp}  route           当 route 为 Object 类型时且不为 RegExp 视为路由配置对象
	 * @param   {String|RegExp}         route.path
	 * @param   {RouterEvent}           route.callback
	 * @param   {Array}                 [route.children]    // todo
	 * @param   {RouterEvent}           [callback]      当 route 为 String 或 RegExp 类型时有效
	 * @return  {Router}                this
	 * @desc    path 以 / 开始视为根目录开始，否则以当前路径目录下，不能带参数和 hash(? #)
	 *          可以配置动态路由，参数名以 :name 的形式
	 *          解析出来的路由参数将以组合到传入 RouterEvent 函数的参数 params 中
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
	 * @summary 判断已注册的路由中是否有匹配该路径
	 * @param   {String}    path
	 * @return  {Boolean}
	 * */
	has(path){
		return this.routers.some((route)=>{
			return route.pattern.test( path );
		});
	}
	/**
	 * @summary 页面前进到目标 path
	 * @param   {String|Url}    path
	 * @param   {Object}        [params={}]
	 * @return  {Boolean}       是否存在对应 path
	 * @desc    当为 hash 模式时，该方法实际并未直接执行 router 的 callback，仅仅调用 url.setHash 方法，来触发 hashChange 事件进而执行 router 的 callback，所以将会是异步
	 * */
	go(path, params={}){
		let tempUrl = url.parseUrl( path )
			, rs
			;

		if( this.config.mode === 'history' ){
			// todo 传参问题
			rs = this._get(tempUrl, params);
		}
		else if( this.config.mode === 'hash' ){
			tempUrl.changeParams( params );
			
			rs = this.has( tempUrl.path );
		}

		if( rs ){
			this.pushHistory( tempUrl );
		}

		return rs;
	}
	/**
	 * @summary 对当前浏览器历史进行处理
	 * @param   {Url}   targetUrl
	 * @desc    在 history 模式下使用 url.pushHistory 接口
	 *          在 hash 模式下使用 url.setHash 接口
	 * */
	pushHistory(targetUrl){
		if( this.config.mode === 'history' ){
			url.pushHistory( targetUrl.pack() );
		}
		else if( this.config.mode === 'hash' ){
			url.setHash( targetUrl.path + targetUrl.query );
		}
	}
}

Router._CONFIG = {
	mode: 'history'
};

let router = new Router({
	mode: device.weixin ? 'hash' : 'history'
});


export default router;