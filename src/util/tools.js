'use strict';

/**
 * @namespace   maple.util.tools
 * */

/**
 * @summary     将数字转成字符串在前面补 0
 * @function    fillZero
 * @memberOf    maple.util.tools
 * @param       {number|string} str
 * @param       {number}        len
 * @return      {string}
 * */
let fillZero = function(str, len){
	return `${str}`.padStart(len, '0');

	// let i
	// 	;
	//
	// str += '';
	//
	// if( len > str.length ){
	// 	for(i = str.length; i < len; i++){
	// 		str = '0'+ str;
	// 	}
	// }
	//
	// return str;
};

export default {
	fillZero
};