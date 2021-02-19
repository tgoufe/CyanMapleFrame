'use strict';

import Base     from '../base.js';
import {Url}    from '../runtime/url.js';
import merge    from '../util/merge.js';
import HandlerQueue from '../util/handlerQueue.js';
import {Listener}   from '../util/listener.js';

/**
 * 路由默认配置
 * @const
 * */
const ROUTER_CONFIG = {
		mode: 'history'
		, baseUrl: ''   // 若设置 baseUrl 应以 / 结尾
		, eventType: 'routerChange'
	}
	;

/**
 * @summary     路由回调函数
 * @callback    RouterEvent
 * @param       {Object}    params
 * @return      {boolean|Promise|*} 返回 false 或 Promise.reject() 会中断后续的执行
 * */

/**
 * @summary     路由信息
 * @typedef     {Object}        RouteConfig
 * @property    {string|RegExp} path
 * @property    {RouterEvent}   [before]
 * @property    {RouterEvent}   [callback]
 * @property    {RouterEvent}   [after]
 // * @property    {Array}         [route.children]    // todo 子路由功能
 * */

/**
 * @summary     数据改变事件触发回调函数
 * @callback    RouterChangeEvent
 * @param       {Event}     event
 * @param       {string}    form
 * @param       {string}    to
 * @this        {Url}
 * @desc        函数将传入 topic,newValue 值，当 removeData 执行时也会触发事件，newValue 被传为 null
 *              由于统一使用 Listener 对象，第一个参数将为事件对象，当前事件将传入 {type: modelChange, target: 对象实例}
 * */

/**
 * @class
 * @desc    路由配置类
 * @extends Base
 * */
class Router extends Base{
	/**
	 * @constructor
	 * @param   {Object}        [config={}]
	 * @param   {string}        [config.baseUrl]
	 * @param   {string}        [config.mode='history'] 路由模式，默认为 history 模式，也可以设置为 hash 模式
	 * @param   {RouteConfig[]} [config.routers]
	 * @param   {Function}      [config.fallback]       当路由不存在时的回调函数，传入参数当前路由的 Url 类型参数
	 * @param   {string}        [config.eventType]
	 * */
	constructor(config={}){
		config = merge(config, Router.CONFIG);

		super( config );

		this.routers = [];

		this.config = config;

		this._historyList = [{
			url: this.$url.source
			, time: Date.now()
		}];

		this._$trigger = this.$listener.on(this, this.config.eventType);

		if( this.config.mode === 'history' ){
			this.$url.popState( this._popState );
		}
		else if( this.config.mode === 'hash' ){
			this.$url.hashChange( this._hashChange );
		}

		if( 'routers' in this.config && Array.isArray(this.config.routers) ){
			this.config.routers.forEach((route)=>{
				this.register( route );
			});
		}
	}

	// ---------- 静态方法 ----------
	/**
	 * @summary 与 App 类约定的注入接口
	 * @static
	 * @param   {Base}  app
	 * @desc    注入为 $router，配置参数名 router
	 * */
	static inject(app){
		app.inject('$router', new Router( app.$options.router ));
	}

	// ---------- 静态属性 ----------
	/**
	 * @summary 路由默认属性
	 * @static
	 * @const
	 * */
	static get CONFIG(){
		return ROUTER_CONFIG;
	}

