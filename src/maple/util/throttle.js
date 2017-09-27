'use strict';

/**
 * @file    节流函数
 *          保证一个函数在固定的时间内只执行一次
 * */

/**
 * @summary     节流函数
 * @function    throttle
 * @memberOf    maple.util
 * @param       {Function}  func
 * @param       {Number}    wait
 * @param       {Function}  cancelCB    当前操作无法执行时的回调函数
 * @return      {Function}
 * */
let throttle = function(func, wait, cancelCB){
	let timeout = null
		, result = function(){
			let that = this || null
				, argv = [].slice.call( arguments )
				;

			if( !timeout ){
				func.apply(that, argv || []);

				timeout = setTimeout(function(){
					clearTimeout( timeout );
					timeout = null;
				}, wait);
			}
		}
		;

	/**
	 * 取消计时器
	 * */
	result.cancel = function(){
		if( timeout ){
			clearTimeout( timeout );
			timeout = null;

			cancelCB && cancelCB();
		}
	};

	/**
	 * 取消定时器，立即执行
	 * @param   {Object}    [context=null]  执行函数时的 this 指向
	 * @param   {Array}     [argv=[]]       执行函数时的传入参数
	 * */
	result.immediate = function(context=null, argv=[]){
		result.cancel();

		func.apply(context, argv);
		
		timeout = setTimeout(function(){
			clearTimeout( timeout );
			timeout = null;
		}, wait);
	};

	return result;
};

export default throttle;