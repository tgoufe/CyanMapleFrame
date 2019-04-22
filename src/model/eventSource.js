'use strict';

import Model    from './model.js';
import merge    from '../util/merge';

/**
 * 默认配置
 * @const
 * */
const EVENT_SOURCE_MODEL_CONFIG = {

	}
	;

/**
 * @class
 * @classdesc   对 EventSource 接口进行封装，与 Model 统一接口，隔离数据与数据来源的问题，在 Model.factory 工厂方法注册为 eventSource，别名 ess，将可以使用工厂方法生成
 *              非实时，默认 3 秒延迟
 *              SSE 只支持服务器到客户端单向的事件推送
 *              使用 SSE 时，服务器需要要对 SSE 的路径设置为 Cache-Control: no-transform，不使用 Gzip 压缩等
 * @extends     Model
 * */
class EventSourceModel extends Model{
	/**
	 * @constructor
	 * @param   {Object}    [config={}]
	 * @param   {boolean}   [config.withCredentials]
	 * */
	constructor(config={}){
		super( config );

		this._config = merge(config, EventSourceModel._CONFIG);

		this._conn = this._createConn();
	}
	// ---------- 静态属性 ----------
	/**
	 * @summary 默认配置
	 * @static
	 * @const
	 * */
	static get _CONFIG(){
		return EVENT_SOURCE_MODEL_CONFIG;
	}

	// ---------- 私有方法 ----------
	/**
	 * @summary 建立连接
	 * @private
	 * @return  {Promise}
	 * */
	_createConn(){
		return new Promise((resolve, reject)=>{
			let conn
				;

			if( this._config.url ){
				if( 'EventSource' in self ){
					conn = new EventSource(this._config.url, this._config);

					conn.onopen = ()=>{
						resolve( conn );
					};
					conn.onmessage = (e)=>{
						let data = e.data
							;

						try{    // 尝试解析
							data = JSON.parse( data );
						}
						catch( e ){   // 纯字符串类型数据
							data = {
								topic: this._config.url
								, data
							};
						}

						super.setData(data.topic, data.data);
					};
					conn.onerror = (e)=>{
						let error = new Error('该 Event Source 出现异常进而关闭')
							;

						console.log( e );
						this._conn = Promise.reject( error );

						reject( error );
					};
					conn.onclose = (e)=>{
						let error = new Error('该 Event Source 连接已被关闭')
							;

						console.log( e );
						this._conn = Promise.reject( error );

						reject( error );
					}
				}
				else{
					reject( new Error('此浏览器不支持 Event Source') );
				}
			}
			else{
				reject( new Error('缺少参数 url') );
			}
		});
	}

	// ---------- 公有方法 ----------
	/**
	 * @summary 重写覆盖父类 setData 方法
	 * @return  {Promise}   返回 reject(false)
	 * @desc    SSE 只支持服务器到客户端单向的事件推送，所以 setData 方法没有意义
	 * */
	setData(){
		return Promise.reject( false );
	}
	/**
	 * @summary 重写覆盖父类 getData 方法
	 * @return  {Promise}   返回 reject(null)
	 * @desc    SSE 只支持服务器到客户端单向的事件推送，所以 getData 方法没有意义
	 * */
	getData(){
		return Promise.reject( null );
	}
	/**
	 * @summary 重写覆盖父类 removeData 方法
	 * @return  {Promise}   返回 reject(false)
	 * @desc    SSE 只支持服务器到客户端单向的事件推送，所以 removeData 方法没有意义
	 * */
	removeData(){
		return Promise.reject( false );
	}
	/**
	 * @summary 重写覆盖父类 clearData 方法
	 * @return  {Promise}   返回 reject(false);
	 * @desc    SSE 只支持服务器到客户端单向的事件推送，所以 clearData 方法没有意义
	 * */
	clearData(){
		return Promise.reject( false );
	}
	/**
	 * @summary     将数据同步到本地存储，一次只能设置一个本地缓存
	 * @override
	 * @param       {Model}     model
	 * @return      {Model}     返回 this
	 * @todo        目前只能将数据同步到一个本地缓存中，是否考虑可以同步到多个本地缓存，亦或由本地缓存之间设置同步
	 * */
	syncTo(model){

		// 判断 model 是继承自 Model 的类，且 Symbol.toStringTag 设置为 Model
		if( Model.is( model ) ){
			this._syncTo = model;
		}

		return this;
	}

	/**
	 * @summary 关闭服务器端事件推送
	 * @return  {Promise<boolean>}  返回一个 Promise 对象，在 resolve 时传回 true
	 * */
	close(){
		console.log('关闭当前 Event Source 连接');
		return this._conn.then((conn)=>{
			try{
				conn.close();
			}
			catch(e){
				// 失败不做处理
			}

			return true;
		});
	}

	/**
	 * @summary 类构造失败时的回调接口
	 * @param   {Function}  callback
	 * */
	catch(callback){
		if( typeof callback === 'function' ){
			this._conn.catch( callback );
		}
	}
	/**
	 * @summary 重置请求
	 * @return  {Promise<boolean>}
	 * */
	reset(){
		console.log('重置当前 Event Source 连接');
		this.close().then(()=>{
			this._conn = this._createConn();

			return true;
		});
	}

	// ---------- 公有属性 ----------
	/**
	 * @summary 实现 toStringTag 接口
	 * @desc    在 Object.prototype.toString.call( new EventSourceModel() ); 时将返回 [object ServiceModel]
	 * */
	get [Symbol.toStringTag](){
		return 'EventSourceModel';
	}
}

/**
 * 在 Model.factory 工厂方法注册，将可以使用工厂方法生成
 * */
Model.register('eventSource', EventSourceModel);
/**
 * 注册别名
 * */
Model.registerAlias('eventSource', ['sse', 'es', 'event']);

export default EventSourceModel;