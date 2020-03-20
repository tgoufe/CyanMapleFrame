'use strict';

import {Url}    from '../runtime/url.js';
import Model    from '../model/model.js';
import merge    from '../util/merge.js';

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
 * @desc    WebSocket 接口，与 Model 统一接口，隔离数据与数据来源的问题，在 Model.factory 工厂方法注册为 webSocket，别名 socket，将可以使用工厂方法生成
 * @extends Model
 * */
class WebSocketModel extends Model{
	/**
	 * @constructor
	 * @param   {Object}            [config={}]
	 * @param   {string|string[]}   config.url
	 * @param   {string}            [config.protocol]   单个的协议名字字符串或者包含多个协议名字字符串的数组
	 * @param   {string}            [config.binaryType] 设置收到的二进制数据类型
	 * @param   {string}            [config.eventType]
	 * */
	constructor(config={}){
		config = merge(config, WebSocketModel.CONFIG);

		super( config );

		this._config = config;

		if( this.config.url ){
			this._conn = this._createConn();
		}
		else{
			this._conn = Promise.reject( new Error('缺少参数 url，未建立连接') );
		}
	}

	// ---------- 静态方法 ----------
	/**
	 * @summary 与 App 类约定的注入接口
	 * @static
	 * @param   {Object}    app
	 * @desc    注入为 $socket，配置参数名 socket
	 * */
	static inject(app){
		app.inject('$socket', new WebSocketModel( app.$options.socket ));
	}

	// ---------- 静态属性 ----------
	/**
	 * @summary 默认配置
	 * @static
	 * @const
	 * */
	static get CONFIG(){
		return WEB_SOCKET_CONFIG;
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
				if( 'WebSocket' in self ){

					if( !/^wss?:\/\//.test( this._config.url ) ){
						this._config.url = (this.$url.protocol === 'https'? 'wss' :'ws') +'://'+ this._config.url;
					}

					conn = new WebSocket(this._config.url, this._config.protocol);

					conn.onopen = ()=>{
						console.log('建立 Web Socket 连接');
						resolve( conn );
					};
					conn.onmessage = (e)=>{
						let data = e.data
							;

						if( data instanceof ArrayBuffer ){ // 二进制数据流
							// 处理数据流，不能直接操作，而是要通过类型数组对象或 DataView 对象来操作
							console.log('ArrayBuffer', data);
							data = {
								topic: 'ArrayBuffer'
								, data
							};
						}
						else if( data instanceof Blob ){
							// 处理二进制数据，可用于文件传输
							console.log('Blob', data);
							data = {
								topic: 'Blob'
								, data
							}
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
							else{

							}
						}

						if( data.topic && data.data ){
							super.setData(data.topic, data.data);
						}
					};
					conn.onerror = (e)=>{
						let error = new Error('该 Web Socket 出现异常进而关闭')
							;

						console.log( e );
						this._conn = Promise.reject( error );

						reject( error );
					};
					conn.onclose = (e)=>{
						let error = new Error('该 Web Socket 连接已经被关闭')
							;

						console.log( e );
						this._conn = Promise.reject( error );

						reject( error );
					};

					if( this._config.binaryType ){
						conn.binaryType = this._config.binaryType;
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
	 * @override
	 * @param   {string}    topic
	 * @param   {*}         data
	 * @return  {Promise}   数据发送是否成功
	 * */
	setData(topic, data){
		return this._conn.then((socket)=>{
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
	 * @override
	 * @return  {Promise}   返回 reject(null)
	 * @desc    web socket 为单向，所以 getData 方法没有意义
	 * */
	getData(){
		return Promise.reject( null );
	}
	/**
	 * @summary 重写覆盖父类 removeData 方法
	 * @override
	 * @return  {Promise}   返回 reject(false)
	 * @desc    removeData 方法没有意义
	 * */
	removeData(){
		return Promise.reject( false );
	}
	/**
	 * @summary 重写覆盖父类 clearData 方法
	 * @override
	 * @return  {Promise}   返回 reject(false);
	 * @desc    clearData 方法没有意义
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
	 * @summary 建立连接
	 * @param   {string}  url 想要建立连接的路径
	 * @return  {Promise}
	 * @desc    当已经建立连接时调用此接口会报错
	 * */
	connect(url){
		if( this.config.url ){
			return Promise.reject( new Error('已建立连接，请先关闭') );
		}
		else{
			this.config.url = url;
			this._conn = this._createConn();

			return this._conn.then(()=>{
				return this;
			});
		}
	}
	/**
	 * @summary 关闭当前 socket 连接
	 * @param   {number}    [code]
	 * @param   {string}    [reason]
	 * @return  {Promise<boolean>}      返回一个 Promise 对象，在 resolve 时传回 true
	 * */
	close(code, reason){
		console.log('关闭当前 Web Socket 连接');
		return this._conn.then((socket)=>{
			try{
				socket.close();
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
	 * @summary 重置链接
	 * @return  {Promise<boolean>}
	 * */
	reset(){
		console.log('重置当前 Web Socket 连接');
		return this.close().then(()=>{
			this._conn = this._createConn();

			return true;
		});
	}

	// ---------- 公有属性 ----------
	/**
	 * @summary 实现 toStringTag 接口
	 * @desc    在 Object.prototype.toString.call( new WebSocketModel() ); 时将返回 [object WebSocketModel]
	 * */
	get [Symbol.toStringTag](){
		return 'WebSocketModel';
	}
}

WebSocketModel.use( Url );

/**
 * 在 Model.factory 工厂方法注册，将可以使用工厂方法生成
 * */
Model.register('webSocket', WebSocketModel);
/**
 * 注册别名
 * */
Model.registerAlias('webSocket', 'socket');

export default WebSocketModel;