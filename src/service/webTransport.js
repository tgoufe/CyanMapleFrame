'use strict';

import Model from '../model/model.js';
import merge from '../util/merge.js';
import log   from '../util/log.js';

/**
 * 默认配置
 * @const
 * */
const WEB_TRANSPORT_MODEL_CONFIG = {
		eventType: 'receiveStream'
	}
	;

/**
 * @class
 * @desc    对 WebTransport 接口进行封装，与 Model 统一接口，隔离数据与数据来源的问题，在 Model.factory 工厂方法注册为 webTransport，别名 transport,wt,wtp，将可以使用工厂方法生成
 * @extends Model
 * */
class WebTransportModel extends Model{
	/**
	 * @constructor
	 * @param   {Object|string} [config={}]
	 * @param   {string}        [config.url]
	 * @param   {boolean}       [config.allowPooling]       是否与其它 HTTP/3 连接共享 sessions，默认为 false
	 * @param   {string}        [config.congestionControl]
	 * @param   {boolean}       [config.requireUnreliable]  是否只能使用 HTTP/3 连接，默认为 false
	 * @param   {Object[]}      [config.serverCertificateHashes]    allowPooling 为 false 时生效，{algorithm, value} 结构
	 * @param   {string}        [config.eventType]
	 * */
	constructor(config={}){
		if( typeof config === 'string' ){
			config = {
				url: config
			};
		}

		config = merge(config, WebTransportModel.CONFIG);

		super( config );

		this._config = config;
		this._syncTarget = null;

		if( !this.config.url ){
			this._conn = Promise.reject( new Error('缺少参数 url，未建立连接') );
			
			return ;
		}

		this._conn = this._createConn();
	}

	// ---------- 静态方法 ----------
	/**
	 * @summary 与 App 类约定的注入接口
	 * @static
	 * @param   {Base}      app
	 * @param   {Object}    app.$options
	 * @param   {Object}    [app.$options.wtp]
	 * @desc    注入为 $socket，配置参数名 sse
	 * */
	static inject(app){
		app.inject('$wtp', new WebTransportModel( app.$options.wtp ));
	}

	// ---------- 静态属性 ----------
	/**
	 * @summary 默认配置
	 * @override
	 * @static
	 * @const
	 * */
	static get CONFIG(){
		return WEB_TRANSPORT_MODEL_CONFIG;
	}

	// ---------- 私有方法 ----------
	/**
	 * @summary 建立连接
	 * @private
	 * @return  {Promise}
	 * */
	_createConn(){
		let conn
			;

		if( !this._config.url ){
			return Promise.reject(new Error('缺少参数 url'));
		}

		if( !('WebTransport' in self) ){
			return Promise.reject( new Error('此浏览器不支持 Event Source') );
		}

		conn = new WebTransport(this._config.url, this._config);

		return conn.ready.then(()=>{
			log('建立 Web Transport 连接');

			return conn;
		}, (e)=>{
			log( e );

			return Promise.reject( new Error('该 Web Transport 出现异常进而关闭') );
		});
	}
	/**
	 * @summary     数据同步的内部实现
	 * @override
	 * @overload
	 * @protected
	 * @param       {TriggerEvent}  e
	 * @param       {string}        topic
	 * @param       {*}             value
	 * */
	_sync(e, topic, value){
		if( !this._syncTarget ){
			return ;
		}

		this._syncTarget.setData(topic, value);
	}
	/**
	 * @summary     接收数据事件回调
	 * @protected
	 * @param       {MessageEvent}  e
	 * @return      {Promise<boolean>}
	 * */
	_onMessage(e){
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

		return super.setData(data.topic, data.data);
	};

