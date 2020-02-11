'use strict';

import Model        from './model.js';
import dateFormat   from '../util/dateFormat.js';

/**
 * 默认 cookie 设置参数
 * @const
 * */
const COOKIE_DEFAULT = {
		path: '/'
		, domain: ''
		, expires: ''
		, secure: ''
	}
	;

/**
 * @class
 * @desc    对 cookie 的使用进行封装，统一调用接口，在 Model.factory 工厂方法注册为 cookie，别名 c，将可以使用工厂方法生成
 * @extends Model
 * @example
</pre>
let cookieModel = new CookieModel()
	, cookie = Model.factory('cookie')
    , c = Model.factory('c')
	;

console.log( cookie === c );    // 因为将对象实例进行了缓存，所以结果为 true

cookie.set('memberId', 1, '30d');   // 将 memberId 放入 cookie 中，过期时间 30 天
</pre>
 * */
class CookieModel extends Model{
	/**
	 * @constructor
	 * @param   {Object}    [config={}]
	 * @param   {string}    [config.eventType]
	 * @desc    当浏览器支持 cookie 时，在构建时会将 document.cookie 进行解析，将全部值都存入内存中
	 * */
	constructor(config={}){
		super( config );

		if( navigator.cookieEnabled ){
			this._enabled = true;
			this._store = Promise.resolve();
		}
		else{
			this._enabled = false;
			this._store = Promise.reject( new Error('此浏览器不支持 Cookie') );
		}
	}

	// ---------- 静态方法 ----------
	/**
	 * @summary 转换时间数据格式
	 * @static
	 * @param   {Date|number|string}    date 为 Number 类型时默认单位为天
	 * @return  {string}                返回一个 UTC 格式的时间字符串
	 * */
	static _transDate(date){
		if( date instanceof Date ){}
		else{
			date = dateFormat.formatTimeStr( date );

			date = date === 0 ? '' : new Date( Date.now() + date );
		}

		return date && date.toUTCString();
	}
	/**
	 * @summary 设置默认参数的 domain 值
	 * @static
	 * @param   {string}    domain
	 * */
	static setDomain(domain){
		COOKIE_DEFAULT.domain = domain;
	}
	/**
	 * @summary 与 App 类约定的注入接口
	 * @static
	 * @param   {Object}    app
	 * @desc    注入为 $cookie，配置参数名 cookie
	 * */
	static inject(app){
		app.inject('$cookie', new CookieModel( app.$options.cookie ));
	}

	// ---------- 静态属性 ----------
	/**
	 * @summary 默认 cookie 设置参数
	 * @static
	 * @const
	 * */
	static get CONFIG(){
		return COOKIE_DEFAULT;
	}