	// ---------- 私有方法 ----------
	/**
	 * @summary 触发路由改变事件
	 * @private
	 * */
	_trigger(){
		let l = this._historyList.length
			, from = l > 2 ? this._historyList[l -2] : this._historyList[0]
			, to = this._historyList[l -1]
			;

		this._$trigger.trigger(from, to);
	}
	/**
	 * @summary 找到 path 对应 route 在 this.routers 中的位置
	 * @private
	 * @param   {string}    path
	 * @return  {number}    若不存在返回 -1
	 * */
	_getRouteIndex(path){
		return this.routers.findIndex((route)=>{
			return route.pattern.test( path );
		});
	}
	/**
	 * @summary 跳转到路径
	 * @private
	 * @param   {Url}       targetUrl
	 * @return  {Promise}
	 * */
	_get(targetUrl){
		let path = targetUrl.path
			, params = targetUrl.params
			, index = this._getRouteIndex( path )
			, router
			, result
			, execute
			, tempParams
			;

		this.$handlers.clear();

		if( index !== -1 ){
			router = this.routers[index];
			result = router.pattern.exec( path );

			if( result ){    // 存在匹配 path
				// 解析 url 中的参数
				tempParams = result.slice(1).reduce((all, d, i)=>{
					all[router.paramNames[i]] = d;

					return all;
				}, {});

				tempParams = merge(tempParams, params);

				router.before && this.$handlers.add( router.before );
				this.$handlers.add( router.callback );
				router.after && this.$handlers.add( router.after );

				execute = this.$handlers.promise.line( tempParams );
			}
			else{
				execute = Promise.reject( new Error('路由路径不匹配') );
			}
		}
		else{
			execute = Promise.reject( new Error('router 中不存在') );
		}

		return execute.catch((e)=>{
			if( e instanceof  Error){
				console.log(`${path} 路由执行错误`, e);
			}
			else{
				console.log(path, e);
			}

			return Promise.reject();
		});
	}
	/**
	 * @summary history 模式下的 go 接口的逻辑调用
	 * @private
	 * @param   {Url}   targetUrl
	 * */
	_goHistory(targetUrl){
		this._get( targetUrl ).then(()=>{
			this.$url.pushHistory( targetUrl.pack() );

			this._historyList.push({
				url: targetUrl.pack()
				, time: Date.now()
			});
		}).then(()=>{
			this._trigger();
		});
	}
	/**
	 * @summary hash 模式下的 go 接口的逻辑调用
	 * @private
	 * @param   {Url}   targetUrl
	 * */
	_goHash(targetUrl){
		this.$url.setHash( targetUrl.path + targetUrl.query );
	}
	/**
	 * @summary popState 事件监听回调
	 * @param   {Event} e
	 * */
	_popState = (e)=>{
		let tempUrl = this.$url.parseUrl( location.href )
			;

		if( this.has(tempUrl.path) ){

			this._get( tempUrl ).then(()=>{
				this._historyList.push({
					url: tempUrl.source
					, time: Date.now()
				});
			}).then(()=>{
				this._trigger();
			});
		}
		else{
			console.log(`router 中不存在 ${location.href}`, e);
			this.config.fallback && this.config.fallback( tempUrl );
		}
	}
	/**
	 * @summary hashChange 事件监听回调
	 * @param   {Event} e
	 * */
	_hashChange = (e)=>{
		let newUrl = e.newURL
			, tempUrl = this.$url.parseUrl( newUrl )
			, newHash = tempUrl.hash
			;

		tempUrl = this.$url.parseUrl( newHash );

		if( this.has( tempUrl.path ) ){

			this._get( tempUrl ).then(()=>{
				this._historyList.push({
					url: newUrl
					, time: Date.now()
				});
			}).then(()=>{
				this._trigger();
			});
		}
		else{
			console.log(`router 中不存在 ${tempUrl.path}`, e);
			this.config.fallback && this.config.fallback( tempUrl.path );
		}
	}

