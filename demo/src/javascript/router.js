'use strict';

import maple    from 'maple';
import log      from '../log.js';

let router = new maple.Router({
		mode: maple.device.weixin ? 'hash' : 'history'
		// mode: 'hash'
		, routers: [{
			path: '/a/index.html'
			, callback(params){
				log('a: '+ JSON.stringify(params));
			}
		}, {
			path: '/b/index.html'
			, callback(params){
				log('b: '+ JSON.stringify(params));
			}
		}, {
			path: '/c/index.html'
			, callback(params){
				log('c: '+ JSON.stringify(params));
			}
		}]
	})
	;

router.register({
	path: '/d/index.html'
	, callback(params){
		log('d: '+ JSON.stringify(params));
	}
});

let a = ['a', 'b', 'c', 'd']
	, i = 0
	, timer = setInterval(()=>{
		i++;

		if( i > 10 ){
			clearInterval( timer );
		}
		else{
			let rs = router.go(`/${a[i%4]}/index.html`, {['p'+ a[i%4]]: a[i%4]})
				;

			log( rs );
		}
	}, 3000)
	;