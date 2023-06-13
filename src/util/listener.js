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
	, RESIZE_OBSERVER = 'resizeObserver'
	, OBSERVER_TYPE_LIST = [
		INTERSECTION_OBSERVER
		, MUTATION_OBSERVER
		, RESIZE_OBSERVER
	]
	;

/**
 * @typedef     {Object}    TriggerEvent
 * @property    {Object}    target
 * @property    {string}    type
 * */

/**
 * @summary     监听事件回调
 * @callback    ListenerCallback
 * @param       {TriggerEvent|Event}  event
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
	 * @param   {Object}    [config={}]
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

		this._resizeInited = false;
		this._resize$ = null;
	}

	// ---------- 静态方法 ----------
	/**
	 * @summary 与 App 类约定的注入接口
	 * @static
	 * @param   {Base}  app
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
	/**
	 * @summary ResizeObserver 监听标识
	 * @static
	 * @const
	 * */
	static get ResizeObserver(){
		return RESIZE_OBSERVER;
	}
	/**
	 * @summary 所有 observer 类型的监听标识
	 * @static
	 * @const
	 * */
	static get ObserverTypeList(){
		return OBSERVER_TYPE_LIST;
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
					handlers = this._callbackList.get( target )[this._getKey( Listener.IntersectionObserver )];

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
					handlers = this._callbackList.get( target )[this._getKey( Listener.MutationObserver )];

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
	 * @summary 初始化 ResizeObserver
	 * @private
	 * */
	_initResizeObserver(){
		if( this._resizeInited ){
			return ;
		}

		this._resize$ = new ResizeObserver((entries)=>{
			entries.forEach((entry)=>{
				let target = entry.target
					, handlers
					;

				if( this._callbackList.has(target) ){
					handlers = this._callbackList.get( target )[this._getKey( Listener.ResizeObserver )];

					if( handlers && handlers.handlers ){
						handlers.handlers.with( target ).line({
							target
							, type: Listener.ResizeObserver
						}, entry);
					}
				}
			});
		});

		this._resizeInited = true;
	}
	/**
	 * @summary 判断 type 是否为 observer
	 * @private
	 * @return  {boolean}
	 * */
	_isObserver(type){
		return Listener.ObserverTypeList.indexOf( type ) !== -1;
	}
	/**
	 * @summary 处理 on 和 off 参数的内部方法
	 * @private
	 * @param   {Window|Document|Element|Object|string} target
	 * @param   {string|ListenerCallback}           type
	 * @param   {ListenerCallback|Object|boolean}   [callback={}]
	 * @param   {Object|boolean}                    [options={}]
	 * @param   {boolean}                           [options.capture]
	 * @param   {boolean}                           [options.passive]
	 * @param   {boolean}                           [options.once]
	 * @return  {Object}
	 * */
	_handleArgs(target, type, callback={}, options={}){
		if( typeof options === 'boolean' ){
			options = {
				capture: options
			};
		}

		if( typeof callback === 'boolean' ){
			callback = {
				capture: callback
			};
		}

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

		return {
			target
			, type
			, callback
			, options
			, capture: !!options && options.capture
		};
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
			, key = this._getKey(type, capture)
			;

		if( !this._callbackList.has(target) ){
			return null;
		}

		targetConfig = this._callbackList.get( target );

		return targetConfig[key] || null;
	}
	/**
	 * @summary 获取事件键值
	 * @private
	 * @param   {string}    type
	 * @param   {boolean}   [capture]
	 * @return  {Symbol}
	 * */
	_getKey(type, capture){
		if( this._isObserver(type) ){
			return Symbol.for( type );
		}

		return Symbol.for( JSON.stringify({
			type
			, capture
		}) );
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

	/**
	 * @summary 判断原生 addEventListener 方法是否可用
	 * @protected
	 * @param   {Window|Document|Element}    target
	 * @return  {boolean}
	 * @desc    判断原生 addEventListener 方法是否可用，二次开发时可以覆盖该方法，返回 false，将使初始化事件绑定调用 _customInitBind 方法
	 * */
	_isAddEventListener(target){
		return 'addEventListener' in target && typeof target.addEventListener === 'function';
	}
	/**
	 * @summary 自定义事件绑定初始化
	 * @protected
	 * @param   {Window|Document|Element|Object}    target
	 * @param   {string}            type
	 * @param   {ListenerCallback}  callback
	 * @param   {Object}            options
	 * @desc    当前函数为空，目的为二次开发提供的抽象接口，二次开发时可覆盖该方法
	 * */
	_customInitBind(target, type, callback, options){}
	/**
	 * @summary 判断原生 removeEventListener 方法是否可用
	 * @protected
	 * @param   {Window|Document|Element}    target
	 * @return  {boolean}
	 * @desc    判断原生 removeEventListener 方法是否可用，自定义开发时可以覆盖该方法，返回 false，将使事件解绑调用 _customRemoveBind 方法
	 * */
	_isRemoveEventListener(target){
		return 'removeEventListener' in target && typeof target.removeEventListener === 'function';
	}
	/**
	 * @summary 自定义事件解绑
	 * @protected
	 * @param   {Window|Document|Element|Object}    target
	 * @param   {string}            type
	 * @param   {ListenerCallback}  callback
	 * @param   {Object}            options
	 * @desc    当前函数为空，目的为二次开发提供的抽象接口，二次开发时可覆盖该方法
	 * */
	_customRemoveBind(target, type, callback, options){

	}

	// ---------- 公有方法 ----------
	/**
	 * @summary 添加监听事件
	 * @param   {Window|Document|Element|Object|string} target
	 * @param   {string|ListenerCallback}           type
	 * @param   {ListenerCallback|Object|boolean}   [callback={}]
	 * @param   {Object|boolean}                    [options={}]
	 * @param   {boolean}                           [options.capture]
	 * @param   {boolean}                           [options.passive]
	 * @param   {boolean}                           [options.once]
	 * @param   {boolean}                           [options.attribute]         type 为 mutationObserver 时使用
	 * @param   {string[]}                          [options.attributeFilter]   type 为 mutationObserver 时使用
	 * @param   {boolean}                           [options.attributeOldValue] type 为 mutationObserver 时使用
	 * @param   {boolean}                           [options.characterData]     type 为 mutationObserver 时使用
	 * @param   {boolean}                           [options.characterDataOldValue] type 为 mutationObserver 时使用
	 * @param   {boolean}                           [options.childList]             type 为 mutationObserver 时使用
	 * @param   {boolean}                           [options.subtree]               type 为 mutationObserver 时使用
	 * @return  {Object}    返回一个带有 trigger 方法的对象，可以用来触发此次绑定的事件
	 * @desc    可以传四个参数，最少传两个参数，若只传两个参数会视为 type 和 callback
	 * */
	on(target, type, callback, options){
		let initBind = false
			, targetConfig
			, eventConfig
			, handlers
			, key
			, args = this._handleArgs( ...arguments )
			,
			{ capture } = args
			;

		({target, type, callback, options} = args);

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
			else if( type === Listener.ResizeObserver ){
				this._initResizeObserver();
				this._resize$.observe( target );
			}
			else if( this._isAddEventListener(target) ){
				eventConfig.callback = function(...args){
					return handlers.with( this ).line( ...args );
				};

				target.addEventListener(type, eventConfig.callback, options);
			}
			else{   // 定制事件绑定
				this._customInitBind(target, type, callback, options);
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
	 * @param   {string|ListenerCallback}           type
	 * @param   {ListenerCallback|Object|boolean}   [callback={}]
	 * @param   {Object|boolean}                    [options={}]
	 * @param   {boolean}                           [options.capture]
	 * @param   {boolean}                           [options.passive]
	 * @param   {boolean}                           [options.once]
	 * @return  {Listener}  返回 this，可以使用链式操作
	 * @desc    可以传四个参数，最少传一个参数，若只传一个参数会视为 type
	 *          当 type 为 mutationObserver 时会取消对 target 的所有类型观察，无视 options 里的设置
	 * */
	off(target, type, callback, options){
		let eventConfig
			, handlers
			, args = this._handleArgs( ...arguments )
			,
			{ capture } = args
			;

		({target, type, callback, options} = args);

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
			// MutationObserver 没有 unobserve 方法
			if( this._callbackList.has(target) ){
				delete this._callbackList.get( target )[this._getKey( Listener.MutationObserver )];
			}

		}
		else if( type === Listener.ResizeObserver ){
			this._resize$.unobserve( target );
		}
		else if( this._isRemoveEventListener(target) ){
			target.removeEventListener(type, eventConfig.callback, options);
		}
		else{   // 定制事件解绑
			this._customRemoveBind(target, type, callback, options);
		}

		delete this._callbackList.get( target )[this._getKey(type, capture)];

		return this;
	}
	/**
	 * @summary 触发执行事件
	 * @param   {Window|Document|Element|Object}    target
	 * @param   {string|boolean|*}    type  当 type 为 boolean 类型会视为 capture
	 * @param   {boolean}   [capture=false]
	 * @param   {...*}      [args]          触发事件时传递的参数
	 * @return  {*}
	 * */
	trigger(target, type, capture=false, ...args){
		let eventConfig
			, handlers
			;

		if( typeof capture !== 'boolean' ){
			args.unshift( capture );
			capture = false;    // 设置会默认值
		}

		if( typeof type !== 'string' ){
			if( typeof type === 'boolean' ){
				capture = type;
			}
			else{
				args.unshift( type );
			}

			type = '';
		}

		if( typeof target === "string" ){
			type = target;
			target = null;
		}

		if( !target ){
			target = self;
		}

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
	 * @readonly
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