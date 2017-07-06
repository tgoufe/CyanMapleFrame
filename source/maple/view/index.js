'use strict';

/**
 * @file    view    视图功能聚合
 * */

/**
 * @namespace   maple.view
 * */

import listener     from '../listener.js';

import resize       from './resize.js';
import scroll       from './scroll.js';
import deviceMotion from './deviceMotion.js';

// todo ? 实现页面回退刷新
import pageShow     from './pageShow.js';

/**
 * 统计将用的的事件
 * */
import beforeunload from './beforeunload.js';
import unload       from './unload.js';

let needRefreshOn = false

	/**
	 * @summary     设置页面刷新
	 * @function
	 * @memberOf    maple.view
	 * */
	, needRefresh = ()=>{
		if( needRefreshOn ){
			return ;
		}

		window.onpagehide = ()=>{
			window.onpageshow = ()=>{
				location.reload();
			}
		};

		needRefreshOn = true;
	}
	;

/**
 * @exports view
 * */
export default {
	listener
	, resize
	, scroll
	, deviceMotion

	, pageShow

	, beforeunload
	, unload
	
	, needRefresh
}