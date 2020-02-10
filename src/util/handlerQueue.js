'use strict';

import Base from '../base.js'

/**
 * @class
 * @desc    对函数队列统一进行操作，目前有 all、line、pipe 和 compose 四个方法
 * @extends Base
 * */
class HandlerQueue extends Base{
	/**
	 * @constructor
	 * */
	constructor(){
		super();
		this._handlers = [];
	}

	// ---------- 静态方法 ----------
	/**
	 * @summary 判断某一对象是否为 HandlerQueue 类型
	 * @static
	 * @param   {*}         target
	 * @return  {boolean}   返回结果
	 * */
	static is(target){
		return target && target[Symbol.toStringTag] === 'HandlerQueue';
	}
	/**
	 * @summary 与 App 类约定的注入接口
	 * @static
	 * @param   {Object}    app
	 * @desc    注入为 $handlers
	 * */
	static inject(app){
		app.inject('$handlers', new HandlerQueue());
	}

	// ---------- 私有方法 ----------
	/**
	 * @summary 返回 all 方法内部执行的抽象函数
	 * @param   {Object}    [context=null]
	 * @param   {Array}     [args=[]]
	 * @return  {Function}
	 * */
	_allExecutor(context=null, args=[]){
		/**
		 * @summary all 方法内部执行的迭代函数
		 * @param   {Array}                 rs
		 * @param   {Function|HandlerQueue} handler
		 * @return  {Array}
		 * */
		return (rs, handler)=>{
			if( handler !== null ){
				if( HandlerQueue.is(handler) ){
					rs.push( ...handler.with( context ).all( ...args ) );
				}
				else{
					rs.push( handler.apply(context, args) );
				}
			}

			return rs;
		};
	}
	/**
	 * @summary 返回 compose 和 pipe 方法内部执行的抽象函数
	 * @param   {string}    method          取值有 'compose' 和 'pipe'
	 * @param   {Object}    [context=null]
	 * @param   {Array}     [args=[]]
	 * @return  {Function}
	 * */
	_funcExecutor(method, context=null, args=[]){
		let first = true
			;

		/**
		 * @summary compose 和 pipe 方法内部执行的迭代函数
		 * @param   {Function|HandlerQueue|*}   params
		 * @param   {Function|HandlerQueue}     handler
		 * @return  {*}
		 * */
		return (params, handler)=>{
			if( first && (params || handler) ){
				first = false;

				if( params === null ){
					params = handler;
					handler = null;
				}

				if( HandlerQueue.is(params) ){
					params = params.with( context )[method]( ...args );
				}
				else if( handler !== null ){
					params = params.apply(context, args);
				}
			}

			if( handler !== null ){
				if( HandlerQueue.is(handler) ){
					return handler.with( context )[method]( params );
				}
				else{
					return handler.call(context, params);
				}
			}

			return params;
		};
	}
	/**
	 * @summary 返回 line 方法内部执行的抽象函数
	 * @param   {Object}    [context=null]
	 * @param   {Array}     [args=[]]
	 * @return  {Function}
	 * */
	_lineExecutor(context=null, args=[]){
		/**
		 * @summary line 方法内部执行的迭代函数
		 * @param   {Function|HandlerQueue}     handler
		 * @return  {boolean}
		 * */
		return (handler)=>{
			if( handler !== null ){
				if( HandlerQueue.is(handler) ){
					return handler.with( context ).line( ...args );
				}
				else{
					return handler.apply(context, args) === false;
				}
			}

			return false;
		};
	}
	/**
	 * @summary 返回以 promise 方式执行 compose 和 pipe 方法内部执行的抽象函数
	 * @param   {string}    method  取值有 'compose' 和 'pipe'
	 * @param   {Object}    [context=null]
	 * @param   {Array}     [args=[]]
	 * @return  {Function}
	 * */
	_funcExecutorPromise(method, context=null, args=[]){
		let first = true
			;

		/**
		 * @summary 以 promise 方式 compose 和 pipe 方法内部执行的迭代函数
		 * @param   {Function|HandlerQueue|Promise<*>}  promise
		 * @param   {Function|HandlerQueue}             handler
		 * @return  {Promise<*>}
		 * */
		return (promise, handler)=>{
			if( first && (promise || handler) ){
				first = false;

				if( promise === null ){
					promise = handler;
					handler = null;
				}

				if( HandlerQueue.is(promise) ){
					promise = promise.with( context ).promise[method]( ...args );
				}
				else if( handler !== null ){
					promise = Promise.resolve( promise.apply(context, args) );
				}
			}

			if( handler !== null ){
				return promise.then((params)=>{
					if( HandlerQueue.is(handler) ){
						return handler.with( context )[method]( params );
					}
					else{
						return handler.call(context, params);
					}
				});
			}

			return promise;
		};
	}
	/**
	 * @summary 返回以 promise 方式执行 line 方法内部执行的抽象函数
	 * @param   {Object}    [context=null]
	 * @param   {Array}     [args=[]]
	 * @return  {Function}
	 * */
	_lineExecutorPromise(context=null, args=[]){
		/**
		 * @summary 以 promise 方式 line 方法内部执行的迭代函数
		 * @param   {Promise<boolean>}      promise
		 * @param   {Function|HandlerQueue} handler
		 * @return  {Promise<boolean>}
		 * */
		return (promise, handler)=>{
			if( handler !== null ){
				return promise.then((rs)=>{
					if( rs === false ){
						return Promise.reject();
					}

					if( HandlerQueue.is(handler) ){
						return handler.with( context ).promise.line( ...args );
					}
					else{
						return handler.apply(context, args);
					}
				});
			}

			return promise;
		};
	}

