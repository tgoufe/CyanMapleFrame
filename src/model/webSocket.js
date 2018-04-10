'use strict';

import url      from '../runtime/url.js';
import Model from './model.js';
import merge from '../util/merge.js';

/**
 * 默认配置
 * @const
 * */
const WEB_SOCKET_CONFIG = {
		protocol: 'ws'  // ws 或 wss
	}
	;

/**
 * @class
 * @classdesc   WebSocket 接口，与 Model 统一接口，隔离数据与数据来源的问题，在 Model.factory 工厂方法注册为 webSocket，别名 socket，将可以使用工厂方法生成
 * @extends     Model
 * */
class WebSocketModel extends Model{
	/**
	 * @constructor
	 * @param   {Object}            [config={}]
	 * @param   {string|string[]}   config.url
	 * @param   {string}            [config.protocol]   单个的协议名字字符串或者包含多个协议名字字符串的数组
	 * @param   {string}            [config.binaryType] 设置收到的二进制数据类型
	 * */
	constructor(config={}){
		super( config );

		this._config = merge(config, WebSocketModel._CONFIG);

		this._client = new Promise((resolve, reject)=>{
			let socket
				;

			if( this._config.url ){
				if( 'WebSocket' in self ){

					if( !/^wss?:\/\//.test( this._config.url ) ){
						this._config.url = (url.protocol === 'https'? 'wss' :'ws') +'://'+ this._config.url;
					}

					socket = new WebSocket(this._config.url, this._config.protocol);

					socket.onopen = ()=>{
						console.log('建立 Web Socket 连接');
						resolve( socket );
					};
					socket.onclose = (e)=>{
						console.log( e );

						let error = new Error('该 Web Socket 连接已经被关闭')

						this._client = Promise.reject( error );

						reject( error );
					};
					socket.onmessage = (e)=>{
						let data = e.data
							;

						if( typeof data === 'string' ){
							try{
								data = JSON.parse( data );
							}
							catch(e){
								data = {
									topic: this._config.url
									, data
								}
							}
						}
						else if( typeof data === 'object' ){
							if( data instanceof ArrayBuffer ){
								
							}
							else if( data instanceof Blob ){

							}
						}

						if( data instanceof ArrayBuffer ){ // 二进制数据流
							// todo 处理数据流
							console.log(data)
						}
						else{
							if( typeof data === 'string' ){
								try{
									data = JSON.parse( data );
								}
								catch(e){
									data = {
										topic: this._config.url
										, data
									}
								}
							}
							else if( typeof data !== 'object' ){
								data = {};
							}

							if( data.topic && data.data ){
								super.setData(data.topic, data.data);
							}
						}
					};
					socket.onerror = (e)=>{
						console.log( e );

						let error = new Error('该 Web Socket 出现异常进而关闭')
							;

						this._client = Promise.reject( error );

						reject( error );
					};

					if( this._config.binaryType ){
						socket.binaryType = this._config.binaryType;
					}
				}
				else{
					reject( new Error('此浏览器不支持 Web Socket') );
				}
			}
			else{
				reject( new Error('缺少参数 url') );
			}
		});
	}

	// // ---------- 静态方法 ----------
	// static isOpen(){
	// 	if( 'WebSocket' in self ){
	// 		return WebSocket.OPEN;
	// 	}
	// 	else{
	// 		return false;
	// 	}
	// }

	// ---------- 静态属性 ----------
	/**
	 * @summary 默认配置
	 * @static
	 * @const
	 * */
	static get _CONFIG(){
		return WEB_SOCKET_CONFIG;
	}

	// ---------- 私有方法 ----------
	/**
	 * @summary 检测 socket 是否还连接着
	 * @private
	 * @param   {WebSocket} socket
	 * @return  {boolean}   socket 是否连接着
	 * */
	_state(socket){
		return socket.readyState === WebSocket.OPEN;
	}

	// ---------- 公有方法 ----------
	/**
	 * @summary 获取数据
	 * @param   {string}    topic
	 * @param   {*}         data
	 * @return  {Promise}   数据发送是否成功
	 * */
	setData(topic, data){
		return this._client.then((socket)=>{
			let result
				;

			if( this._state(socket) ){
				socket.send( JSON.stringify({
					topic
					, data
				}) );

				result = true;
			}
			else{
				result = Promise.reject( new Error('该 Web Socket 连接已被关闭') );
			}

			return result;
		});
	}
	/**
	 * @summary 重写覆盖父类 getData 方法
	 * @return  {Promise}   返回 reject(null)
	 * @desc    web socket 为单向，所以 getData 方法没有意义
	 * */
	getData(){
		return Promise.reject( null );
	}
	/**
	 * @summary 重写覆盖父类 removeData 方法
	 * @return  {Promise}   返回 reject(false)
	 * @desc    removeData 方法没有意义
	 * */
	removeData(){
		return Promise.reject( false );
	}
	/**
	 * @summary 重写覆盖父类 clearData 方法
	 * @return  {Promise}   返回 reject(false);
	 * @desc    clearData 方法没有意义
	 * */
	clearData(){
		return Promise.reject( false );
	}

	/**
	 * @summary 关闭当前 socket 连接
	 * @param   {number}    [code]
	 * @param   {string}    [reason]
	 * @return  {Promise<boolean>}      返回一个 Promise 对象，在 resolve 时传回 true
	 * */
	close(code, reason){
		return this._client.then((socket)=>{
			socket.close();

			return true
		});
	}

	/**
	 * @summary 类构造失败时的回调接口
	 * @param   {Function}  callback
	 * */
	catch(callback){
		if( typeof callback === 'function' ){
			this._client.catch( callback );
		}
	}
}

/**
 * 在 Model.factory 工厂方法注册，将可以使用工厂方法生成
 * */
Model.register('webSocket', WebSocketModel);
/**
 * 注册别名
 * */
Model.registerAlias('webSocket', 'socket');

export default WebSocketModel;