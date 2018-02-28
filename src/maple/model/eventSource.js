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

		this._event = new Promise((resolve, reject)=>{
			let event
				;

			if( this._config.url ){
				if( 'EventSource' in self ){
					event = new EventSource(this._config.url, this._config);

					event.onmessage = (e) =>{

						let message = e.data
							;

						try{    // 尝试解析
							message = JSON.parse(message);
						}
						catch( e ){   // 纯字符串类型数据
							message = {
								topic: this._config.url
								, data: message
							};
						}

						super.setData(message.topic, message.data);
					};
					event.onopen = () =>{
						resolve(event);
					};

					event.onerror = reject;
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
	// ---------- 静态属性 ----------
	/**
	 * @summary 默认配置
	 * @static
	 * @const
	 * */
	static get _CONFIG(){
		return EVENT_SOURCE_MODEL_CONFIG;
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
	removeData(topic){
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
	 * @summary 关闭服务器端事件推送
	 * @return  {Promise<boolean>}  返回一个 Promise 对象，在 resolve 时传回 true
	 * */
	close(){
		this._event.then((event)=>{
			event.close();

			return true;
		});
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