'use strict';

import maple    from '../../../src/maple/base.js';

let router = maple.router
	;

router.register({
	path: '/a/index.html'
	, callback(params){
		console.log('a', params);
	}
});

router.register({
	path: '/b/index.html'
	, callback(params){
		console.log('b', params)
	}
});

router.register({
	path: '/c/index.html'
	, callback(params){
		console.log('c', params);
	}
});

let a = ['a', 'b', 'c']
	, i = 0
	, timer = setInterval(()=>{
		i++;

		if( i > 10 ){
			clearInterval( timer );
		}
		else{
			let rs = router.go(`/${a[i%3]}/index.html`, {['p'+ a[i%3]]: a[i%3]})
				;

			console.log( rs );
		}
	}, 3000)
	;