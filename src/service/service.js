'use strict';

import Model        from '../model/model.js';
import merge        from '../util/merge.js';
import HandlerQueue from '../util/handlerQueue.js';

/**
 * @file    所有 ajax 请求基类
 * */

/**
 * 默认配置
 * @const
 * */
const SERVICE_MODEL_CONFIG = {
		baseUrl: ''
		, cache: false
		, dataType: 'json'
		, timeout: 10000
		, xhrFields: {
			withCredentials: true
		}
	}
	/**
	 * 拦截器
	 * @const
	 * */
	, INTERCEPTOR = {
		req: new HandlerQueue()
		, res: new HandlerQueue()
	}
	, SUPPORT_METHOD = ['get', 'post', 'put', 'delete']
	;

/**
 * @class
 * @desc    对服务器接口进行封装，与 Model 统一接口，隔离数据与数据来源的问题，在 Model.factory 工厂方法注册为 service，别名 s，将可以使用工厂方法生成
 *          必须通过注入的方式注入一个 $request 方法用来发送请求
 * @extends Model
<pre>
let serviceModel = new ServiceModel()
    , service = Model.factory('service')
    , s = Model.factory('s')
    , api = new ServiceModel({
		baseUrl: 'a.b.com'
		, resource: {
			a: 'a/x'
			, b: 'b/x'
			, c: 'c/:id'
		}
    })
    ;

s.getData('/a/x', {
	data: {
		a: 1
	}
});
s.resource('b', 'b/x');
s.b({
	data: {
		a: 1
	}
});
s.b.post({
	data: {
		a: 1
	}
});

api.a({
	data: {
		a: 1
	}
}); // get 方法请求
api.a.post({
	data: {
		b: 1
	}
}); // post 方法请求
</pre>
 *
 * @todo 通道功能，一个 topic 一次只能发送一条，其余保存在队列中，等待当前发送的返回，再发送下一条
 * @todo 限制同时发送的请求的最大数量
 * */
class ServiceModel extends Model{
	/**
	 * @constructor
	 * @param   {Object}    [config={}]
	 * @param   {string}    [config.baseUrl]
	 * @param   {number}    [config.timeout]
	 * @param   {string}    [config.eventType]
	 * @param   {Object}    [config.resource]
	 * @param   {boolean}   [config.pipe]
	 * @param   {number}    [config.pool]
	 * */
	constructor(config={}){
		config = merge(config, ServiceModel.CONFIG);

		super( config );

		this._config = config;

		if( !('$request' in this) ){
			throw new Error(`$request 未注入，无法发送请求`);
		}
		
		this._value = new Map();

		// 同步相关
		this._syncTarget = null;
		this._syncHandler = null;

		// 请求池
		this.poolSize = config.pool || 0;
		this.poolCurrent = 0;
		this.pool = [];

		// 拦截器
		this.interceptor = {
			req: new HandlerQueue()
			, res: new HandlerQueue()
		};

		this._execReqInterceptor = new HandlerQueue();
		this._execReqInterceptor.add( ServiceModel.interceptor.req );
		this._execReqInterceptor.add( this.interceptor.req );

		this._execResInterceptor = new HandlerQueue();
		this._execResInterceptor.add( ServiceModel.interceptor.res );
		this._execResInterceptor.add( this.interceptor.res );

		// 资源
		if( 'resource' in config ){
			Object.entries( config.resource ).forEach(([k, v])=>{
				this.resource(k, v);
			});
		}
	}

	// ---------- 静态方法 ----------
	/**
	 * @summary 与 App 类约定的注入接口
	 * @static
	 * @param   {Base}  app
	 * @desc    注入为 $service，配置参数名 service
	 * */
	static inject(app){
		app.inject('$service', new ServiceModel( app.$options.service ));
	}

	// ---------- 静态属性 ----------
	/**
	 * @summary 默认配置
	 * @static
	 * @const
	 * */
	static get CONFIG(){
		return SERVICE_MODEL_CONFIG;
	}
	/**
	 * @summary 拦截器
	 * @static
	 * @const
	 * */
	static get interceptor(){
		return INTERCEPTOR;
	}

	// ---------- 私有方法 ----------
	/**
	 * @summary 对 setData 和 getData 的 options 添加默认参数
	 * @private
	 * @param   {Object}    options setData 和 getData 的 options 参数
	 * @return  {Object}
	 * */
	_setOpts(options){
		return merge(options, ServiceModel.CONFIG);
	}
	/**
	 * @summary 执行请求拦截器进行验证
	 * @private
	 * @param   {string}    topic
	 * @param   {Object}    options
	 * @return  {Promise}
	 * */
	_reqInterceptor(topic, options){
		return this._execReqInterceptor.promise.line({topic, options});
	}
	/**
	 * @summary 执行响应拦截器进行验证
	 * @private
	 * @param   {Object}    result
	 * @param   {string}    result.topic
	 * @param   {Object}    result.options
	 * @param   {Object}    [result.res]
	 * @param   {Error}     [result.error]
	 * @return  {Promise}
	 * */
	_resInterceptor(result){
		return this._execResInterceptor.promise.line( result );
	}


