'use strict';

/**
 * @file    全局事件 resize
 *          使用捕捉方式
 * */

import Listener from './listener.js';

/**
 * @memberOf    maple.view
 * @type        {Listener}
 * */
let resize = new Listener({
		eventType: 'resize'
	})
	;

export default resize;