	// ---------- 公有函数 ----------
	/**
	 * @summary 向队列中添加 handler
	 * @param   {Function|HandlerQueue} handler
	 * @return  {number}                handler 队列的长度，删除时使用该值 -1
	 * @desc    可以添加 HandlerQueue 类型的的参数
	 * */
	add(handler){
		if( typeof handler === 'function' || HandlerQueue.is(handler) ){
			return this._handlers.push( handler );
		}
		else{
			return -1;
		}
	}
	/**
	 * @summary 队列中是否存在该 handler
	 * @param   {Function|HandlerQueue} handler
	 * @return  {boolean}
	 * */
	has(handler){
		return this._handlers.indexOf( handler ) !== -1;
	}
	/**
	 * @summary 从队列中移除相应的 handler
	 * @param   {number|Function|HandlerQueue}  findBy
	 * */
	remove(findBy){
		if( typeof findBy === 'function' || HandlerQueue.is(findBy) ){
			findBy = this._handlers.indexOf( findBy );
		}
		else if( typeof findBy === 'number' ){
			findBy = parseInt( findBy );    // 去掉小数
		}
		else{
			return;
		}

		if( findBy > -1 ){
			this._handlers[findBy] = null;
		}
	}
	/**
	 * @summary 清空队列
	 * */
	clear(){
		this._handlers = [];
	}