	// ---------- 公有方法 ----------
	/**
	 * @summary 进入页面初始化 router
	 * */
	init(){
		let tempUrl
			;

		if( this.config.mode === 'history' ){
			tempUrl = this.$url;
		}
		else if( this.config.mode === 'hash' ){
			tempUrl = this.$url.parseUrl( this.$url.hash || '/' );
		}

		if( this.has(tempUrl.path) ){
			this._get( tempUrl );
		}
	}
	/**
	 * @summary 注册路径
	 * @param   {string|RegExp|RouteConfig|RouteConfig[]}   route       当 route 为 Object 类型时且不为 RegExp 视为路由配置对象
	 * @param   {RouterEvent}                               [callback]  当 route 为 string 或 RegExp 类型时有效
	 * @return  {Router}                                    this
	 * @desc    path 以 / 开始视为根目录开始，否则以当前路径目录下，不能带参数和 hash(? #)
	 *          可以配置动态路由，参数名以 :name 的形式
	 *          解析出来的路由参数将以组合到传入 RouterEvent 函数的参数 params 中
	 *          若存在同名属性则覆盖
	 * */
	register(route, callback=(()=>{})){
		let paramNames = []
			, pattern = null
			, path = ''
			, before
			, after
			;

		// route 是数组类型
		if( Array.isArray(route) ){
			route.forEach((config)=>{
				this.register( config );
			});

			return this;
		}

		// 处理 path
		if( typeof route === 'object' && !(route instanceof RegExp) ){
			path = route.path;
			callback = route.callback || (()=>{});
			before = route.before;
			after = route.after;
		}
		else{
			path = route;
		}

		// 处理 pattern
		if( typeof path === 'object' && (path instanceof RegExp) ){
			pattern = path;
		}
		else if( typeof path === 'string' ){
			// 替换动态路由参数
			pattern = path.replace(/:([^\/]*)/g, (str, paramName)=>{
				paramNames.push( paramName );

				return '([^\\\/]+)';
			});

			if( !/^\//.test(path) ){    // 非根目录，当前目录下
				if( this.config.baseUrl ){
					pattern = this.config.baseUrl + pattern;  // 基于 baseUrl
				}
				else{
					pattern = this.$url.dir + pattern;  // 添加根目录
				}
			}

			// // 过滤掉路径中的非法字符
			// pattern = new RegExp('^'+ pattern.replace(/([\\\.\+\*\?\[\^\]\$\(\)\{\}\=\!\<\>\|\:])/g, "\\$1") +'$');
			pattern = new RegExp('^'+ pattern +'$');
		}

		// 添加到 routers
		if( pattern ){
			this.routers.push({
				pattern
				, paramNames
				, before
				, callback
				, after
			});
		}

		// todo 子路由 是否需要？
		// if( typeof route === 'object' && ('children' in route) ){
		// 	// this.children = new Router({
		// 	// 	routers: router.children
		// 	// });
		// }

		return this;
	}
	/**
	 * @summary 判断已注册的路由中是否有匹配该路径
	 * @param   {string|Url}    path
	 * @return  {boolean}
	 * */
	has(path){
		path = this.$url.parseUrl( path ).path;

		return this._getRouteIndex( path ) !== -1;
	}
	/**
	 * @summary 页面前进到目标 path
	 * @param   {string|Url|number} path
	 * @param   {Object}            [params={}]
	 * @return  {boolean}           是否存在对应 path
	 * @desc    当为 hash 模式时，该方法实际并未直接执行 router 的 callback，仅仅调用 url.setHash 方法，来触发 hashChange 事件进而执行 router 的 callback，所以将会是异步
	 *          当 path 为数字类型的时候，实际为调用 url.go 方法，该封装主要为了统一调用对象
	 * */
	go(path, params={}){
		if( typeof path === 'number' ){
			this.$url.go( path );

			return true;
		}

		let targetUrl = this.$url.parseUrl( path )
			, rs = this.has( targetUrl.path )
			;

		if( rs ){
			targetUrl.changeParams( params );

			if( this.config.mode === 'history' ){   // history 模式
				this._goHistory( targetUrl );
			}
			else if( this.config.mode === 'hash' ){ // hash 模式
				// hash 模式下并不直接调用 _get 方法来执行路径跳转
				// 使用 url.setHash 设置 hash 来触发 hashChange 事件来调用 _get 方法
				// 因为修改 hash 与 pushState 方法不同，pushState 方法不会触发 popState 事件
				// 但 hash 的修改都会触发 hashChange 事件
				this._goHash( targetUrl );
			}
		}

		return rs;
	}
	/**
	 * @summary 后退
	 * @desc    实际为调用 url.back 方法，该封装主要为了统一调用对象
	 * */
	back(){
		this.$url.back();
	}
	/**
	 * @summary 前进
	 * @desc    实际为调用 url.forward 方法，该封装主要为了统一调用对象
	 * */
	forward(){
		this.$url.forward();
	}

	/**
	 * @summary 添加事件监听
	 * @param   {RouterChangeEvent} callback
	 * */
	on(callback){
		this.$listener.on(this, this.config.eventType, callback);
	}

	// ---------- 公有属性 ----------
	/**
	 * @summary 获取当前路径
	 * */
	get currentPath(){
		return this.$url.parseUrl( this._historyList[this._historyList.length -1] ).path;
	}
}

Router.use(Url, Listener, HandlerQueue);

export default Router;

export {
	Router
};