'use strict';

/**
 * @file    beforeUnload 事件
 * */

import {listener}   from '../listener.js';

/**
 * @memberOf    maple.view
 * @type        {Listener}
 * */
let beforeunload = listener('beforeUnload')
	;

export default beforeunload;