	/**
	 * @summary 同时执行所有 handler，将返回结果作为一个数组返回
	 * @param   {...*}  [args]
	 * @return  {Array} 数组中将不包括已失效
	 * @desc    当传入参数时，参数被视为传入 handler 的参数（所有 handler 都会传入相同的参数）
	 *          若 handler 是 HandlerQueue 类型，将会执行其 all 方法将返回的结果评级的放入数组中
	 * */
	all(...args){
		return this._handlers.reduce(this._allExecutor(null, args), []);
	}
	/**
	 * @summary 依次执行队列中的全部 handler，前一个 handler 的返回结果决定下一个 handler 是否执行
	 * @param   {...*}      [args]
	 * @return  {boolean}
	 * @desc    当 handler 返回 false 时，将终止队列的中后续 handler 的执行
	 *          若 handler 是 HandlerQueue 类型，将会执行其 line 方法
	 * */
	line(...args){
		return !this._handlers.some( this._lineExecutor(null, args) );
	}
	/**
	 * @summary 用 reduce 的形式执行队列中的全部 handler，即前一个 handler 的返回结果作为下一个 handler 的参数
	 * @param   {...*}  [args]
	 * @return  {*}
	 * @desc    当传入参数时，参数被视为传入第一个 handler 的参数
	 *          由于为 reduce 方式调用，将只允许第一个执行 handler（即第一个） 有多参数，其它 handler 都应只有一个参数
	 *          若 handler 是 HandlerQueue 类型，将会执行其 pipe 方法
	 * */
	pipe(...args){
		return this._handlers.reduce( this._funcExecutor('pipe', null, args) );
	}
	/**
	 * @summary 为 pipe 方法的逆序，用 reduceRight 的形式执行队列中的全部 handler，即前一个 handler 的返回结果作为下一个 handler 的参数
	 * @param   {...*}  [args]
	 * @return  {*}
	 * @desc    当传入参数时，参数被视为传入最后一个 handler 的参数
	 *          由于为 reduce 方式调用，将只允许第一个执行 handler（即最后一个）有多参数，其它 handler 都应只有一个参数
	 *          若 handler 是 HandlerQueue 类型，将会执行其 compose 方法
	 * */
	compose(...args){
		return this._handlers.reduceRight( this._funcExecutor('compose', null, args) );
	}
	/**
	 * @summary 指定上下文，返回执行 handler 队列的方法集合
	 * @param   {Object}    [context=null]
	 * @return  {Object}    以 context 为上下文的方法集合
	 * */
	with(context=null){
		/**
		 * @summary 指定在 context 的上下文中，同时执行所有 handler，将返回结果作为一个数组返回
		 * @param   {...*}  [args]
		 * @return  {Array} 数组中将不包括已失效
		 * @desc    当传入参数时，参数被视为传入 handler 的参数（所有 handler 都会传入相同的参数）
		 *          若 handler 是 HandlerQueue 类型，将会执行其 all 方法将返回的结果评级的放入数组中
		 * */
		let all = (...args)=>{
				return this._handlers.reduce(this._allExecutor(context, args), []);
			}
			;

		return {
			all
			/**
			 * @summary 指定在 context 的上下文中，顺序执行队列中的全部 handler，前一个 handler 的返回结果决定下一个 handler 是否执行
			 * @param   {...*}      [args]
			 * @return  {boolean}
			 * @desc    当 handler 返回 false 时，将终止队列的中后续 handler 的执行
			 *          若 handler 是 HandlerQueue 类型，将会执行其 line 方法
			 * */
			, line: (...args)=>{
				return !this._handlers.some( this._lineExecutor(context, args) );
			}
			/**
			 * @summary 指定在 context 的上下文中，用 reduce 的形式执行队列中的全部 handler，即前一个 handler 的返回结果作为下一个 handler 的参数
			 * @param   {...*}  [args]
			 * @return  {*}
			 * @desc    当传入参数时，参数被视为传入第一个 handler 的参数
			 *          由于为 reduce 方式调用，将只允许第一个执行 handler（即第一个） 有多参数，其它 handler 都应只有一个参数
			 *          若 handler 是 HandlerQueue 类型，将会执行其 pipe 方法
			 * */
			, pipe: (...args)=>{
				return this._handlers.reduce( this._funcExecutor('pipe', context, args) );
			}
			/**
			 * @summary 指定在 context 的上下文中，为 pipe 方法的逆序，用 reduceRight 的形式执行队列中的全部 handler，即前一个 handler 的返回结果作为下一个 handler 的参数
			 * @param   {...*}  [args]
			 * @return  {*}
			 * @desc    当传入参数时，参数被视为传入最后一个 handler 的参数
			 *          由于为 reduce 方式调用，将只允许第一个执行 handler（即最后一个）有多参数，其它 handler 都应只有一个参数
			 *          若 handler 是 HandlerQueue 类型，将会执行其 compose 方法
			 * */
			, compose: (...args)=>{
				return this._handlers.reduceRight( this._funcExecutor('compose', context, args) );
			}
			, promise: {
				/**
				 * @summary 指定在 context 的上下文中，以 Promise.all 的方式同时执行所有 handler，将返回结果作为一个数组返回
				 * @param   {...*}  [args]
				 * @return  {Promise<Array>} 数组中将不包括已失效
				 * @desc    当传入参数时，参数被视为传入 handler 的参数（所有 handler 都会传入相同的参数）
				 *          若 handler 是 HandlerQueue 类型，将会执行其 all 方法将返回的结果评级的放入数组中
				 * */
				all: (...args)=>{
					return Promise.all( all(args) );
				}
				/**
				 * @summary 指定在 context 的上下文中，以 promise 串行的方式执行队列中的全部 handler，前一个 handler 的返回结果决定下一个 handler 是否执行
				 * @param   {...*}      [args]
				 * @return  {Promise<boolean>}
				 * @desc    当 handler 返回 false 时，将终止队列的中后续 handler 的执行
				 *          若 handler 是 HandlerQueue 类型，将会执行其 line 方法
				 * */
				, line: (...args)=>{
					return this._handlers.reduce(this._lineExecutorPromise(context, args), Promise.resolve());
				}
				/**
				 * @summary 指定在 context 的上下文中，以 promise 串行的方式执行队列中的全部 handler，即前一个 handler 的返回结果作为下一个 handler 的参数
				 * @param   {...*}  [args]
				 * @return  {Promise<*>}
				 * @desc    当传入参数时，参数被视为传入第一个 handler 的参数
				 *          由于为 reduce 方式调用，将只允许第一个执行 handler（即第一个） 有多参数，其它 handler 都应只有一个参数
				 *          若 handler 是 HandlerQueue 类型，将会执行其 pipe 方法
				 * */
				, pipe: (...args)=>{
					return this._handlers.reduce( this._funcExecutorPromise('pipe', context, args) );
				}
				/**
				 * @summary 指定在 context 的上下文中，为 pipe 方法的逆序，以 promise 串行的方式执行队列中的全部 handler，即前一个 handler 的返回结果作为下一个 handler 的参数
				 * @param   {...*}  [args]
				 * @return  {Promise<*>}
				 * @desc    当传入参数时，参数被视为传入最后一个 handler 的参数
				 *          由于为 reduce 方式调用，将只允许第一个执行 handler（即最后一个）有多参数，其它 handler 都应只有一个参数
				 *          若 handler 是 HandlerQueue 类型，将会执行其 compose 方法
				 * */
				, compose: (...args)=>{
					return this._handlers.reduceRight( this._funcExecutorPromise('compose', context, args) );
				}
			}
		};
	}

