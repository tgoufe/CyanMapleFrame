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
	;

/**
 * @class
 * @desc    对服务器接口进行封装，与 Model 统一接口，隔离数据与数据来源的问题，在 Model.factory 工厂方法注册为 service，别名 s，将可以使用工厂方法生成
 *          必须通过注入的方式注入一个 $request 方法用来发送请求
 * @extends Model
 *
 * @todo 支持 RESTful API
 * @todo 通道功能，一个 topic 一次只能发送一条，其余保存在队列中，等待当前发送的返回，再发送下一条
 * @todo 限制同时发送的请求的最大数量
 * */
class ServiceModel extends Model{
	/**
	 * @constructor
	 * @param   {Object}    [config={}]
	 * @param   {string}    [config.baseUrl]
	 // * @param   {boolean}   [config.isCrossDomain]
	 // * @param   {boolean}   [config.useLock]
	 * @param   {number}    [config.timeout]
	 * @param   {string}    [config.eventType]
	 * @param   {Object}    [config.api]
	 * */
	constructor(config={}){
		config = merge(config, ServiceModel.CONFIG);

		super( config );

		this._config = config;

		if( !('$request' in this) ){
			throw new Error(`$request 未注入，无法发送请求`);
		}
		
		this._value = new Map();
		
		this._syncTarget = null;
		this._syncHandler = null;

		this.interceptor = {
			req: new HandlerQueue()
			, res: new HandlerQueue()
		};

		this._execReqInterceptor = new HandlerQueue();
		this._execReqInterceptor.add( ServiceModel.interceptor.req );
		// this._execReqInterceptor.add(({topic})=>{
		// 	console.log(`执行局部请求拦截器 ${topic}`);
		// });
		this._execReqInterceptor.add( this.interceptor.req );

		this._execResInterceptor = new HandlerQueue();
		this._execResInterceptor.add( ServiceModel.interceptor.res );
		// this._execResInterceptor.add(({topic})=>{
		// 	console.log(`执行局部响应拦截器 ${topic}`);
		// });
		this._execResInterceptor.add( this.interceptor.res );

		if( 'resource' in config ){
			Object.entries( (k, v)=>this.resource(k, v) );
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
	/**
	 * @summary 发送请求，在发送请求之前执行请求拦截器，在请求返回后执行响应拦截器
	 * @private
	 * @param   {string}    topic
	 * @param   {Object}    options
	 * @return  {Promise}
	 * */
	_send(topic, options){
		// 执行请求拦截器
		return this._reqInterceptor(topic, options).then(()=>{
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
		});
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
		if( typeof topic === 'object' ){
			options = topic;
			topic = topic.url
		}

		if( !topic ){   // topic 无值不做任何处理
			return Promise.reject( new Error('缺少 topic 参数') );
		}

		topic = this._config.baseUrl + topic;

		options = this._setOpts( options );

		options.method = options.method || 'POST';

		// 执行请求拦截器
		return this._send(topic, options).then((res)=>{
			super.setData(topic, {topic, options, res});

			return res;
		});
	}
	/**
	 * @summary     获取数据，默认视为发送 GET 请求到服务器，可以将返回结果保存到本地缓存
	 * @override
	 * @param       {string|Object}     topic               字符串类型为请求 url，对象类型为所有参数，其中 url 为必填
	 * @param       {string}            topic.url
	 * @param       {Object}            [options={}]        对象类型为 ajax 参数，boolean 类型时将其赋值给 isCache，自身设置为 {}
	 * @param       {Object}            [options.data]
	 * @param       {string}            [options.method]
	 * @return      {Promise}
	 * @desc        优先从本地 syncTo model 中读取数据，若没有则发送请求
	 * */
	getData(topic, options={}){
		if( typeof topic === 'object' ){
			options = topic;
			topic = topic.url;
		}

		if( !topic ){   // topic 无值不做任何处理
			return Promise.reject( new Error('缺少 topic 参数') );
		}

		topic = this._config.baseUrl + topic;

		options = this._setOpts( options );

		options.method = options.method || 'GET';

		return this._send(topic, options).then((res)=>{   // 将数据同步
			super.setData(topic, {topic, options, res});

			return res;
		});
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
	 * @todo        可以考虑支持 RESTful API，发送 delete 类型的请求
	 * */
	removeData(topic, options={}){
		if( typeof topic === 'object' ){
			options = topic;
			topic = topic.url;
		}

		if( !topic ){   // topic 无值不做任何处理
			return Promise.reject( new Error('缺少 topic 参数') );
		}

		topic = this._config.baseUrl + topic;

		options = this._setOpts( options );

		options.method = options.method || 'DELETE';

		return this._send(topic, options).then((res)=>{
			super.setData(topic, {topic, options, res});

			return res;
		});
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
	 * @summary 定义资源
	 * @param   {string}    name
	 * @param   {string}    pathPattern
	 * @param   {Function}  [keyTrans]
	 * @desc    每个资源会返回包含 get、post、put、delete 方法的集合，以 RESTful api 规范的方式来使用
	 *          路径内的参数已 :key 的方式使用
	 * */
	resource(name, pathPattern, keyTrans){
		if( name in this ){
			throw new Error(`${name} 接口已经存在，不能重复定义`);
		}

		Object.defineProperty(this, name, {
			enumerable: true
			, configurable: false
			, get(){
				return {
					get: (data)=>{
						return this.getData(this.transPath(pathPattern, data, keyTrans), {
							data
						});
					}
					, post: (data)=>{
						return this.setData(this.transPath(pathPattern, data, keyTrans), {
							data
						});
					}
					, put: (data)=>{
						return this.setData(this.transPath(pathPattern, data, keyTrans), {
							methods: 'PUT'
							, data
						});
					}
					, delete: (data)=>{
						return this.removeData(this.transPath(pathPattern, data, keyTrans), {
							data
						});
					}
				};
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