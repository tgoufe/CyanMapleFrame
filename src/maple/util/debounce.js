'use strict';

/**
 * @file    防抖函数
 *          保证函数只在固定时间内最后一次触发才执行
 * */

/**
 * @summary     防抖函数
 * @function    debounce
 * @memberOf    maple.util
 * @param       {Function}  func
 * @param       {Number}    wait
 * @param       {Function}  cancelCB    上一次计时器取消时调用
 * @return      {Function}
 * */
let debounce = function(func, wait, cancelCB){
	let timeout = null
		, result = function(){
			let that = this || null
				, argv = [].slice.call( arguments )
				;

			if( timeout ){
				clearTimeout( timeout );
			}

			timeout = setTimeout(function(){
				func.apply(that, argv || []);
			}, wait);
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
	 * 立刻调用函数
	 * */
	result.immediate = function(context=null, argv=[]){
		result.cancel();

		func.apply(context, argv);
	};


	return result;
};

export default debounce;