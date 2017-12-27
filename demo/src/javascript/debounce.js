'use strict';

import maple    from '../../../src/maple/base.js';
import log      from '../log.js';

let i = 0
	, debounceTest = maple.util.debounce(()=>{
		log('debounce', i);
	}, 1000)
	, debounceMaxTest = maple.util.debounce(()=>{
		log('debounce max', i);
	}, 1000, 4000)
	, mainInterval = setInterval(()=>{
		++i;

		if( i < 200 ){
			log( i );
			debounceTest();
			debounceMaxTest();
		}
		else{
			clearInterval( mainInterval );
		}

	}, 200)
	;