	// ---------- 私有方法 ----------
	/**
	 * @summary     设置 cookie
	 * @protected
	 * @param       {string}                topic
	 * @param       {*}                     value
	 * @param       {Object|number|string}  [options]           相关配置
	 * @param       {string}                [options.path]
	 * @param       {string}                [options.domain]
	 * @param       {Date|number|string}    [options.expires]
	 * @param       {string}                [options.secure]
	 * @return      {boolean}               在设置完成后返回 true
	 * @desc        因为设置 cookie 和删除 cookie 使用是相同的代码，只是传入的过期时间不同，所以提出一个共通方法
	 *              保存值得时候，同时会保持在内存中
	 * */
	_setCookie(topic, value, options){
		if( typeof options !== 'object' ){
			options = {
				expires: options
			};
		}

		let isRemove = options.expires < 0
			;

		if( options.expires ){
			options.expires = CookieModel._transDate( options.expires );
		}

		document.cookie = encodeURIComponent( topic ) +'='+
			encodeURIComponent( CookieModel.stringify(value) ) +
			Object.entries( CookieModel.CONFIG ).reduce((a, [k, v])=>{    // 整理配置
				let t = options[k] || v
					;

				if( t ){
					a += `; ${k}=${t}`;
				}

				return a;
			}, '');

		super.setData(topic, isRemove ? null : value);

		return true;
	}
	/**
	 * @summary     获取 cookie
	 * @protected
	 * @param       {string|string[]}   topic
	 * @return      {Object|string}
	 * @desc        获取数据时会将其存入内存中
	 * */
	_getCookie(topic){
		let cookies = (document.cookie || '').split('; ')
			, i = 0, l
			, value = ''
			, t
			;

		for(l = cookies.length; i < l; i++ ){
			t = cookies[i].split('=');

			if( topic === decodeURIComponent(t[0]) ){
				value = decodeURIComponent( t[1] );
				break;
			}
		}

		if( value ){
			try{
				value = JSON.parse( value );
			}
			catch(e){}

			// 在内存中保留该值
			super.setData(topic, value);
		}
		else{
			value = Promise.reject( null );

			super.setData(topic, null);
		}

		return value;
	}
	/**
	 * @summary     当 setData 传入一个 json 时内部调用函数
	 * @override
	 * @protected
	 * @param       {Object}    topic
	 * @param       {Object}    [options]
	 * @return      {Promise<boolean>}  返回一个 Promise 对象，在 resolve 时传回 true
	 * @desc        因为设置 cookie 时有相关配置，故重写覆盖父类的 _setByObject 方法
	 * */
	_setByObject(topic, options){
		return Promise.all( Object.entries(topic).map(([k, v])=>{
			return this.setData(k, v, options);
		}) ).then((resultList)=>{
			return resultList.every( rs=>rs );
		});
	}