	// ---------- 公有方法 ----------
	/**
	 * @summary 设置数据
	 * @override
	 * @param   {string}    topic
	 * @param   {*}         data
	 * @param   {Object}    [options]
	 * @param   {number}    [options.sendOrder]
	 * @return  {Promise}   数据发送是否成功
	 * */
	setData(topic, data, options){
		return this._conn.then((transport)=>{
			return transport.createUnidirectionalStream( options );
		}).then((stream)=>{
			let writer = stream.writable.getWriter()
				;

			// todo
			writer.write( new Uint8Array({
				topic
				, data
			}) );

			return writer.close();
		}).then(()=>{
			return true;
		}, (e)=>{
			log( e );

			return false;
		});
	}
	/**
	 * @summary 获取数据
	 * @override
	 * @overload
	 * @param   {string}    topic
	 * @param   {Object}    [options]
	 * @param   {number}    [options.sendOrder]
	 * @return  {Promise}   数据发送是否成功
	 * @desc    内部为调用 setData 方法，仅有语义上的区别
	 * */
	getData(topic, options){
		return this._conn.then((transport)=>{
			return transport.createBidirectionalStream( options );
		}).then((stream)=>{
			let reader = stream.readable.getReader()
				, rs = []
				// , exec = reader.read()
				, handle = ({value, done})=>{
					rs.push( value );

					if( done ){
						return rs;
					}
					else{
						return reader.read().then( handle );
					}
				}
				;

			return reader.read().then( handle );
		});
	}
	/**
	 * @summary 删除数据
	 * @override
	 * @overload
	 * @param   {string}    topic
	 * @param   {*}         data
	 * @return  {Promise}   数据是否发送成功
	 * @desc    内部为调用 setData 方法，仅有语义上的区别
	 * */
	removeData(topic, data){
		return this.setData(topic, data);
	}
	/**
	 * @summary 清空数据
	 * @override
	 * @overload
	 * @param   {string}    topic
	 * @param   {*}         data
	 * @return  {Promise}   数据是否发送成功
	 * @desc    内部为调用 setData 方法，仅有语义上的区别
	 * */
	clearData(topic, data){
		return this.setData(topic, data);
	}
	/**
	 * @summary     将数据同步到本地存储，只能设置一个本地缓存
	 * @override
	 * @param       {Model}     model
	 * @return      {Model}     返回 this
	 * @desc        目前只能将数据同步到一个本地缓存中，若想同步到多个本地缓存，可由本地缓存之间设置同步
	 * */
	syncTo(model){
		// 判断 model 是继承自 Model 的类，且 Symbol.toStringTag 设置为 Model
		if( Model.is( model ) ){
			this._syncTarget = model;
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
	 * @summary 关闭当前 transport 连接
	 * @param   {number}    [code]
	 * @param   {string}    [reason]
	 * @return  {Promise<boolean>}      返回一个 Promise 对象，在 resolve 时传回 true
	 * */
	close(code, reason){
		log('关闭当前 Web Transport 连接');

		return this._conn.then((transport)=>{
			transport.close({
				closeCode: code
				, reason
			});

			return transport.closed;
		}).then(()=>{
			let error = new Error('该 Web Socket 连接已经被关闭')
				;

			this._conn = Promise.reject( error );

			return true;
		}, ()=>{
			// 失败不做处理
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
		log('重置当前 Event Source 连接');
		this.close().then(()=>{
			this._conn = this._createConn();

			return true;
		});
	}

	// ---------- 公有属性 ----------
	/**
	 * @summary 实现 toStringTag 接口
	 * @readonly
	 * @desc    在 Object.prototype.toString.call( new WebTransportModel() ); 时将返回 [object WebTransportModel]
	 * */
	get [Symbol.toStringTag](){
		return 'WebTransportModel';
	}
}

/**
 * 在 Model.factory 工厂方法注册，将可以使用工厂方法生成
 * */
Model.register('webTransport', WebTransportModel);
/**
 * 注册别名
 * */
Model.registerAlias('webTransport', ['transport', 'wt', 'wtp']);

export default WebTransportModel;