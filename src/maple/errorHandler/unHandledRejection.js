'use strict';

import {listener} from "../listener";

/**
 * @memberOf    maple
 * @type        {Listener}
 * */
let unHandledRejection = listener('unhandledrejection')
	;

export default unHandledRejection;