	createRequest({pool}){
		let count = 0
			, waitQueue = []
			;

		function next(rs){
			count--;

			if( count < pool && waitQueue.length > 0 ){
				let {url, params, resolve} = waitQueue.pop();

				fetch(url, params).catch(()=>{return 1;}).then((rs)=>{
					resolve( rs );

					count++;
					next();
				});
			}

			return rs;
		}

		return function(url, params){
			if( count < pool ){
				let t = fetch(url, params).catch(()=>{return 1;});

				count++

				return t.then( next );
			}
			else{
				return new Promise((resolve)=>{
					waitQueue.push({
						url
						, params
						, resolve
					});
				});
			}
		}
	}

	/**
	 * @summary
	 * @private
	 * @desc
	 * */
	_poolNext(){
		this.poolCurrent--;

		if( this.poolCurrent < this.poolSize && this.pool.length > 0 ){
			let {args, resolve, reject} = this.pool.pop()
				;

			this._send( ...args).then(resolve, reject).then(()=>{
				this.poolCurrent++;

				this._poolNext();
			});
		}
	}
	/**
	 * @summary 发送请求，在发送请求之前执行请求拦截器，在请求返回后执行响应拦截器
	 * @private
	 * @param   {string|Object} topic
	 * @param   {Object}        options
	 * @param   {string}        [method='GET']
	 * @return  {Promise}
	 * */
	_send(topic, options, method='GET'){
		if( this.poolSize && this.poolCurrent >= this.poolSize ){
			return new Promise((resolve, reject)=>{
				this.pool.push({
					args: [topic, options, method]
					, resolve
					, reject
				});
			});
		}

		if( typeof topic === 'object' ){
			options = topic;
			topic = topic.url;
		}

		if( !topic ){   // topic 无值不做任何处理
			return Promise.reject( new Error('缺少 topic 参数') );
		}

		topic = this._config.baseUrl + topic;

		options = this._setOpts( options );

		options.method = options.method || method;

		// 执行请求拦截器
		let result = this._reqInterceptor(topic, options).then(()=>{
			// 发送请求，向服务器发送数据
			console.log(`发送 ${options.method} 请求 ${topic}`);

			return this.$request(topic, options);
		}).then((result)=>{
			return Promise.all([
				result

				// 执行响应拦截器
				, this._resInterceptor( result )
			]);
		}).then(([result])=>{
			if( 'res' in result ){
				return result.res;
			}
			else if( 'error' in result ){
				return Promise.reject( result.error );
			}
			else{
				return Promise.reject( new Error('未知错误') );
			}
		}).then((res)=>{
			// 将数据同步
			super.setData(topic, {topic, options, res});

			return res;
		});

		if( this.poolSize ){
			result.catch(()=>{}).then(()=>{
				this._poolNext();
			});
		}

		return result;
	}
	/**
	 * @summary     数据同步的内部实现
	 * @protected
	 * @param       {string}    topic
	 * @param       {*}         value
	 * */
	_sync(topic, {options, res}){
		if( !this._syncTarget ){
			return ;
		}

		let {data} = res
			;

		if( this._syncHandler ){
			data = this._syncHandler(topic, options, res);
		}

		this._syncTarget.setData(topic, data);
	}

