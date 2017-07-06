'use strict';

/**
 * @file    全局事件监听对象
 * */

import debounce from './util/debounce.js';
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
	 * */
	add(callback){
		if( this._eventQueue.indexOf(callback) === -1 ){
			this._eventQueue.push( callback );
		}
		else{
			console.log('该函数已经存在于队列中');
		}
	}
	/**
	 * @summary 开始监听事件
	 * @param   {Boolean}   [useDebounce]   是否使用弹性
	 * @param   {Number}    [wait]          若使用弹性则必填，为弹性时间，单位为毫秒
	 * @todo    支持 throttle
	 * */
	on(useDebounce=false, wait){

		if( this._isListening ){
			return;
		}

		if( !this._config.target ){
			return;
		}

		if( useDebounce && wait ){
			this._listener = debounce(this._queueExecute(), wait);
		}
		else{
			this._listener = this._queueExecute();
		}

		if( 'addEventListener' in this._config.target ){
			this._config.target.addEventListener(this._config.type, this._listener, this._config.useCapture);
		}

		this._isListening = true;
	}
	/**
	 * @summary 取消监听
	 * @param   {Boolean|Function}   [isAll=true]
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
	}
	/**
	 * @summary 立即执行
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
	, target: document || null
	, useCapture: true
	, passsive: true
};

export default Listener;