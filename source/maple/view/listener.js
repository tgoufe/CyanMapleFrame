'use strict';

/**
 * @file    全局事件监听对象
 * */

import debounce from '../util/debounce.js';
import merge    from '../util/merge.js';

/**
 * @class
 * @classdesc   全局事件监听抽象类
 * @desc        默认使用捕获方式
 * */
class Listener{
	/**
	 * @constructor
	 * @param   {Object}            config
	 * @param   {String}            config.eventType
	 * @param   {Window|Document}   [config.eventTarget]
	 * @param   {Boolean}           [config.useCapture]
	 * */
	constructor(config={}){

		if( !config.eventType ){
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

		return function(e){
			let rs = true
				, i = 0
				, j = eventQueue.length
				;

			for(; i < j; i++){
				// 当前 this 应指向 document
				rs = eventQueue[i].call(this, e);

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
	 * */
	on(useDebounce=false, wait){

		if( this._isListening ){
			return;
		}

		if( useDebounce && wait ){
			this._listener = debounce(this._queueExecute(), wait);
		}
		else{
			this._listener = this._queueExecute();
		}

		this._config.eventTarget.addEventListener(this._config.eventType, this._listener, this._config.useCapture);

		this._isListening = true;
	}
	/**
	 * @summary 取消监听
	 * */
	off(){
		document.removeEventListener(this._config.eventType, this._listener, this._config.useCapture);

		if( 'cancel' in this._listener ){
			this._listener.cancel();

			this._listener = null;
		}

		this._isListening = false;
	}
	/**
	 * @summary 立即执行
	 * */
	trigger(){
		if( 'immediate' in this._listener ){
			this._listener.immediate();
		}
		else{
			this._listener();
		}
	}
}

/**
 * 监听事件的默认配置
 * @static
 * @const
 * */
Listener._CONFIG = {
	eventType: ''
	, eventTarget: document
	, useCapture: true
};

export default Listener;
