'use strict';

import maple    from '../../../dist/lib/base.js';

let i = 0
	, throttleTest = maple.util.throttle(()=>{
		console.log('throttle', i);
	}, 1000)
	, throttleLeadingTest = maple.util.throttle(()=>{
		console.log('throttle leading', i);
	}, 1000, true)
	, mainInterval = setInterval(()=>{
		++i;

		if( i < 200 ){
			console.log( i );
			throttleTest();
			throttleLeadingTest();
		}
		else{
			clearInterval( mainInterval );
		}

	}, 200)
;
