'use strict';

/**
 * @file    全局事件监听对象
 * */

import Base from '../base.js';
import merge        from './merge.js';
import HandlerQueue from './handlerQueue.js';

/**
 * 监听事件的默认配置
 * @const
 * */
const LISTENER_CONFIG = {
		observerOptions: {}
	}
	, INTERSECTION_OBSERVER = 'intersectionObserver'
	, MUTATION_OBSERVER = 'mutationObserver'
	;

/**
 * @summary     监听事件回调
 * @callback    ListenerCallback
 * @param       {Object|Event}  event
 * @param       {...*}
 * @this        target
 * */

/**
 * @class
 * @desc    全局事件监听抽象类，默认使用捕获方式
 * @extends Base
 * */
class Listener extends Base{
	/**
	 * @constructor
	 * @param   {Object}    [config]
	 * @param   {Object}    [config.observerOptions]
	 * @param   {Element}   [config.observerOptions.root]
	 * @param   {string}    [config.observerOptions.rootMargin] 计算交叉值时添加至根的边界盒中的一组偏移量，语法和 CSS 中的 margin 属性等同，默认值为 '0px 0px 0px 0px'
	 * @param   {number}    [config.observerOptions.threshold]  监听目标与边界盒交叉区域的比例值，从 0.0 到 1.0 之间的数组
	 * */
	constructor(config={}){
		config = merge(config, Listener.CONFIG);

		super( config );

		this._config = config;

		this._callbackList = new WeakMap();

		this._intersectInited = false;
		this._intersect$ = null;

		this._mutateInited = false;
		this._mutate$ = null;
	}

	// ---------- 静态方法 ----------
	/**
	 * @summary 与 App 类约定的注入接口
	 * @static
	 * @param   {Object}    app
	 * @desc    注入为 $listener，配置参数名 listener
	 * */
	static inject(app){
		app.inject('$listener', listener);
	}

	// ---------- 静态属性 ----------
	/**
	 * @summary 监听事件的默认配置
	 * @static
	 * @const
	 * */
	static get CONFIG(){
		return LISTENER_CONFIG;
	}
	/**
	 * @summary IntersectionObserver 监听标识
	 * @static
	 * @const
	 * */
	static get IntersectionObserver(){
		return INTERSECTION_OBSERVER;
	}
	/**
	 * @summary MutationObserver 监听标识
	 * @static
	 * @const
	 * */
	static get MutationObserver(){
		return MUTATION_OBSERVER;
	}

	// ---------- 私有方法 ----------
	/**
	 * @summary 初始化 IntersectionObserver
	 * @private
	 * */
	_initIntersectionObserver(){
		if( this._intersectInited ){
			return ;
		}

		this._intersect$ = new IntersectionObserver((entries)=>{
			entries.forEach((entry)=>{
				let target = entry.target
					, handlers
				;

				if( this._callbackList.has(target) ){
					handlers = this._callbackList.get( target )[Listener.IntersectionObserver];

					if( handlers && handlers.handlers ){
						handlers.handlers.with( target ).line({
							target
							, type: Listener.IntersectionObserver
						}, entry);
					}
				}
			});
		}, this._config.observerOptions);

		this._intersectInited = true;
	}
	/**
	 * @summary 初始化 MutationObserver
	 * @private
	 * */
	_initMutationObserver(){
		if( this._mutateInited ){
			return ;
		}
		this._mutate$ = new MutationObserver((mutations)=>{
			mutations.forEach((mutation)=>{
				let target = mutation.target
					, handlers
				;

				if( this._callbackList.has(target) ){
					handlers = this._callbackList.get( target )[Listener.MutationObserver];

					if( handlers && handlers.handlers ){
						handlers.handlers.with( target ).line({
							target
							, type: Listener.MutationObserver
						}, mutation);
					}
				}
			});
		});

		this._mutateInited = true;
	}
	/**
	 * @summary 获取事件配置
	 * @private
	 * @param   {Window|Document|Element|Object}    target
	 * @param   {string}    type
	 * @param   {boolean}   capture
	 * @return  {Object|null}
	 * */
	_getEventConfig(target, type, capture){
		let targetConfig
			, key
			;

		if( !this._callbackList.has(target) ){
			return null;
		}

		targetConfig = this._callbackList.get( target );

		if( type !== Listener.IntersectionObserver || type !== Listener.MutationObserver ){
			key = this._getKey(type, capture);
		}
		else{
			key = type;
		}

		return targetConfig[key] || null;
	}
	/**
	 * @summary 获取事件键值
	 * @private
	 * @param   {string}    type
	 * @param   {boolean}   capture
	 * @return  {string}
	 * */
	_getKey(type, capture){
		return JSON.stringify({
			type
			, capture
		});
	}
	/**
	 * @summary 事件执行
	 * @private
	 * @param   {Window|Document|Element|Object}    target
	 * @param   {string}        type
	 * @param   {HandlerQueue}  handlers
	 * @param   {...*}          [args]  事件执行时的传参
	 * @return  {*}
	 * */
	_trigger(target, type, handlers, ...args){
		return handlers.with( target ).line({
			target
			, type
		}, ...args);
	}

