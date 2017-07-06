'use strict';

import Listener     from '../listener.js';

/**
 * @memberOf    maple.view
 * @type        {Listener}
 * */
let beforeunload = new Listener({
	type: 'beforeunload'
	, target: window
});

export default beforeunload;