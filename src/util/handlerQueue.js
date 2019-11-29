'use strict';

let compose = (...fns)=>{
		return (param)=>{
			return fns.reduceRight((rs, fn)=>{
				return fn( rs );
			}, param);
		}
	}
	, pipe = (...fns)=>{
		return (param)=>{
			return fns.reduce((rs, fn)=>{
				return fn( rs );
			}, param)
		}
	}
	;

function executor(tasks){
	return Promise.all( tasks.slice(1).reduce((all, task)=>{

		all.push( all[all.length - 1].then( task ).catch( ()=>null ) );

		return all;
	}, [tasks[0]()]) )
}

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
	 // * @param   {Object}    [context=null]
	 * @param   {...*}      [args]
	 * @return  {*}
	 * @desc    当传入参数时，参数被视为传入 handler 的参数
	 * */
	fire(...args){
		return this.next()( ...args );
	}

	all(...args){
		return this._queue.reduce((rs, handler)=>{
			if( handler !== null ){
				rs.push( handler(...args) );
			}

			return rs;
		}, []);
	}
	compose(...args){
		return this._queue.reduceRight((params, handler)=>{
			if( handler === null ){
				return params;
			}

			return [handler( ...params )];
		}, args);
	}
	pipe(...args){
		return this._queue.reduce((params, handler)=>{
			if( handler === null ){
				return params;
			}

			return [handler( ...params )];
		}, args);
	}
	line(...args){
		return !this._queue.some((handler)=>{
			if( handler === null ){
				return false;
			}

			return handler( ...args ) === false;
		});
	}

	with(context){
		return {
			fire: (...args)=>{
				return this.next().apply(context, args);
			}
			, all: (...args)=>{
				return this._queue.reduce((rs, handler)=>{
					if( handler !== null ){
						rs.push( handler.apply(context, args) );
					}

					return rs;
				}, []);
			}
			, compose: (...args)=>{
				return this._queue.reduceRight((params, handler)=>{
					if( handler === null ){
						return params;
					}

					return [handler.apply(context, params)];
				}, args);
			}
			, pipe: (...args)=>{
				return this._queue.reduce((params, handler)=>{
					if( handler === null ){
						return params;
					}

					return [handler.apply(context, params)];
				}, args);
			}
			, line: (...args)=>{
				return !this._queue.some((handler)=>{
					if( handler === null ){
						return false;
					}

					return handler.apply(context, args) === false;
				});
			}
			, promise: {
				all: (...args)=>{
					return Promise.all( this._queue.reduce((rs, handler)=>{
						if( handler !== null ){
							rs.push( handler.apply(context, args) );
						}

						return rs;
					}, []) );
				}
				, compose: (...args)=>{
					return this._queue.reduceRight((promise, handler)=>{
						if( handler === null ){
							return promise;
						}

						return promise.then((params)=>{
							return handler.apply(context, params);
						}).then((rs)=>{
							return [rs];
						});
					}, Promise.resolve(args));
				}
				, pipe: (...args)=>{
					return this._queue.reduce((promise, handler)=>{
						if( handler === null ){
							return promise;
						}

						return promise.then((args)=>{
							return handler.apply(context, args);
						}).then((rs)=>{
							return [rs];
						});
					}, Promise.resolve(args));
				}
				, line: (...args)=>{
					return !this._queue.reduce((promise, handler)=>{
						if( handler === null ){
							return promise;
						}

						return promise.then((rs)=>{
							if( rs === false ){
								return Promise.reject();
							}

							return handler( ...args );
						});
					}, Promise.resolve());
				}
			}
		};
	}

	get promise(){
		return {
			all: (...args)=>{
				return Promise.all( this._queue.reduce((rs, handler)=>{
					if( handler !== null ){
						rs.push( handler(...args) );
					}

					return rs;
				}, []) );
			}
			, compose: (...args)=>{
				return this._queue.reduceRight((promise, handler)=>{
					if( handler === null ){
						return promise;
					}

					return promise.then((params)=>{
						return handler( ...params );
					}).then((rs)=>{
						return [rs];
					});
				}, Promise.resolve(args));
			}
			, pipe: (...args)=>{
				return this._queue.reduce((promise, handler)=>{
					if( handler === null ){
						return promise;
					}

					return promise.then((params)=>{
						return handler( ...params );
					}).then((rs)=>{
						return [rs];
					});
				}, Promise.resolve(args));
			}
			, line: (...args)=>{
				return !this._queue.reduce((promise, handler)=>{
					if( handler === null ){
						return promise;
					}

					return promise.then((rs)=>{
						if( rs === false ){
							return Promise.reject();
						}

						return handler( ...args );
					});
				}, Promise.resolve());
			}
		};
	}
}

export default HandlerQueue;