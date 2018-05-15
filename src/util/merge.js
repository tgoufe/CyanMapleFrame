'use strict';

/**
 * @file    将 2 个对象合并成一个新的对象
 * */

/**
 * @summary     将 2 个对象合并成一个新的对象
 * @function    merge
 * @memberOf    maple.util
 * @param       {Object}    target
 * @param       {Object}    defaults
 * @return      {object}
 * */
let merge = function(target, defaults){
	return {
		...defaults
		, ...target
	};
};

export default merge;