'use strict';

import maple    from '../../../dist/lib/base.js';

let i = 0
	, debounceTest = maple.util.debounce(()=>{
		console.log('debounce', i);
	}, 1000)
	, debounceMaxTest = maple.util.debounce(()=>{
		console.log('debounce max', i);
	}, 1000, 4000)
	, mainInterval = setInterval(()=>{
		++i;

		if( i < 200 ){
			console.log( i );
			debounceTest();
			debounceMaxTest();
		}
		else{
			clearInterval( mainInterval );
		}

	}, 200)
	;
