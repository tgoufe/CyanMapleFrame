'use strict';

import Model from './model.js';
import merge from '../util/merge.js';

/**
 * @class
 * @classdesc   WebSocket 接口，与 Model 统一接口，隔离数据与数据来源的问题，在 Model.factory 工厂方法注册为 webSocket，别名 socket，将可以使用工厂方法生成
 * @extends     Model
 * */
class WebSocketModel extends Model{
	/**
	 * @constructor
	 * @param   {Object}    [config={}]
	 * */
	constructor(config={}){
		super( config );

		this._config = merge(config, WebSocketModel._CONFIG);

		this._clinet = new Promise((resolve, reject)=>{
			if( 'WebSocket' in self ){
				let socket = new WebSocket(this._config.url)
					;

				socket.onopen = ()=>{
					resolve( socket );
				};
				socket.onclose = ()=>{
					this._clinet = Promise.reject( new Error('该 Web Socket 连接已经被关闭') );
				};
				socket.onmessage = (e)=>{
					let data = e.data
						;

					if( data.topic && data.data ){
						super.setData(data.topic, data.data);
					}
				}
			}
			else{
				reject( new Error('此浏览器不支持 Web Socket') );
			}
		});
	}

	//---------- 公有接口 ----------
	/**
	 * @summary 获取数据
	 * @param   {String}    topic
	 * @param   {*}         data
	 * */
	setData(topic, data){
		return this._clinet.then((socket)=>{
			socket.send({
				topic
				, data
			});
		}).then(()=>{
			return true
		});
	}
	/**
	 *
	 * */
	getData(topic){}
	/**
	 *
	 * */
	removeData(topic){}
	/**
	 * 
	 * */
	clearData(){}
	/**
	 * @summary 关闭当前 socket 连接
	 * @param   {Number}    [code]
	 * @param   {String}    [reason]
	 * @return  {Promise}
	 * */
	close(code, reason){
		this._clinet.then((socket)=>{
			socket.close();
		});

		return Promise.resolve( true );
	}
}

/**
 * 默认配置
 * @static
 * */
WebSocketModel._CONFIG = {

};

/**
 * 在 Model.factory 工厂方法注册，将可以使用工厂方法生成
 * */
Model.register('webSocket', WebSocketModel);
/**
 * 注册别名
 * */
Model.registerAlias('webSocket', 'socket');

export default WebSocketModel;