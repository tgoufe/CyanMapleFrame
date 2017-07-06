'use strict';

import Listener     from '../listener.js';

/**
 * @memberOf    maple.view
 * @type        {Listener}
 * */
let unload = new Listener({
	type: 'unload'
	, target: window
});

export default unload;