	// ---------- 公有属性 ----------
	/**
	 * @summary 返回以 promise 方式执行 handler 队列的方法集合
	 * @return  {Object}
	 * */
	get promise(){
		return {
			/**
			 * @summary 以 Promise.all 的方式同时执行所有 handler，将返回结果作为一个数组返回
			 * @param   {...*}  [args]
			 * @return  {Promise<Array>} 数组中将不包括已失效
			 * @desc    当传入参数时，参数被视为传入 handler 的参数（所有 handler 都会传入相同的参数）
			 *          若 handler 是 HandlerQueue 类型，将会执行其 all 方法将返回的结果评级的放入数组中
			 * */
			all: (...args)=>{
				return Promise.all( this.all(...args) );
			}
			/**
			 * @summary 以 promise 串行的方式执行队列中的全部 handler，前一个 handler 的返回结果决定下一个 handler 是否执行
			 * @param   {...*}      [args]
			 * @return  {Promise<boolean>}
			 * @desc    当 handler 返回 false 时，将终止队列的中后续 handler 的执行
			 *          若 handler 是 HandlerQueue 类型，将会执行其 line 方法
			 * */
			, line: (...args)=>{
				return this._handlers.reduce(this._lineExecutorPromise(null, args), Promise.resolve());
			}
			/**
			 * @summary 以 promise 串行的方式执行队列中的全部 handler，即前一个 handler 的返回结果作为下一个 handler 的参数
			 * @param   {...*}  [args]
			 * @return  {Promise<*>}
			 * @desc    当传入参数时，参数被视为传入第一个 handler 的参数
			 *          由于为 reduce 方式调用，将只允许第一个执行 handler（即第一个） 有多参数，其它 handler 都应只有一个参数
			 *          若 handler 是 HandlerQueue 类型，将会执行其 pipe 方法
			 * */
			, pipe: (...args)=>{
				return this._handlers.reduce( this._funcExecutorPromise('pipe', null, args) );
			}
			/**
			 * @summary 为 pipe 方法的逆序，以 promise 串行的方式执行队列中的全部 handler，即前一个 handler 的返回结果作为下一个 handler 的参数
			 * @param   {...*}  [args]
			 * @return  {Promise<*>}
			 * @desc    当传入参数时，参数被视为传入最后一个 handler 的参数
			 *          由于为 reduce 方式调用，将只允许第一个执行 handler（即最后一个）有多参数，其它 handler 都应只有一个参数
			 *          若 handler 是 HandlerQueue 类型，将会执行其 compose 方法
			 * */
			, compose: (...args)=>{
				return this._handlers.reduceRight( this._funcExecutorPromise('compose', null, args) );
			}
		};
	}
	/**
	 * @summary 实现 toStringTag 接口
	 * @desc    在 Object.prototype.toString.call( new HandlerQueue() ); 时将返回 [object HandlerQueue]
	 * */
	get [Symbol.toStringTag](){
		return 'HandlerQueue';
	}
}

export default HandlerQueue;