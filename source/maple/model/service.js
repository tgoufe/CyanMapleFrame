'use strict';

import Model from './model.js';
import merge from '../util/merge.js';

/**
 * 目前数据请求依赖于 jQuery.ajax 方法
 * @todo 替换为自开发请求类库
 * */
import $ from 'jquery';

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
	 * @param   {String}    [config.baseUrl]
	 * @param   {Boolean}   [config.isCrossDomain]
	 * @param   {Boolean}   [config.useLock]
	 * @param   {Function}  [config.successHandler]
	 * @param   {Function}  [config.errorHandler]
	 * @param   {Number}    [config.timeout]
	 * */
	constructor(config={}){
		super();

		this._config = merge(config, ServiceModel._CONFIG);
		
		this._syncTo = null;

		// 设置默认成功处理
		if( !this._config.successHandler ){
			this._config.successHandler = (rs)=>{
				return rs;
			};
		}

		// 设置默认错误处理
		if( !this._config.errorHandler ){
			this._config.errorHandler = (e)=>{
				return Promise.reject( e );
			};
		}

		// // 任务队列
		// this._task = {};

		// /**
		//  * 判断是否使用 jsonp 方式发送数据
		//  * */
		// if( this._config.jsonp ){
		// 	this._req = req.jsonp;
		// }
		// else{
		// 	this._req = req.ajax;
		// }
	}

	// ---------- 静态方法 ----------
	/**
	 * @summary 设置默认成功处理函数
	 * @static
	 * @param   {Function}  handler
	 * */
	static setDefaultSuccessHandler(handler){
		ServiceModel._CONFIG.successHandler = handler;
	}
	/**
	 * @summary 设置默认失败处理函数
	 * @static
	 * @param   {Function}  handler
	 * */
	static setDefaultErrorHandler(handler){
		ServiceModel._CONFIG.errorHandler = handler;
	}

	// ---------- 私有方法 ----------
	/**
	 * @summary 对 setData 和 getData 的 options 添加跨域参数
	 * @param   {Object}    options setData 和 getData 的 options 参数
	 * @return  {Object}
	 * */
	_setCrossDomain(options){
		if( this._config.isCrossDomain && !('xhrFields' in options) ){
			options.xhrFields = {
				withCredentials: true
			};
		}

		return options;
	}

	// ---------- 公有方法 ----------
	/**
	 * @summary     设置数据，默认视为发送 POST 请求到服务器，不会将返回结果保存到本地缓存
	 * @override
	 * @param       {String|Object} topic               字符串类型为请求 url，对象类型为所有参数，其中 url 为必填
	 * @param       {Object}        [options={}]
	 * @param       {Object}        [options.data]
	 * @param       {String}        [options.method]
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
		options.method = options.method || 'POST';
		options.dataType = options.dataType || 'json';

		if( this._config.isCrossDomain ){
			options = this._setCrossDomain( options );
		}

		if( topic ){
			/**
			 * todo $.ajax 的返回结果没有被视为 promise，需要封装一下
			 * */
			result = Promise.resolve((()=>{
				return $.ajax(topic, options).then((data)=>{
					return data;
				}).then((data)=>{
					return this._config.successHandler(data);
				}, ()=>{
					return this._config.errorHandler();
				});
			})());
		}
		else{
			result = Promise.reject();
		}

		return result;
	}
	/**
	 * @summary     获取数据，默认视为发送 GET 请求到服务器，可以将返回结果保存到本地缓存
	 * @override
	 * @param       {String|Object}     topic               字符串类型为请求 url，对象类型为所有参数，其中 url 为必填
	 * @param       {Object|Boolean}    [options={}]        对象类型为 ajax 参数，Boolean 类型时将其赋值给 isCache，自身设置为 {}
	 * @param       {Object}            [options.data]
	 * @param       {String}            [options.method]
	 * @param       {Boolean}           [isCache=false]     是否优先从本地缓存中读取数据，同时发送请求后数据是否同步到本地缓存，默认为 false
	 * @return      {Promise}
	 * @todo    优先从本地 syncTo model 中读取数据，若没有则发送请求
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
				result = Promise.reject();

				topic = this._config.baseUrl + topic;
				options.method = options.method || 'GET';
				options.dataType = options.dataType || 'json';

				if( this._config.isCrossDomain ){
					options = this._setCrossDomain( options );
				}
			}

			// 当从本地缓存时未找到期望的数据会 reject，或者不从缓存中获取数据时也会 reject
			result = result.catch(()=>{
				// 发送请求，从服务器获取数据
				return $.ajax(topic, options).then((data)=>{
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
				}).then(this._config.successHandler, this._config.errorHandler);
			});
		}
		else{   // topic 无值不做任何处理
			result = Promise.reject();
		}

		return result;
	}
	/**
	 * @summary     删除数据
	 * @override
	 * @param       {String|Object} topic
	 * @param       {Object}        [options]
	 * @return      {Promise}
	 * @todo        可以考虑支持 RESTful API，发送 delete 类型的请求
	 * */
	removeData(topic, options){

		return Promise.resolve( true );
	}
	/**
	 * @summary 清空数据，实际不做任何处理
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
		if( (model instanceof Model) && !(model instanceof ServiceModel) ){
			this._syncTo = model;
		}
	}
}

/**
 * 默认配置
 * @static
 * */
ServiceModel._CONFIG = {
	baseUrl: ''
	, isCrossDomain: true
	, task: false
	// , jsonp: false
	, timeout: 10000
	// , beforeSendHandler: null
	, successHandler: null
	, errorHandler: null
};

/**
 * 在 Model.factory 工厂方法注册，将可以使用工厂方法生成
 * */
Model.register('service', ServiceModel);
/**
 * 注册别名
 * */
Model.registerAlias('service', 's');

export default ServiceModel;