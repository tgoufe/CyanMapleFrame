'use strict';

/**
 * @file    防抖函数
 *          保证函数只在固定时间内最后一次触发才执行
 * */

/**
 * @summary     防抖函数
 * @function    debounce
 * @memberOf    maple.util
 * @param       {Function}          func
 * @param       {number}            wait
 * @param       {Function|number}   [cancelCB]  上一次计时器取消时调用，若为 number 类型视为 maxWait，cancelCB 设为 null
 * @param       {number}            [maxWait]
 * @return      {Function}
 * */
let debounce = function(func, wait, cancelCB, maxWait){
	let timeout = null
		, maxWaitTimeout = null
		, maxWaitOpts = null
		, result = function(...argv){
			let that = this || null
				;

			if( timeout ){
				clearTimeout( timeout );

				maxWaitOpts = {
					context: that
					, argv
				};
			}

			if( maxWait && maxWait > wait ){  // 设置最大等待时间

				if( !maxWaitTimeout ){  // 当前不在最大等待时间中
					maxWaitTimeout = setTimeout(function(){
						func.apply(maxWaitOpts.context, maxWaitOpts.argv);

						if( timeout ){
							clearTimeout( timeout );
							timeout = null;
						}

						maxWaitTimeout = null;
					}, maxWait);
				}
			}

			timeout = setTimeout(function(){
				func.apply(that, argv);

				if( maxWaitTimeout ){
					clearTimeout( maxWaitTimeout );
					maxWaitTimeout = null;
				}

			}, wait);
		}
		;

	if( typeof cancelCB === 'number' ){
		maxWait = cancelCB;

		cancelCB = null;
	}

	/**
	 * 取消计时器
	 * */
	result.cancel = function(){
		if( maxWaitTimeout ){
			clearTimeout( maxWaitTimeout );
			maxWaitTimeout = null;
		}

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