	// ---------- 公有方法 ----------
	/**
	 * @summary 添加监听事件
	 * @param   {Window|Document|Element|Object|string} target
	 * @param   {string|ListenerCallback}   type
	 * @param   {ListenerCallback|Object}   [callback={}]
	 * @param   {Object}                    [options={}]
	 * @param   {boolean}                   [options.capture]
	 * @param   {boolean}                   [options.passive]
	 * @param   {boolean}                   [options.once]
	 * @return  {Object}    返回一个带有 trigger 方法的对象，可以用来触发此次绑定的事件
	 * @desc    可以传四个参数，最少传两个参数，若只传两个参数会视为 type 和 callback
	 * */
	on(target, type, callback={}, options={}){
		let initBind = false
			, targetConfig
			, eventConfig
			, handlers
			, key
			, capture
			;

		if( typeof callback === 'object' ){
			options = callback;
			callback = null;
		}

		if( typeof type === 'function' ){
			callback = type;
			type = null;
		}

		if( typeof target === 'string' ){
			type = target;
			target = null;
		}

		if( !target ){
			target = self;
		}

		capture = !!options.capture;

		if( !this._callbackList.has(target) ){
			this._callbackList.set(target, {});

			// todo 添加事件
			initBind = true;
		}

		targetConfig = this._callbackList.get( target );

		eventConfig = this._getEventConfig(target, type, capture);

		if( !eventConfig ){
			key = this._getKey(type, capture);

			eventConfig = targetConfig[key] = {
				handlers: new HandlerQueue()
			};

			initBind = true;
		}

		handlers = eventConfig.handlers;

		handlers.add( callback );

		if( initBind ){
			if( type === Listener.IntersectionObserver ){
				this._initIntersectionObserver();
				this._intersect$.observe( target );
			}
			else if( type === Listener.MutationObserver ){
				this._initMutationObserver();
				this._mutate$.observe(target, options);
			}
			else if( 'addEventListener' in target && typeof target.addEventListener === 'function' ){
				eventConfig.callback = function(...args){
					handlers.with( this ).line( ...args );
				};

				target.addEventListener(type, eventConfig.callback, options);
			}
		}

		return {
			trigger: (...args)=>{
				return this._trigger(target, type, handlers, ...args);
			}
		};
	}
	/**
	 * @summary 取消监听
	 * @param   {Window|Document|Element|Object|string} target
	 * @param   {string|ListenerCallback}   type
	 * @param   {ListenerCallback|Object}   [callback={}]
	 * @param   {Object}                    [options={}]
	 * @param   {boolean}                   [options.capture]
	 * @param   {boolean}                   [options.passive]
	 * @param   {boolean}                   [options.once]
	 * @return  {Listener}                  返回 this，可以使用链式操作
	 * @desc    可以传四个参数，最少传一个参数，若只传一个参数会视为 type
	 * */
	off(target, type, callback={}, options={}){
		let eventConfig
			, handlers
			, capture
			;

		if( typeof callback === 'object' ){
			options = callback;
			callback = null;
		}

		if( typeof type === 'function' ){
			callback = type;
			type = null;
		}

		if( typeof target === 'string' ){
			type = target;
			target = null;
		}

		if( !target ){
			target = self;
		}

		capture = !!options.capture;

		eventConfig = this._getEventConfig(target, type, capture);

		if( !eventConfig ){
			return this;
		}

		handlers = eventConfig.handlers;

		if( callback ){
			handlers.remove( callback );

			return this;
		}

		handlers.clear();

		if( type === Listener.IntersectionObserver ){
			this._intersect$.unobserve( target );
		}
		else if( type === Listener.MutationObserver ){
			this._mutate$.unobserve(target, options);
		}
		else if( 'removeEventListener' in target && typeof target.removeEventListener === 'function' ){
			target.removeEventListener(type, eventConfig.callback, options);
		}

		delete this._callbackList.get( target )[this._getKey(type, capture)];

		return this;
	}
	/**
	 * @summary 触发执行事件
	 * @param   {Window|Document|Element|Object}    target
	 * @param   {string}    type
	 * @param   {boolean}   [capture=false]
	 * @param   {...*}      [args]          触发事件时传递的参数
	 * @return  {*}
	 * */
	trigger(target, type, capture=false, ...args){
		let eventConfig
			, handlers
			;

		eventConfig = this._getEventConfig(target, type, capture);

		if( !eventConfig ){
			return null;
		}
		
		handlers = eventConfig.handlers;

		return this._trigger(target, type, handlers, ...args);
	}
	/**
	 * @summary 根据对象触发相关事件
	 * @param   {Window|Document|Element|Object}    [target]
	 * @return  {Object}
	 * @example
	 *  listener.target( dom ).type('click').trigger();
	 * */
	target(target){
		if( !target ){
			target = self;
		}

		return {
			type: (type, capture=false)=>{
				return {
					trigger: (...args)=>{
						let eventConfig
							, handlers
							;

						eventConfig = this._getEventConfig(target, type, capture);

						if( !eventConfig ){
							return null;
						}

						handlers = eventConfig.handlers;

						return this._trigger(target, type, handlers, ...args);
					}
				};
			}
		};
	}
	/**
	 * @summary 根据事件类型触发相关事件
	 * @param   {string}    type
	 * @return  {Object}
	 * @desc    默认执行绑定在全局的事件
	 * @example
	 *  listener.type('click').trigger();
	 * */
	type(type){
		return this.target().type( type );
	}

	// ---------- 公有属性 ----------
	/**
	 * @summary 实现 toStringTag 接口
	 * @desc    在 Object.prototype.toString.call( new Listener() ); 时将返回 [object Listener]
	 * */
	get [Symbol.toStringTag](){
		return 'Listener';
	}
}

const listener = new Listener()
	;

export default listener;

export {
	Listener
};