'use strict';

/**
 * @file    输出 log 函数
 * */

let debug = true
	/**
	 * @summary 设置是否为 debug 模式
	 * @function
	 * @memberOf    maple.util
	 * @param       {boolean}   set
	 * */
	, setDebug = function(set){
		debug = set;
	}
	/**
	 * @summary 输出 log
	 * @function
	 * @memberOf    maple.util
	 * @param       {...string} msg
	 * */
	, log = function(...msg){
		debug && console.log( ...msg );
	}
	;

export default log;

export {
	setDebug
};