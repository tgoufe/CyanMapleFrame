'use strict';

/**
 * @file    计时函数
 *          对一个 Promise 进行计时
 * */

/**
 * @summary     计时函数
 * @function    timeout
 * @memberOf    maple.util
 * @param       {Promise}   promise
 * @param       {number}    wait
 * @return      {Promise<*, Error>}
 * @desc        对一个 Promise 进行计时，当超过时间后会 reject
 * */
let timeout = function(promise, wait){
		return Promise.race([
			promise
			, new Promise((resolve, reject)=>{
				setTimeout(()=>{
					reject( new Error('执行超时') )
				}, wait);
			})
		]);
	}
	;

export default timeout;