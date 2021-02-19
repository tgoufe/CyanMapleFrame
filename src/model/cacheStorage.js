'use strict';

import Model from './model.js';
import merge from '../util/merge.js';

/**
 * 默认配置
 * @const
 * */
const CACHE_STORAGE_MODEL_CONFIG = {
		cacheName: 'storage'
	}
	;

/**
 * @class
 * @desc    对浏览器源生 CacheStorage 接口进行封装，统一调用接口，主要提供给 Service Worker 调用，普通页面使用场景有限，在 Model.factory 工厂方法注册为 cacheStorage，别名 cs，将可以使用工厂方法生成
 * @extends Model
 * @example
<pre>
let cacheStorageModel = new CacheStorageModel()
	, storage = Model.factory('cacheStorage')
	, cs = Model.factory('cs')
	;
</pre>
 * */
class CacheStorageModel extends Model{
	/**
	 * @constructor
	 * @param   {Object}    [config={}]
	 * @param   {string}    [config.cacheName]
	 * @param   {string}    [config.eventType]
	 * */
	constructor(config={}){
		config = merge(config, CacheStorageModel.CONFIG);

		super( config );

		this._config = config;

		if( 'caches' in self ){ // 判断
			this._store = Promise.resolve( self.caches );
		}
		else{
			this._store = Promise.reject( new Error('此浏览器不支持 Service Worker') );
		}
	}

	// ---------- 静态方法 ----------
	/**
	 * @summary 将 url 字符串转换为 Request 对象
	 * @static
	 * @param   {string|Request}    url
	 * @return  {Request}
	 * */
	static tranToRequest(url){
		
		if( typeof url === 'object' && url instanceof Request ){}
		else{
			url = new Request( url );
		}

		return url
	}
	/**
	 * @summary 与 App 类约定的注入接口
	 * @static
	 * @param   {Base}  app
	 * @desc    注入为 $cache，配置参数名 cache
	 * */
	static inject(app){
		app.inject('$cache', new CacheStorageModel( app.$options.cache ));
	}

	// ---------- 静态属性 ----------
	/**
	 * @summary 默认配置
	 * @static
	 * @const
	 * */
	static get CONFIG(){
		return CACHE_STORAGE_MODEL_CONFIG;
	}

	// ---------- 公有方法 ----------
	/**
	 * @summary 设置缓存
	 * @override
	 * @param   {string|Request}    topic
	 * @param   {Response}          response
	 * @return  {Promise}           返回一个 Promise 对象，在 resolve 时传回结果
	 * */
	setData(topic, response){
		return this._store.then((caches)=>{
			return caches.open( this._config.cacheName );
		}).then((cache)=>{
			console.log(`缓存 ${typeof topic === 'string' ? topic : topic.url}`);

			return cache.put(CacheStorageModel.tranToRequest(topic), response);
		});
	}
	/**
	 * @summary 获取缓存
	 * @override
	 * @param   {string|Request}    topic
	 * @param   {Object}            [options={}]
	 * @param   {boolean}           [options.ignoreVary]    请求的 url 和 header 都一致才是相同的资源
	 * @return  {Promise<Response, Error>}  返回一个 Promise 对象，在 resolve 时传回查询到的缓存，reject 时传回 Error
	 * */
	getData(topic, options={}){
		topic = CacheStorageModel.tranToRequest( topic );

		return this._store.then((caches)=>{
			return caches.match(topic, options);
		}).then((response)=>{
			let result
				;

			if( response ){
				result = response;
			}
			else{
				result = Promise.reject( new Error('不存在缓存 '+ topic.url) );
			}

			return result;
		});
	}
	/**
	 * @summary 将缓存删除
	 * @override
	 * @param   {string|Request}    topic
	 * @param   {Object}            [options={}]    cache.delete 的可选参数
	 * @return  {Promise<boolean, Error>}   返回一个 Promise 对象，在 resolve 时传回结果
	 * */
	removeData(topic, options={}){
		topic = CacheStorageModel.tranToRequest( topic );

		return this._store.then((caches)=>{
			return caches.open( this._config.cacheName );
		}).then(function(cache){
			return cache.delete(topic, options);
		});
	}
	/**
	 * @summary 清空缓存
	 * @override
	 * @return  {Promise<boolean>}  返回一个 Promise 对象，在 resolve 时传回结果
	 * */
	clearData(){
		this._store.then((caches)=>{
			return caches.delete( this._config.cacheName );
		});
	}

	/**
	 * @summary 添加缓存路径
	 * @param   {string|Request}    topic
	 * @return  {Promise}           返回一个 Promise 对象，在 resolve 时传回结果
	 * */
	addData(topic){
		return this._store.then((caches)=>{
			return caches.open( this._config.cacheName );
		}).then((cache)=>{
			return cache.add( topic );
		});
	}
	/**
	 * @summary 基于 addAll 方法的封装
	 * @param   {Request[]} cacheArray
	 * @return  {Promise}   返回一个 Promise 对象，在 resolve 时传回结果
	 * */
	addAll(cacheArray){
		return this._store.then((caches)=>{
			return caches.open( this._config.cacheName );
		}).then((cache)=>{
			return cache.addAll( cacheArray );
		});
	}
	/**
	 * @summary 获取当前当前 caches 中的缓存列表
	 * @return  {Promise<Cache[]>}  返回一个Promise对象，在 resolve 时传回 Cache 对象 key 值组成的数组
	 * */
	keys(){
		return this._store.then((caches)=>{
			return caches.keys();
		});
	}
	/**
	 * @summary 删除缓存记录
	 * @param   {string}    key
	 * @return  {Promise}   返回一个 Promise 对象，在 resolve 时传回结果
	 * */
	cacheDelete(key){
		return this._store.then((caches)=>{
			return caches.delete( key );
		});
	}

	/**
	 * @summary 类构造失败时的回调接口
	 * @param   {Function}  callback
	 * */
	catch(callback){
		if( typeof callback === 'function' ){
			this._store.catch( callback );
		}
	}

	// ---------- 公有属性 ----------
	/**
	 * @summary 实现 toStringTag 接口
	 * @desc    在 Object.prototype.toString.call( new Model() ); 时将返回 [object CacheStorageModel]
	 * */
	get [Symbol.toStringTag](){
		return 'CacheStorageModel';
	}
}

/**
 * 在 Model.factory 工厂方法注册，将可以使用工厂方法生成
 * */
Model.register('cacheStorage', CacheStorageModel);
/**
 * 注册别名
 * */
Model.registerAlias('cacheStorage', 'cs');

export default CacheStorageModel;