	// ---------- 公有方法 ----------
	/**
	 * @summary     设置数据
	 * @override
	 * @param       {string|Object}             topic
	 * @param       {*}                         value               当 topic 为 object 类型时，被视为 options
	 * @param       {Object|number|string}      [options]           相关配置
	 * @param       {string}                    [options.path]
	 * @param       {string}                    [options.domain]
	 * @param       {Date|number|string}        [options.expires]
	 * @param       {string}                    [options.secure]
	 * @return      {Promise<boolean>}          返回一个 Promise 对象，在 resolve 时传回 true
	 * @desc        当 topic 类型为 object 时，value 会视为 options
	 * */
	setData(topic, value, options){
		let result
			;

		if( typeof topic === 'object' ){
			options = value;

			result = this._setByObject(topic, options);
		}
		else{
			result = this._store.then(()=>{
				return this._setCookie(topic, value, options);
			});
		}
		
		return result;
	}
	/**
	 * @summary 获取数据
	 * @override
	 * @param   {string|string[]}   topic
	 * @param   {...string}
	 * @return  {Promise<*, null>}  返回一个 Promise 对象，若存在 topic 的值，在 resolve 时传回查询出来的 value，否则在 reject 时传回 null
	 * @desc    当 topic 的类型为数组的时候，resolve 传入的结果为一个 json，key 为 topic 中的数据，value 为对应查找出来的值
	 * */
	getData(topic){
		let argc = arguments.length
			, result
			;

		if( Array.isArray(topic) ){
			result = this._getByArray( topic );
		}
		else if( argc > 1 ){
			result = this._getByArray( [].slice.call(arguments) );
		}
		else{
			result = this._store.then(()=>{
				return this._getCookie( topic );
			});
		}

		return result
	}
	/**
	 * @summary 将数据从缓存中删除
	 * @override
	 * @param   {string|string[]}   topic
	 * @param   {...string}
	 * @return  {Promise<boolean, Error>}   返回一个 Promise 对象，在 resolve 时传回 true
	 * @desc    调用 _setCookie 方法，过期时间为负值
	 * */
	removeData(topic){
		let argc = arguments.length
			, result
			;
		if( Array.isArray(topic) ){
			result = this._removeByArray( topic );
		}
		else if( argc > 1 ){
			result = this._removeByArray( [].slice.call(arguments) );
		}
		else{
			result = this._store.then(()=>{
				return this._setCookie(topic, '', -1);
			});
		}
		return result;
	}
	/**
	 * @summary 清空数据
	 * @override
	 * @return  {Promise<boolean>}  返回一个 Promise 对象，在 resolve 时传回 true
	 * @desc    只调用了父类的 clearData 方法，清楚了内存中的数据，对 cookie 实际没做任何处理
	 * */
	clearData(){
		return super.clearData();
	}
	/**
	 * @summary 以同步的方式向 cookie 中写入数据
	 * @param   {string|Object}             topic
	 * @param   {*}                         value               当 topic 为 object 类型时，被视为 options
	 * @param   {Object|number|string}      [options]           相关配置
	 * @param   {string}                    [options.path]
	 * @param   {string}                    [options.domain]
	 * @param   {Date|number|string}        [options.expires]
	 * @param   {string}                    [options.secure]
	 * @return  {boolean}
	 * */
	setDataSync(topic, value, options){
		let result = !!this._enabled
			;

		if( this._enabled ){
			try{
				if( typeof topic === 'object' ){
					options = value;

					Object.entries( topic ).forEach(([k, v])=>{
						this._setCookie(k, v, options);
					});
				}
				else{
					this._setCookie(topic, value, options);
				}

				result = true;
			}
			catch(e){
				result = false;
			}
		}

		return result;
	}
	/**
	 * @summary 以同步的方式获取 cookie 中的数据
	 * @param   {string|string[]}   topic
	 * @param   {...string}
	 * @return  {Object|string}     若存在 topic 的值，返回查询出来的 value，否则返回 null
	 * @desc    获取数据时会从 cookie 中取值并将其存入内存中，当 topic 的类型为数组的时候，返回结果为一个 json，key 为 topic 中的数据，value 为对应查找出来的值
	 * */
	getDataSync(topic){
		let argc = arguments.length
			, keyList
			, result = null
			;

		// 判断当前环境是否支持 cookie
		if( this._enabled ){

			if( !Array.isArray(topic) ){
				keyList = [topic];
			}
			else if( argc > 1 ){
				keyList = [].slice.call( arguments );
			}
			else{
				keyList = topic;
			}

			result = keyList.reduce((all, d)=>{

				if( d in this._value ){
					all[d] = this._value[d];
				}
				else{
					let temp = this._getCookie( d )
					;

					if( temp instanceof Promise ){  // 不存在该 topic 的值
						all[d] = null;
					}
					else{
						all[d] = temp;

						// 尝试解析
						try{
							all[d] = JSON.parse( all[d] );
						}
						catch(e){}
					}
				}

				return all;
			}, {});

			if( !Array.isArray(topic) ){
				result = result[topic];
			}
		}

		return result;
	}
	/**
	 * @summary 获取 cookie 长度
	 * @return  {number}
	 * */
	getCookieLength(){
		return this._enabled ? document.cookie.length : 0;
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
	 * @summary 提供更直观更语义化的同步数据读写接口
	 * @desc    可以使用 c.sync.getData 和 c.sync.setData 同步的方式来读写数据
	 * */
	get sync(){
		return {
			/**
			 * @summary 语义化的同步数据写接口
			 * @param   {...*}  argv    参数与 setDataSync 方法相同
			 * @return  {boolean}
			 * @desc    内部为调用 setDataSync 方法
			 * */
			setData: (...argv)=>{
				return this.setDataSync( ...argv );
			}
			/**
			 * @summary 语义化的同步保存数据接口
			 * @param   {...string}  argv    参数与 getDatasync 方法相同
			 * @return  {*}
			 * @desc    内部为调用 getDataSync 方法
			 * */
			, getData: (...argv)=>{
				return this.getDataSync( ...argv );
			}
		}
	}
}

/**
 * 在 Model.factory 工厂方法注册，将可以使用工厂方法生成
 * */
Model.register('cookie', CookieModel);
/**
 * 注册别名
 * */
Model.registerAlias('cookie', 'c');

export default CookieModel;