	// ---------- 公有方法 ----------
	/**
	 * @summary     设置数据，默认视为发送 POST 请求到服务器，不会将返回结果保存到本地缓存
	 * @override
	 * @param       {string|Object}     topic               字符串类型为请求 url，对象类型为所有参数，其中 url 为必填
	 * @param       {string}            topic.url
	 * @param       {Object}            [options={}]
	 * @param       {Object}            [options.data]
	 * @param       {string}            [options.method]
	 * @return      {Promise}
	 * */
	setData(topic, options={}){
		return this._send(topic, options, 'POST');
	}
	/**
	 * @summary     获取数据，默认视为发送 GET 请求到服务器，可以将返回结果保存到本地缓存
	 * @override
	 * @param       {string|Object}     topic               字符串类型为请求 url，对象类型为所有参数，其中 url 为必填
	 * @param       {string}            topic.url
	 * @param       {Object}            [options={}]
	 * @param       {Object}            [options.data]
	 * @param       {string}            [options.method]
	 * @return      {Promise}
	 * */
	getData(topic, options={}){
		return this._send(topic, options, 'GET');
	}
	/**
	 * @summary     删除数据
	 * @override
	 * @param       {string|Object}     topic
	 * @param       {string}            topic.url
	 * @param       {Object}            [options={}]
	 * @param       {Object}            [options.data]
	 * @param       {string}            [options.method]
	 * @return      {Promise<boolean>}  返回 resolve(true)
	 * @desc        若未设置 method 则会视为 DELETE
	 * */
	removeData(topic, options={}){
		return this._send(topic, options, 'DELETE');
	}
	/**
	 * @summary 清空数据，实际不做任何处理
	 * @override
	 * @return  {Promise<boolean>}  返回 resolve(true)
	 * */
	clearData(){
		return Promise.resolve( true );
	}
	/**
	 * @summary     将数据同步到本地存储，只能设置一个本地缓存
	 * @override
	 * @param       {Model}     model
	 * @param       {Function}  [handler=null]
	 * @return      {Model}     返回 this
	 * @desc        目前只能将数据同步到一个本地缓存中，若想同步到多个本地缓存，可由本地缓存之间设置同步
	 * */
	syncTo(model, handler=null){
		// 判断 model 是继承自 Model 的类，且 Symbol.toStringTag 设置为 Model
		if( Model.is( model ) ){
			this._syncTarget = model;
			this._syncHandler = handler;
		}

		return this;
	}

	/**
	 * @summary 使用 get 方式发请求，与 getData 相同
	 * @param       {string|Object}     topic               字符串类型为请求 url，对象类型为所有参数，其中 url 为必填
	 * @param       {string}            topic.url
	 * @param       {Object}            [options={}]        对象类型为 ajax 参数
	 * @param       {Object}            [options.data]
	 * @param       {string}            [options.method]
	 * @return      {Promise}
	 * */
	get(topic, options={}){
		return this._send(topic, options, 'GET');
	}
	/**
	 * @summary 使用 set 方式发请求，与 setData 相同
	 * @param       {string|Object}     topic               字符串类型为请求 url，对象类型为所有参数，其中 url 为必填
	 * @param       {string}            topic.url
	 * @param       {Object}            [options={}]        对象类型为 ajax 参数
	 * @param       {Object}            [options.data]
	 * @param       {string}            [options.method]
	 * @return      {Promise}
	 * */
	post(topic, options){
		return this._send(topic, options, 'POST');
	}
	/**
	 * @summary 定义资源
	 * @param   {string}    name
	 * @param   {string|Object} pathPattern
	 * @param   {string}        pathPattern.url
	 * @param   {string}        [pathPattern.method]
	 * @param   {Function}      [keyTrans]
	 * @desc    每个资源会返回包含 get、post、put、delete 方法的集合，以 RESTful api 规范的方式来使用
	 *          路径内的参数已 :key 的方式使用
	 * */
	resource(name, pathPattern, keyTrans){
		if( name in this ){
			throw new Error(`${name} 接口已经存在，不能重复定义`);
		}

		if( typeof pathPattern === 'string' ){
			pathPattern = {
				url: pathPattern
			};
		}

		let {method, url} = pathPattern
			;

		Object.defineProperty(this, name, {
			enumerable: true
			, configurable: false
			, get(){
				let runner = (data)=>{
						return this._send(this.transPath(url, data, keyTrans), merge(pathPattern, {
							data
						}), method.toUpperCase());
					}
					;

				if( !method ){
					Object.defineProperties(runner, SUPPORT_METHOD.reduce((rs, method)=>{
						rs[method] = {
							enumerable: true
							, configurable: false
							, get: (data)=>{
								return this._send(this.transPath(url, data, keyTrans), merge(pathPattern, {
									data
								}), method.toUpperCase());
							}
						}

						return rs;
					}, {}))
				}

				return runner;
			}
		});
	}
	/**
	 * @summary 转换 path
	 * @param   {string}    pathPattern
	 * @param   {Object}    data
	 * @param   {Function}  [keyTrans]
	 * @return  {string}
	 * */
	transPath(pathPattern, data, keyTrans){
		return pathPattern.replace(/:([^\/]*)/g, (m, key)=>{
			if( keyTrans ){
				return keyTrans(key, data);
			}

			return data[key];
		});
	}

	// ---------- 公有属性 ----------
	/**
	 * @summary 实现 toStringTag 接口
	 * @desc    在 Object.prototype.toString.call( new ServiceModel() ); 时将返回 [object ServiceModel]
	 * */
	get [Symbol.toStringTag](){
		return 'ServiceModel';
	}
}

/**
 * 特别标记 ServiceModel
 * */
Model.ServiceModel = ServiceModel;

/**
 * 在 Model.factory 工厂方法注册，将可以使用工厂方法生成
 * */
Model.register('service', ServiceModel);
/**
 * 注册别名
 * */
Model.registerAlias('service', 's');

export default ServiceModel;