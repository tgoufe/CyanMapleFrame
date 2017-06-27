'use strict';

import Listener     from './listener.js';

/**
 * @memberOf    maple.view
 * @type        {Listener}
 * */
let unload = new Listener({
	eventType: 'unload'
	, eventTarget: window
});

export default unload;