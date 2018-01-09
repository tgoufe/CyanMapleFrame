'use strict';

import maple    from 'maple';
import log      from '../log.js';

let i = 0
	, throttleTest = maple.util.throttle(()=>{
		log('throttle', i);
	}, 1000)
	, throttleLeadingTest = maple.util.throttle(()=>{
		log('throttle leading', i);
	}, 1000, true)
	, mainInterval = setInterval(()=>{
		++i;

		if( i < 200 ){
			log( i );
			throttleTest();
			throttleLeadingTest();
		}
		else{
			clearInterval( mainInterval );
		}

	}, 200)
;
