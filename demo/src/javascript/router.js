'use strict';

import maple    from '../../../src/maple/base.js';

let router = new maple.Router({
		mode: maple.device.weixin ? 'hash' : 'history'
		, routers: [{
			path: '/a/index.html'
			, callback(params){
				addLog('a: '+ JSON.stringify(params));
			}
		}, {
			path: '/b/index.html'
			, callback(params){
				addLog('b: '+ JSON.stringify(params));
			}
		}, {
			path: '/c/index.html'
			, callback(params){
				addLog('c: '+ JSON.stringify(params));
			}
		}]
	})
	;

router.register({
	path: '/d/index.html'
	, callback(params){
		addLog('d: '+ JSON.stringify(params));
	}
});

let addLog = (log)=>{
		let t = document.createElement('p')
			;

		t.innerHTML = location.href +'<br>'+ log;

		document.body.appendChild( t );
	}
	;

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

			addLog( rs );
		}
	}, 3000)
	;