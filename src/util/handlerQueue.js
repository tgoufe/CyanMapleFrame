'use strict';

class HandlerQueue{
	/**
	 * @constructor
	 * */
	constructor(){
		this._queue = [];
		this._currIndex = 0;
	}

	// ---------- 公有函数 ----------
	/**
	 * @summary 向队列中添加 handler
	 * @param   {Function}  handler
	 * @return  {number}    handler 队列的长度，删除时使用该值 -1
	 * */
	add(handler){
		if( typeof handler === 'function' ){
			return this._queue.push( handler );
		}
		else{
			return -1;
		}
	}
	/**
	 * @summary 队列中是否存在该 handler
	 * @param   {Function}  handler
	 * @return  {boolean}
	 * */
	has(handler){
		return this._queue.indexOf( handler ) !== -1;
	}
	/**
	 * @summary 从队列中移除相应的 handler
	 * @param   {number|Function}   findBy
	 * */
	remove(findBy){

		if( typeof findBy === 'function' ){
			findBy = this._queue.indexOf( findBy );
		}
		else if( typeof findBy === 'number' ){
			findBy = parseInt( findBy );    // 去掉小数
		}
		else{
			return;
		}

		if( findBy > -1 ){
			this._queue[findBy] = null;
		}
	}
	/**
	 * @summary 清空队列
	 * */
	empty(){
		this._queue = [];
		this._currIndex = 0;
	}
	/**
	 * @summary 队列中是否还有剩余
	 * @return  {boolean}
	 * */
	remain(){
		return this._currIndex < this._queue.length;
	}
	/**
	 * @summary 按顺序返回队列中的 handler
	 * @return  {Function|null}
	 * @desc    当队列为空时或到队列末尾时返回 null
	 * */
	next(){
		let result = null
			, i = this._currIndex
			, j = this._queue.length
			;
		
		if( j ){
			for(; i < j; i++ ){
				result = this._queue[i];

				if( result !== null ){
					break;
				}
			}
			if( i !== j ){
				this._currIndex = i +1;
			}
		}

		return result;
	}
	/**
	 * @summary 重置队列
	 * */
	reset(){
		this._currIndex = 0;
	}
	/**
	 * @summary 执行队列中的一个 handler，内部指针将指向下一个 handler
	 * @param   {Object}    [context=null]
	 * @param   {...*}      [args]
	 * @return  {*}
	 * @desc    当传入参数时，参数被视为传入 handler 的参数
	 * */
	fire(context=null, ...args){
		return this.next().apply(context, args);
	}

	/**
	 * @summary 执行队列中的全部 handler，将返回一个结果数组
	 * @param   {...*}
	 * @return  {Array} 数组中将不包括已失效
	 * @desc    当传入参数时，参数被视为传入 handler 的参数（所有 handler 都会传入相同的参数），全部执行后会重置
	 * */
	fireAll(){
		let args = arguments
			;

		this.reset();

		return this._queue.reduce((all, h)=>{
			if( h !== null ){
				all.push( h(...args) );
			}

			return all;
		}, []);
	}
	/**
	 * @summary 以指定上下文的方式执行队列中的全部 handler，将返回一个结果数组
	 * @param   {Element|Window|Object} context=null
	 * @param   {Array|*}               [args=[]]
	 * @return  {*}
	 * */
	fireAllWith(context=null, args=[]){
		this.reset();

		if( !Array.isArray(args) ){
			args = [args];
		}

		return this._queue.reduce((all, h)=>{
			if( h !== null ){
				all.push( h.apply(context, args) );
			}

			return all;
		}, []);
	}
	/**
	 * @summary 顺序执行队列中的全部 handler，前一个 handler 的返回结果觉得下一个 handler 是否执行
	 * @param   {...*}
	 * @return  {boolean|undefined}
	 * @desc    当 handler 返回 false 时，将终止队列的中后续 handler 的执行
	 * */
	fireLine(){
		let args = arguments
			;

		this.reset();

		return !this._queue.some((h)=>{
			if( h !== null ){
				return h( ...args ) === false;
			}

			return false;
		});
	}
	/**
	 * @summary 以指定上下文的方式顺序执行队列中的全部 handler，前一个 handler 的返回结果觉得下一个 handler 是否执行
	 * @param   {Element|Window|Object} context=null
	 * @param   {Array|*}               [args=[]]
	 * @return  {*}
	 * */
	fireLineWith(context=null, args=[]){
		this.reset();

		if( !Array.isArray(args) ){
			args = [args];
		}

		return !this._queue.some((h)=>{
			if( h !== null ){
				return h.apply(context, args) === false;
			}

			return false;
		});
	}
	/**
	 * @summary 用 reduce 的形式执行队列中的全部 handler，即前一个 handler 的返回结果作为下一个 handler 的参数
	 * @param   {*}         [init]
	 * @return  {Promise}
	 * @desc    当传入参数时，参数被视为传入第一个 handler 的参数，全部执行后会重置
	 *          由于为 reduce 方式调用，将只允许传入一个初始参数，并且原则上所有 handler 都应只有一个参数
	 *          由于为 reduce 方式调用，将返回 Promise 类型的结果
	 * */
	fireReduce(init){
		
		this.reset();

		return this._queue.reduce((promise, h)=>{
			if( h !== null ){
				return promise.then( rs=>h( rs ) );
			}

			return promise;
		}, Promise.resolve(init));
	}
	/**
	 * @summary 以指定上下文的方式用 reduce 的形式执行队列中的全部 handler，即前一个 handler 的返回结果作为下一个 handler 的参数
	 * @param   {Element|Window|Object} context=null
	 * @param   {*}                     [init]
	 * @return  {Promise}
	 * @desc    当传入 init 参数时，参数被视为传入第一个 handler 的参数，全部执行后会重置
	 *          由于为 reduce 方式调用，将只允许传入一个初始参数，并且原则上所有 handler 都应只有一个参数
	 *          由于为 reduce 方式调用，将返回 Promise 类型的结果
	 * */
	fireReduceWith(context=null, init){

		this.reset();


		return this._queue.reduce((promise, h)=>{
			if( h !== null ){
				return promise.then( rs=>h.call(context, rs) );
			}
			
			return promise;
		}, Promise.resolve(init));
	}

	map(){
		return
	}

	compose(){
		return {
			fire: (context, ...args)=>{

			}
		}
	}

	pipe(){

	}

	context(context, argv){
		// fire
	}

	all(){}

	line(){}

	reduce(){}
}

export default HandlerQueue;