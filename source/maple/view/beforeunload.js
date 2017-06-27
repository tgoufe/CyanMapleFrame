'use strict';

import Listener     from './listener.js';

/**
 * @memberOf    maple.view
 * @type        {Listener}
 * */
let beforeunload = new Listener({
	eventType: 'beforeunload'
	, eventTarget: window
});

export default beforeunload;