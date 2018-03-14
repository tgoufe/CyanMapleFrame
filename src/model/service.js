'use strict';

import Model        from './model.js';
import merge        from '../util/merge.js';
import HandlerQueue from '../util/handlerQueue.js';
import request      from '../request.js';

/**
 * @file    所有 ajax 请求基类
 *          目前数据请求依赖于 jQuery.ajax 方法
 * @todo    替换为自开发请求类库
 * */

/**
 * 默认配置
 * @const
 * */
const SERVICE_MODEL_CONFIG = {
		baseUrl: ''
		// , isCrossDomain: true
		, task: false
		// , jsonp: false
		, timeout: 10000
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
 * @classdesc   对服务器接口进行封装，与 Model 统一接口，隔离数据与数据来源的问题，在 Model.factory 工厂方法注册为 service，别名 s，将可以使用工厂方法生成
 * @extends     Model
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
	 * */
	constructor(config={}){
		super( config );

		this._config = merge(config, ServiceModel._CONFIG);
		
		this._syncTo = null;

		this.interceptor = {
			req: new HandlerQueue()
			, res: new HandlerQueue()
		};
	}

	// ---------- 静态属性 ----------
	/**
	 * @summary 默认配置
	 * @static
	 * @const
	 * */
	static get _CONFIG(){
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
	/**
	 * @summary 请求发送方式
	 * */
	static use(){

	}

	// ---------- 私有方法 ----------
	/**
	 * @summary 对 setData 和 getData 的 options 添加默认参数
	 * @param   {Object}    options setData 和 getData 的 options 参数
	 * @return  {Object}
	 * */
	_setOpts(options){
		return merge(options, {
			cache: false
			, dataType: 'json'
			, timeout: this._config.timeout || 10000
			, xhrFields: {
				withCredentials: true
			}
		});
	}
	/**
	 * @summary 执行请求拦截器进行验证
	 * @private
	 * @param   {string}    topic
	 * @param   {Object}    options
	 * @return  {Promise}
	 * */
	_reqInterceptor(topic, options){
		console.log('执行全局请求拦截器', topic);

		return ServiceModel.interceptor.req.fireReduce({topic, options}).then(({topic, options})=>{
			console.log('执行局部请求拦截器', topic);

			return this.interceptor.req.fireReduce({topic, options});
		});
	}
	/**
	 * @summary 执行响应拦截器进行验证
	 * @private
	 * @param   {Object}    result
	 * @param   {String}    result.topic
	 * @param   {Object}    result.options
	 * @param   {Object}    result.res
	 * @return  {Promise}
	 * */
	_resInterceptor({topic, options, res}){
		console.log('执行全局响应拦截器', topic);

		return ServiceModel.interceptor.res.fireReduce({topic, options, res}).then(({topic, options, res})=>{
			console.log('执行局部响应拦截器', topic);

			return this.interceptor.res.fireReduce({topic, options, res});
		});
	}

	// ---------- 公有方法 ----------
	/**
	 * @summary     设置数据，默认视为发送 POST 请求到服务器，不会将返回结果保存到本地缓存
	 * @override
	 * @param       {string|Object} topic               字符串类型为请求 url，对象类型为所有参数，其中 url 为必填
	 * @param       {string}        topic.url
	 * @param       {Object}        [options={}]
	 * @param       {Object}        [options.data]
	 * @param       {string}        [options.method]
	 * @return      {Promise}
	 * */
	setData(topic, options={}){
		let result
			;

		if( typeof topic === 'object' ){
			options = topic;
			topic = options.url
		}

		topic = this._config.baseUrl + topic;

		options = this._setOpts( options );

		options.method = options.method || 'POST';

		if( topic ){
			
			// 执行请求拦截器
			result = this._reqInterceptor(topic, options).then(({topic, options})=>{

				// 发送请求，向服务器发送数据
				console.log('发送 post 请求', topic);

				return request(topic, options);
			}).then((result)=>{

				// 执行响应拦截器
				return this._resInterceptor( result );
			}).then((result)=>{
				return result.res;
			});
		}
		else{   // topic 无值不做任何处理
			result = Promise.reject( new Error('缺少 topic 参数') );
		}

		return result;
	}
	/**
	 * @summary     获取数据，默认视为发送 GET 请求到服务器，可以将返回结果保存到本地缓存
	 * @override
	 * @param       {string|Object}     topic               字符串类型为请求 url，对象类型为所有参数，其中 url 为必填
	 * @param       {Object|boolean}    [options={}]        对象类型为 ajax 参数，boolean 类型时将其赋值给 isCache，自身设置为 {}
	 * @param       {Object}            [options.data]
	 * @param       {string}            [options.method]
	 * @param       {boolean}           [isCache=false]     是否优先从本地缓存中读取数据，同时发送请求后数据是否同步到本地缓存，默认为 false
	 * @return      {Promise}
	 * @desc        优先从本地 syncTo model 中读取数据，若没有则发送请求
	 * */
	getData(topic, options={}, isCache=false){
		let result
			;

		if( typeof options === 'boolean' ){
			isCache = options;
			options = {};
		}

		if( typeof topic === 'object' ){
			options = topic;
			topic = options.url;
		}

		if( topic ){
			// 判断是否设置了本地缓存以及是否从本地缓存中读取数据
			if( isCache && this._syncTo ){
				// todo 解决多个本地缓存优先级的问题
				result = this._syncTo.getData( topic );
			}
			else{
				result = Promise.reject('没有同步缓存');

				topic = this._config.baseUrl + topic;

				options = this._setOpts( options );

				options.method = options.method || 'GET';
			}

			// 当从本地缓存时未找到期望的数据会 reject，或者不从缓存中获取数据时也会 reject
			result = result.catch(()=>{

				// 执行请求拦截器
				return this._reqInterceptor(topic, options).then(()=>{

					// 发送请求，从服务器获取数据
					console.log('发送 get 请求', topic);

					return request(topic, options);
				}).then((result)=>{

					// 执行响应拦截器
					return this._resInterceptor( result );
				}).then((result)=>{
					return result.res;
				}).then((data)=>{   // 将数据同步
					let result
						;

					if( isCache && this._syncTo ){  // 如果有设置缓存，则将请求返回的数据存入本地缓存
						result = this._syncTo.setData(topic, data).then(()=>{
							return data;
						}, (e)=>{
							console.log( e );

							return data;
						});
					}
					else{
						result = data;
					}

					return result;
				});
			});
		}
		else{   // topic 无值不做任何处理
			result = Promise.reject( new Error('缺少 topic 参数') );
		}

		return result;
	}
	/**
	 * @summary     删除数据
	 * @override
	 * @param       {string|Object} topic
	 * @param       {Object}        [options]
	 * @return      {Promise<boolean>}  返回 resolve(true)
	 * @todo        可以考虑支持 RESTful API，发送 delete 类型的请求
	 * */
	removeData(topic, options){

		return Promise.resolve( true );
	}
	/**
	 * @summary 清空数据，实际不做任何处理
	 * @return  {Promise<boolean>}  返回 resolve(true)
	 * */
	clearData(){
		return Promise.resolve( true );
	}
	/**
	 * @summary     将数据同步到本地存储，一次只能设置一个本地缓存
	 * @override
	 * @param       {Model}     model
	 * @todo        目前只能将数据同步到一个本地缓存中，是否考虑可以同步到多个本地缓存，亦或由本地缓存之间设置同步
	 * */
	syncTo(model){

		// 判断 model 是继承自 Model 的类但并不继承自 ServiceModel
		// todo 新加了子类 WebSocketMode 和 EventSourceModel 子类，是否需要判断
		if( (model instanceof Model) && !(model instanceof ServiceModel) ){
			this._syncTo = model;
		}
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