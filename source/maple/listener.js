'use strict';

/**
 * @file    全局事件监听对象
 * */

import debounce from './util/debounce.js';
import throttle from './util/throttle.js';
import merge    from './util/merge.js';

/**
 * @class
 * @classdesc   全局事件监听抽象类
 * @desc        默认使用捕获方式
 * @todo        调整，兼容 addEventListener 的参数结构？
 * */
class Listener{
	/**
	 * @constructor
	 * @param   {Object}                    config
	 * @param   {String}                    config.type
	 * @param   {Window|Document|Object}    [config.target]
	 * @param   {Boolean}                   [config.useCapture]
	 * @param   {Boolean}                   [config.passive]
	 * @param   {Boolean}                   [config.useDebounce]    是否使用 debounce
	 * @param   {Boolean}                   [config.useThrottle]    是否使用 throttle
	 * @todo    处理 passive 参数
	 * */
	constructor(config={}){

		if( !config.type ){
			console.log('未指定监听事件');

			throw new Error('未指定监听事件');
		}

		this._config = merge(config, Listener._CONFIG);

		this._isListening = false;  // 当前监听状态

		this._listener = null;    // 执行函数

		this._eventQueue = []; // 事件对列
	}

	// ---------- 私有方法 ----------
	/**
	 * @summary 生成函数执行队列
	 * @private
	 * @return  {Function}
	 * */
	_queueExecute(){
		let eventQueue = this._eventQueue
			;

		return function(){
			let rs = true
				, i = 0
				, j = eventQueue.length
				, that = this || null
				, argv = [].slice.call( arguments )
				;

			for(; i < j; i++){
				rs = eventQueue[i].apply(that, argv);

				if( rs === false ){
					return false;
				}
			}

			return rs;
		};
	}

	// ---------- 公有方法 ----------
	/**
	 * @summary 添加执行函数
	 * @param   {Function}  callback
	 * @return  {Listener}  返回 this，可以使用链式操作
	 * */
	add(callback){
		if( this._eventQueue.indexOf(callback) === -1 ){
			this._eventQueue.push( callback );
		}
		else{
			console.log('该函数已经存在于队列中');
		}

		return this;
	}
	/**
	 * @summary 开始监听事件
	 * @param   {Number}    [wait=0]    间隔时间，单位为毫秒，若传则使用 debounce 或 throttle 方式执行
	 * @return  {Listener}  返回 this，可以使用链式操作
	 * @desc    当传入 wait 参数时根据生成 Listener 对象实例时的 useDebounce 或 useThrottle 参数来判断使用哪种方式，若都设置则 debounce 优先
	 * */
	on(wait=0){
		wait = Number( wait );

		if( this._isListening ){
			return;
		}

		if( !this._config.target ){
			return;
		}

		if( this._config.useDebounce && wait && wait > 0 ){
			this._listener = debounce(this._queueExecute(), wait);
		}
		else if( this._config.useThrottle && wait && wait > 0 ){
			this._listener = throttle(this._queueExecute(), wait);
		}
		else{
			this._listener = this._queueExecute();
		}

		if( 'addEventListener' in this._config.target ){
			this._config.target.addEventListener(this._config.type, this._listener, this._config.useCapture);
		}

		this._isListening = true;

		return this;
	}
	/**
	 * @summary 取消监听
	 * @param   {Boolean|Function}  [isAll=true]
	 * @return  {Listener}          返回 this，可以使用链式操作
	 * @desc    若传入参数为 true，则将将事件监听解除绑定，若传入参数类型为函数，则只将该函数从函数队列删除，不解除监听事件
	 * */
	off(isAll=true){

		if( !this._config.target ){
			return;
		}

		if( typeof isAll === 'boolean' && isAll ){

			if( 'removeEventListener' in this._config.target ){
				this._config.target.removeEventListener(this._config.type, this._listener, this._config.useCapture);
			}

			if( 'cancel' in this._listener ){
				this._listener.cancel();

				this._listener = null;
			}

			this._isListening = false;
		}
		else if( typeof isAll === 'function' ){
			let index = this._eventQueue.indexOf( isAll );

			this._eventQueue.splice(index, 1);
		}

		return this;
	}
	/**
	 * @summary 立即执行
	 * @param   {...*}
	 * */
	trigger(){
		let context = {
				type: this._config.type
				, target: this._config.target
			}
			, argv = [].slice.call( arguments )
			;

		if( 'immediate' in this._listener ){
			this._listener.immediate(context, argv);
		}
		else{
			this._listener.apply(context, argv);
		}
	}
}

/**
 * 监听事件的默认配置
 * @static
 * @const
 * */
Listener._CONFIG = {
	type: ''
	, target: window || self || null
	, useCapture: true
	, passsive: true
	, useDebounce: false
	, useThrottle: false
};

/**
 * @summary     快速监听函数
 * @param       {String}            type
 * @param       {Object|Window|Document|Function}   [target={}]             当类型为 function 时将其赋值给 callback，将 target 设置为 null，当类型为 Object 时将其赋值给 options，将 target 设置为 null
 * @param       {Function|Object}                   [callback={}]           当类型为 object 时将其赋值给 options，将 callback 设置为 null
 * @param       {Object}                            [options={}]            配置参数与 Listener 参数相同
 * @param       {Boolean}                           [options.useCapture]
 * @param       {Boolean}                           [options.passive]
 * @param       {Boolean}                           [options.useDebounce]
 * @param       {Boolean}                           [options.useThrottle]
 * @return      {Listener}
 * */
let listener = (type, target={}, callback={}, options={})=>{

	let opts = {
			type
		}
		, ls
		;

	if( typeof callback === 'object' ){
		options = callback;
		callback = null;
	}
	if( typeof target === 'function' ){
		callback = target;
		target = null;
	}
	// Object.create( null ) 创造出来的对象的 constructor 为 undefined
	else if( typeof target === 'object' && (target.constructor === Object || target.constructor === undefined ) ){
		options = target;
		target = null;
	}

	if( target ){
		opts.target = target;
	}

	opts = merge(opts, options);

	ls = new Listener( opts );

	ls.on();

	if( callback ){
		ls.add( callback );
	}

	return ls;
};

export {
	Listener
	, listener
};